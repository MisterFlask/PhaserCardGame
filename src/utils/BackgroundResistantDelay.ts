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
