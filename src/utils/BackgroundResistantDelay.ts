// Main-thread setTimeout is throttled to ~1 tick/second in hidden/backgrounded
// browser tabs, but the combat action pipeline is built from many small
// (20-50ms) delays. In a hidden tab those delays each balloon toward a full
// second, and the ActionQueue's 5000ms watchdog (forceTimeout in
// ActionManager.ts) starts aborting actions that were really just waiting on
// a throttled timer. Web Worker timers are NOT subject to this throttling
// (same reasoning as installBackgroundStepper in CombatAndMapScene.ts), so we
// hand the actual waiting off to a worker and only use the main thread to
// route the resolution back to the right caller.

let worker: Worker | null = null;
let workerUnavailable = false;
let nextId = 0;
const pending = new Map<number, () => void>();

// Headless combat simulation (src/combat/sim/HeadlessCombat.ts) drives
// thousands of these delays per combat with no human waiting on a screen;
// collapsing them to setImmediate-speed (but still yielding a tick, so the
// ActionQueue's pop/await ordering is unchanged) is the difference between
// a combat taking milliseconds and it taking real wall-clock seconds. This
// is a deliberate global switch, not per-call plumbing, because the delay
// is invoked from many call sites (WaitAction, DrawCardsAction,
// ExhaustCardAction, ActionQueue.resolveActions) that call the free
// function directly rather than through an overridable method.
let headlessZeroDelay = false;

export function setHeadlessZeroDelay(enabled: boolean): void {
    headlessZeroDelay = enabled;
}

function getWorker(): Worker | null {
    if (worker) {
        return worker;
    }
    if (workerUnavailable) {
        return null;
    }
    try {
        const workerSource = `onmessage = function (e) { setTimeout(function () { postMessage(e.data.id); }, e.data.ms); };`;
        const created = new Worker(URL.createObjectURL(
            new Blob([workerSource], { type: 'application/javascript' })
        ));
        created.onmessage = (event: MessageEvent) => {
            const id = event.data as number;
            const resolve = pending.get(id);
            if (resolve) {
                pending.delete(id);
                resolve();
            }
        };
        if (typeof window !== 'undefined') {
            window.addEventListener('beforeunload', () => created.terminate());
        }
        worker = created;
        return worker;
    } catch {
        // Worker unavailable (strict CSP, headless test runner, etc.): degrade
        // to plain setTimeout and don't retry construction on every call.
        workerUnavailable = true;
        return null;
    }
}

export function backgroundResistantDelay(ms: number): Promise<void> {
    if (headlessZeroDelay) {
        // A queued macrotask (setTimeout, even at 0ms) is clamped to ~4ms by
        // browsers once nesting depth passes the HTML5 spec's threshold --
        // negligible for a human-paced UI but ruinous when a single headless
        // combat fires this call 100+ times (draw/play/damage/state-based
        // effects all funnel through here). A microtask still yields (so
        // this stays a real async boundary, not a synchronous call) without
        // that floor.
        return Promise.resolve();
    }

    const activeWorker = typeof Worker === 'undefined' ? null : getWorker();

    if (!activeWorker) {
        return new Promise<void>(resolve => setTimeout(resolve, ms));
    }

    return new Promise<void>(resolve => {
        const id = nextId++;
        pending.set(id, resolve);
        activeWorker.postMessage({ id, ms });
    });
}

export function _isUsingWorkerDelays(): boolean {
    return worker !== null;
}
