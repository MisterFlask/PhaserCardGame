// SmokeTest.ts
//
// A single debug entry point that drives the full sortie loop
// (HQ -> dispatch -> combat -> payout -> HQ -> save/reload) programmatically
// and reports a compact JSON result. Replaces the 8-12 manual eval
// round-trips previously needed to verify the game loop by hand.
//
// Scene-level driver code: this file is allowed to touch Phaser (unlike
// src/campaign/, which must stay Phaser-free). It does not add or change
// any game rules; it only pokes the existing UI the same way a player would.
//
// Usage from the browser console: `await window.runSmokeTest()`.

import { Contract } from '../campaign/Contract';
import { pendingLevels } from '../campaign/Leveling';
import { SortieManager } from '../campaign/SortieManager';
import { PlayerCharacter } from '../gamecharacters/PlayerCharacter';
import { GameState } from '../rules/GameState';
import { CampaignSerializer } from '../saveload/CampaignSerializer';
import { CampaignUiState } from '../screens/campaign/hq_ux/CampaignUiState';
import { SceneChanger } from '../screens/SceneChanger';
import { ActionManager } from './ActionManager';

export interface SmokeTestStep {
    name: string;
    ok: boolean;
    detail: string;
}

export interface SmokeTestResult {
    passed: boolean;
    steps: SmokeTestStep[];
    errors: string[];
}

const SQUAD_SIZE = 3;
const DEFAULT_TIMEOUT_MS = 15000;
const POLL_INTERVAL_MS = 50;

/** Thrown internally to abort the harness cleanly from any step. */
class SmokeTestFailure extends Error {}

async function waitFor(predicate: () => boolean, timeoutMs: number, description: string): Promise<void> {
    const start = Date.now();
    while (!predicate()) {
        if (Date.now() - start > timeoutMs) {
            throw new SmokeTestFailure(`Timed out waiting for: ${description}`);
        }
        await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL_MS));
    }
}

/** Finds the live game object anywhere in a scene's display list by predicate (depth-first). */
function findInScene<T extends Phaser.GameObjects.GameObject>(
    scene: Phaser.Scene,
    predicate: (obj: Phaser.GameObjects.GameObject) => boolean
): T | null {
    const visit = (list: readonly Phaser.GameObjects.GameObject[]): T | null => {
        for (const obj of list) {
            if (predicate(obj)) return obj as T;
            const children = (obj as unknown as { list?: Phaser.GameObjects.GameObject[] }).list;
            if (Array.isArray(children)) {
                const found = visit(children);
                if (found) return found;
            }
        }
        return null;
    };
    return visit(scene.children.list);
}

function getActiveScene(): Phaser.Scene | null {
    return SceneChanger.getCurrentScene();
}

function currentSceneKey(): string {
    return getActiveScene()?.scene.key ?? '(none)';
}

/** Dismisses the post-combat card-reward screen and any board event popup that
 *  may appear (SortieManager has a chance of interrupting a sortie combat
 *  with a narrative event). Both are plain TextBoxButton-derived buttons that
 *  respond to a synthetic 'pointerdown' emit, same as the mapButton pattern. */
function dismissBlockingPopups(scene: Phaser.Scene): string[] {
    const dismissed: string[] = [];

    // General reward screen's "Done" button (see GeneralRewardScreen.ts).
    const doneButton = findInScene<Phaser.GameObjects.GameObject>(
        scene,
        obj => (obj as unknown as { textBoxName?: string }).textBoxName === 'doneButton'
    );
    if (doneButton) {
        doneButton.emit('pointerdown');
        dismissed.push('reward-screen-done');
    }

    // Narrative event window: click the first enabled choice (EventButton
    // instances are TextBoxButton containers added directly to the scene;
    // constructor name is the only public tag available without touching
    // CombatUiManager, which is owned by another agent).
    const eventChoice = findInScene<Phaser.GameObjects.GameObject>(
        scene,
        obj => obj.constructor?.name === 'EventButton'
    );
    if (eventChoice) {
        eventChoice.emit('pointerdown');
        dismissed.push('event-choice');
    }

    return dismissed;
}

/** Picks the first fit-for-duty soldiers off the roster, generically (no
 *  hard-coded names), enough to fill a squad. */
function pickSquad(campaign: CampaignUiState): PlayerCharacter[] {
    return campaign.roster.filter(c => c.isFitForDuty).slice(0, SQUAD_SIZE);
}

async function runSteps(steps: SmokeTestStep[]): Promise<void> {
    const record = (name: string, ok: boolean, detail: string) => {
        steps.push({ name, ok, detail });
    };

    // --- Step 1: starting point ------------------------------------------------
    // A true fresh-campaign reset goes through window.location.reload()
    // (see MainHubPanel.navigateTo, "New Campaign"), which the harness cannot
    // survive (it would blow away its own JS context mid-run). Per the task's
    // documented decision point, we instead require "currently at HQ,
    // mid-campaign" as the clean starting point and note this limitation in
    // the result detail.
    const campaign = CampaignUiState.getInstance();
    const gameState = GameState.getInstance();

    await waitFor(() => currentSceneKey() === 'HqScene', DEFAULT_TIMEOUT_MS, 'HqScene to be active');
    // window.runSmokeTest exists from module load, so a CI runner can call it
    // BEFORE HqScene.create() has registered its event listeners. Capture the
    // leak baselines only once create() has demonstrably finished (navigate
    // listener present), or a boot-time run records 0 and the end-of-loop
    // count of 1 reads as a leak.
    await waitFor(() => (captureListenerCounts()['HqScene.navigate'] ?? 0) >= 1,
        DEFAULT_TIMEOUT_MS, "HqScene create() to finish (navigate listener registered)");
    const listenerCountsAtStart = captureListenerCounts();
    // ActionQueue.lastErrors is a rolling buffer that persists across harness
    // runs within the same page session; only errors recorded from this point
    // on belong to this run.
    const actionQueueErrorCountAtStart = ActionManager.getInstance().actionQueue.lastErrors.length;
    record('at-hq', true,
        'Running from current campaign state at HQ (fresh-campaign reset requires a page reload; ' +
        'harness cannot survive that, so it drives from "current campaign, at HQ" instead).');

    // --- Step 2: dispatch a contract --------------------------------------------
    campaign.ensureContractsPopulated();
    const contract: Contract | undefined = campaign.availableContracts[0];
    if (!contract) {
        throw new SmokeTestFailure('No contracts available on the board to dispatch.');
    }
    const squad = pickSquad(campaign);
    if (squad.length < SQUAD_SIZE) {
        throw new SmokeTestFailure(`Roster does not have ${SQUAD_SIZE} fit-for-duty soldiers (found ${squad.length}).`);
    }

    const moneyBeforeSortie = gameState.moneyInVault;
    campaign.selectedContract = contract;
    SortieManager.getInstance().startSortie(contract, squad);

    await waitFor(() => currentSceneKey() === 'CombatScene', DEFAULT_TIMEOUT_MS, 'CombatScene to launch after dispatch');
    record('dispatch', true, `Dispatched contract "${contract.name}" (${contract.numCombats} combat(s)) with a squad of ${squad.length}.`);

    // --- Step 3: run the sortie's combat(s) to a win -----------------------------
    let combatsWon = 0;
    const sortie = SortieManager.getInstance();
    while (sortie.isActive()) {
        await waitFor(() => currentSceneKey() === 'CombatScene', DEFAULT_TIMEOUT_MS, 'CombatScene active for next fight');
        const scene = getActiveScene();
        if (!scene) throw new SmokeTestFailure('No active scene while combat expected.');

        // Winning one combat can take several press attempts: dismissing a
        // narrative event choice right before the click can SWAP a fresh
        // combat in (cleanupAndRestartCombat resets combatEndHandled, so the
        // mapButton silently ignores the press — the player-facing behavior
        // is "an event ambushed you with another fight"). A human just wins
        // the replacement combat; the harness must too.
        const combatsRemainingBefore = sortie.combatsRemaining();
        const advanced = () => sortie.combatsRemaining() < combatsRemainingBefore || !sortie.isActive();
        const PRESS_ATTEMPTS = 5;
        for (let attempt = 1; attempt <= PRESS_ATTEMPTS && !advanced(); attempt++) {
            // Zero every enemy's hitpoints on every poll tick until the win
            // registers. A single one-shot zero races with cleanupAndRestartCombat
            // (the encounter's enemies may not be populated into combatState yet
            // when this scene transition is first observed, and a swapped-in
            // encounter needs its own zeroing pass).
            const mapButton = await waitForMapButton(scene);
            await waitFor(() => {
                GameState.getInstance().combatState.enemies.forEach(enemy => { enemy.hitpoints = 0; });
                return mapButtonReadyToAdvance(scene);
            }, DEFAULT_TIMEOUT_MS, 'combat-won state (mapButton glow/advance ready)');

            // A card-reward screen (and possibly a narrative event) may be
            // blocking the map button; clear them the same way a player would.
            dismissBlockingPopups(scene);
            // Give any tweens/animations a beat to clear before the next click.
            await new Promise(resolve => setTimeout(resolve, 150));
            dismissBlockingPopups(scene);

            mapButton.emit('pointerdown');
            mapButton.emit('pointerup');

            // Either the press advanced the sortie, or an event swap pulled
            // the win state out from under it (label back to 'Objective') and
            // the next attempt re-wins the replacement combat. A swallowed
            // press with the label still ready just retries after the wait.
            await waitFor(() => advanced() || !mapButtonReadyToAdvance(scene),
                5000, 'press to advance the sortie (or a swapped-in combat to appear)')
                .catch(() => { /* neither observed: retry the full press cycle */ });
        }
        if (!advanced()) {
            throw new SmokeTestFailure(
                `mapButton press did not advance the sortie after ${PRESS_ATTEMPTS} attempts.`);
        }
        combatsWon++;
    }

    await waitFor(() => currentSceneKey() === 'HqScene', DEFAULT_TIMEOUT_MS, 'return to HqScene after sortie resolves');
    record('combat', true, `Won ${combatsWon} combat(s) across the sortie.`);

    // --- Step 4: payout landed, back at HQ --------------------------------------
    // The debrief panel (SortieReportPanel) may be showing; file it like a player
    // would. The panel may not have mounted yet on the first poll tick, so retry
    // the find-and-click INSIDE the waitFor loop (mirrors dismissBlockingPopups'
    // approach) rather than clicking once before polling. Check hasUnviewedReport
    // FIRST and only look for/click the button while it's still true: findInScene
    // ignores visibility, so SortieReportPanel's button is still discoverable
    // (just hidden) after HqScene navigates away from it, and re-clicking it on
    // every poll tick would keep firing its onClick handler (which re-emits
    // 'navigate' and resets whatever panel is now showing, e.g. PromotionPanel).
    await waitFor(() => {
        if (!SortieManager.getInstance().hasUnviewedReport) return true;
        const scene = getActiveScene();
        if (!scene) return false;
        const fileReportButton = findInScene<Phaser.GameObjects.GameObject>(
            scene,
            obj => (obj as unknown as { getText?: () => string }).getText?.()?.includes('File the Report') ?? false
        );
        if (fileReportButton) {
            fileReportButton.emit('pointerdown');
        }
        return !SortieManager.getInstance().hasUnviewedReport;
    }, DEFAULT_TIMEOUT_MS, 'sortie debrief to be filed');

    const moneyAfterSortie = GameState.getInstance().moneyInVault;
    const moneyChanged = moneyAfterSortie !== moneyBeforeSortie;
    if (!moneyChanged) {
        throw new SmokeTestFailure(
            `moneyInVault did not change after sortie resolution (before=${moneyBeforeSortie}, after=${moneyAfterSortie}).`
        );
    }
    record('payout', true, `moneyInVault ${moneyBeforeSortie} -> ${moneyAfterSortie}.`);

    // --- Step 4b: resolve any pending promotions ---------------------------------
    // Filing the debrief may have surfaced HqScene's automatic route to the
    // 'promotion' panel (see HqScene: pendingLevels(c) > 0 trumps the contract
    // board). It's a mandatory pick-1-of-3 card choice per pending level, with
    // an occasional perk-reveal overlay (levels 4/8) gated behind a Continue
    // button. Resolve it the way a player would: click the first card choice,
    // dismiss any perk overlay, repeat until no soldier has a pending level.
    const startingPendingLevels = campaign.roster.reduce((sum, c) => sum + pendingLevels(c), 0);
    let levelsResolved = 0;
    if (startingPendingLevels === 0) {
        record('promotions', true, 'none pending.');
    } else {
        // Each pending level needs its own card-render + click (+ a perk-continue
        // click at levels 4/8) round trip, so a flat DEFAULT_TIMEOUT_MS budget
        // (sized for a single UI wait elsewhere in this file) is too tight once
        // several levels queue up across soldiers. Scale with the queue size,
        // GENEROUSLY: in a hidden tab (the harness's usual habitat) setTimeout
        // polls clamp to ~1s and the panel's card rebuilds ride throttled
        // timers, so one level has been observed to cost 25-50 REAL seconds
        // even though the mechanism is instant in a visible tab. The loop
        // early-exits when the queue empties, so a fat ceiling costs nothing
        // on healthy runs.
        const promotionsTimeoutMs = DEFAULT_TIMEOUT_MS * Math.max(4, startingPendingLevels * 4);
        await waitFor(() => {
            const scene = getActiveScene();
            if (!scene) return false;

            const continueButton = findInScene<Phaser.GameObjects.GameObject>(
                scene,
                obj => (obj as unknown as { textBoxName?: string }).textBoxName === 'promotionContinue'
            );
            if (continueButton) {
                continueButton.emit('pointerdown');
                return false;
            }

            const cardChoice = findInScene<Phaser.GameObjects.GameObject>(
                scene,
                obj => obj.name === 'promotionCardChoice'
            );
            if (cardChoice) {
                cardChoice.emit('pointerdown');
                levelsResolved++;
                return false;
            }

            // Neither a card choice nor a continue button is showing: either the
            // panel hasn't mounted yet (keep polling) or the queue is empty and
            // HqScene has routed away from 'promotion' (done).
            return currentSceneKey() === 'HqScene'
                && campaign.roster.every(c => pendingLevels(c) === 0);
        }, promotionsTimeoutMs, 'all pending promotions to resolve');

        record('promotions', true,
            `Resolved ${levelsResolved} pending level(s) (${startingPendingLevels} were pending after this sortie).`);
    }

    // --- Step 5: save/reload round-trip, HQ-only per house rule 4 ----------------
    if (currentSceneKey() !== 'HqScene') {
        throw new SmokeTestFailure(`Refusing to save/reload outside HqScene (currently ${currentSceneKey()}).`);
    }
    const preSave = {
        vault: GameState.getInstance().moneyInVault,
        rosterSize: campaign.roster.length,
        week: campaign.calendar.week,
    };
    const save = CampaignSerializer.toSave();
    CampaignSerializer.applySave(save);
    const postReload = {
        vault: GameState.getInstance().moneyInVault,
        rosterSize: CampaignUiState.getInstance().roster.length,
        week: CampaignUiState.getInstance().calendar.week,
    };
    const roundTripOk = preSave.vault === postReload.vault
        && preSave.rosterSize === postReload.rosterSize
        && preSave.week === postReload.week;
    if (!roundTripOk) {
        throw new SmokeTestFailure(
            `Save/reload round-trip mismatch: before=${JSON.stringify(preSave)} after=${JSON.stringify(postReload)}.`
        );
    }
    record('save-reload', true,
        `Round-trip via CampaignSerializer preserved vault=£${postReload.vault}, roster=${postReload.rosterSize}, week=${postReload.week}.`);

    // --- Step 6: cross-cutting assertions ----------------------------------------
    // lastErrors is a capped rolling buffer (see ActionQueue.lastErrors); only
    // count errors that landed after this run started.
    const newActionQueueErrors = ActionManager.getInstance().actionQueue.lastErrors
        .slice(actionQueueErrorCountAtStart);
    if (newActionQueueErrors.length > 0) {
        throw new SmokeTestFailure(
            `ActionQueue recorded ${newActionQueueErrors.length} new error(s) during this run: ${JSON.stringify(newActionQueueErrors)}`
        );
    }

    const listenerCountsAtEnd = captureListenerCounts();
    const grew = Object.entries(listenerCountsAtEnd).filter(
        ([key, count]) => count > (listenerCountsAtStart[key] ?? 0)
    );
    if (grew.length > 0) {
        throw new SmokeTestFailure(
            `Listener count(s) grew across the loop: ${grew.map(([k, v]) => `${k}: ${listenerCountsAtStart[k] ?? 0} -> ${v}`).join(', ')}`
        );
    }
    record('assertions', true,
        `No action-queue errors; listener counts stable (${JSON.stringify(listenerCountsAtEnd)}).`);
}

/** Snapshot of the listener counts previously identified as prone to
 *  accumulation (commit b8ce9b1): HqScene's navigate/returnToHub handlers. */
function captureListenerCounts(): Record<string, number> {
    const hqScene = (window as any).game?.scene?.getScene?.('HqScene') as Phaser.Scene | undefined;
    if (!hqScene) return {};
    return {
        'HqScene.navigate': hqScene.events.listenerCount('navigate'),
        'HqScene.returnToHub': hqScene.events.listenerCount('returnToHub'),
    };
}

async function waitForMapButton(scene: Phaser.Scene): Promise<Phaser.GameObjects.GameObject> {
    let button: Phaser.GameObjects.GameObject | null = null;
    await waitFor(() => {
        button = findInScene<Phaser.GameObjects.GameObject>(
            scene,
            obj => (obj as unknown as { textBoxName?: string }).textBoxName === 'mapButton'
        );
        return button !== null;
    }, DEFAULT_TIMEOUT_MS, 'mapButton to exist in the combat scene');
    return button!;
}

/** True once the scene has flipped combatEndHandled (mapButton text moves off
 *  the default "Objective" label — see CombatAndMapScene.update()). */
function mapButtonReadyToAdvance(scene: Phaser.Scene): boolean {
    const button = findInScene<Phaser.GameObjects.GameObject>(
        scene,
        obj => (obj as unknown as { textBoxName?: string }).textBoxName === 'mapButton'
    ) as unknown as { getText?: () => string } | null;
    // getText() returns raw BBCode (e.g. "[stroke]Continue[/stroke]"), so match
    // on substring rather than exact equality.
    const label = button?.getText?.() ?? '';
    return label.includes('Continue') || label.includes('Return to HQ');
}

export async function runSmokeTest(): Promise<SmokeTestResult> {
    const steps: SmokeTestStep[] = [];
    try {
        await runSteps(steps);
        return { passed: true, steps, errors: [] };
    } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        // Steps already recorded before the failure stay in the result;
        // never throw out of the harness.
        return {
            passed: false,
            steps,
            errors: [message],
        };
    }
}
