// Headless combat simulator: plays a full combat (StartCombatAction ->
// alternating player-policy turns and enemy intents -> win/loss) through
// the REAL rules pipeline (ActionManager, ActionQueue, buffs, procs,
// CombatRules) with no Phaser scene at all.
//
// Not vitest-viable: PlayerCharacter/AutomatedCharacter transitively import
// AbstractCard, which imports the `phaser` package at module level (see
// TODO.md's "DOM test environment: CLOSED NEGATIVE" entry -- Phaser's
// WebGLRenderer trips over a webpack DefinePlugin dead-code branch under
// raw Node/happy-dom). The realistic bar is running this in a real browser
// with no live scene, driven via a window.runHeadlessCombat(...) debug
// hook (see scripts/qa-headless-combat.mjs). If you're reading this
// planning to wire it into vitest: don't -- that spike is closed negative
// until Phaser itself is patched.
//
// GameState/ActionManager are process-wide singletons, so a headless
// combat run mutates the SAME GameState the live game would use. This is
// fine for a standalone QA harness (nothing else is using GameState at the
// same time) but means: don't call this from code paths that expect
// GameState to be left alone, and don't call it concurrently with a live
// scene's combat.

import { PlayerCharacter } from '../../gamecharacters/PlayerCharacter';
import { AutomatedCharacterType } from '../../Types';
import { ActionManager } from '../../utils/ActionManager';
import { setHeadlessZeroDelay } from '../../utils/BackgroundResistantDelay';
import { SubtitleManager } from '../../ui/SubtitleManager';
import { GameState } from '../../rules/GameState';
import { IPlayPolicy } from './IPlayPolicy';
import { setActiveHeadlessPolicy } from './HeadlessPolicyRegistry';

export interface HeadlessCombatParams {
    /** Player squad for this combat. Must already have cardsInMasterDeck
     *  populated (e.g. via CharacterGenerator.getInstance().generateRandomCharacter()). */
    players: PlayerCharacter[];
    /** Enemy squad. Pass fresh instances per call -- ActSegment's static
     *  encounter tables are shared module-level singletons and will
     *  accumulate state (hitpoints, buffs) across combats if reused. */
    enemies: AutomatedCharacterType[];
    /** Decision-making seam for the player side; see IPlayPolicy.ts. */
    policy: IPlayPolicy;
    /** Safety valve against a policy/rules interaction that never ends the
     *  combat (e.g. a policy that always ends turn immediately against
     *  enemies with 0 damage output). Counts full player-turn cycles. */
    maxTurns?: number;
}

export interface CombatResult {
    victory: boolean;
    /** True only when maxTurns was hit with neither side dead. */
    timedOut: boolean;
    turns: number;
    survivingPlayerHp: { name: string; hitpoints: number; maxHitpoints: number }[];
    survivingEnemyHp: { name: string; hitpoints: number; maxHitpoints: number }[];
    log: string[];
    /** Populated from ActionQueue.lastErrors captured during this run only. */
    queueErrors: { action: string; message: string; atMs: number }[];
}

const DEFAULT_MAX_TURNS = 100;
/** Real-world safety timeout per combat, independent of maxTurns, in case a
 *  queued action hangs despite ActionQueue's own 5000ms-per-action
 *  watchdog (e.g. an infinite chain of newly-queued actions). */
const WALL_CLOCK_TIMEOUT_MS = 30000;

async function waitForQueueIdle(actionManager: ActionManager, timeoutMs: number): Promise<void> {
    const start = Date.now();
    let pollCount = 0;
    while (!actionManager.actionQueue.isIdle()) {
        if (Date.now() - start > timeoutMs) {
            throw new Error(`ActionQueue did not idle within ${timeoutMs}ms.`);
        }
        // Microtask polling for the first several ticks (fast path -- most
        // actions resolve in well under a macrotask's clamped ~4ms floor),
        // falling back to a real setTimeout periodically so a
        // pathologically long chain doesn't spin the microtask queue
        // forever and starve rendering/other browser work.
        pollCount++;
        if (pollCount % 20 === 0) {
            await new Promise(resolve => setTimeout(resolve, 0));
        } else {
            await Promise.resolve();
        }
    }
}

function combatIsOver(gameState: GameState): 'victory' | 'defeat' | null {
    const combatState = gameState.combatState;
    const enemiesAlive = combatState.enemies.some(e => e.hitpoints > 0);
    const playersAlive = combatState.playerCharacters.some(p => p.hitpoints > 0);
    if (!enemiesAlive) return 'victory';
    if (!playersAlive) return 'defeat';
    return null;
}

/** Runs one full headless combat and returns its outcome. Safe to call
 *  repeatedly in a loop (each call resets combatState fully via
 *  StartCombatAction / gameState.currentRunCharacters reassignment). */
export async function runHeadlessCombat(params: HeadlessCombatParams): Promise<CombatResult> {
    const { players, enemies, policy, maxTurns = DEFAULT_MAX_TURNS } = params;
    const log: string[] = [];
    const gameState = GameState.getInstance();
    const actionManager = ActionManager.getInstance();

    // No scene: ActionManager.init(scene) is never called, so
    // actionManager.scene stays undefined and every sceneIsLive()-guarded
    // call (animations, tweens, event emits) no-ops per the July prereqs.
    // SubtitleManager needs an explicit headless init since it throws if
    // constructed with no scene ever provided; initHeadless() is a no-op if
    // some instance (headless or scene-backed) already exists.
    SubtitleManager.initHeadless();
    setHeadlessZeroDelay(true);
    setActiveHeadlessPolicy(policy);

    const queueErrorCountAtStart = actionManager.actionQueue.lastErrors.length;
    const startedAtMs = Date.now();
    const timedOutGuard = () => Date.now() - startedAtMs > WALL_CLOCK_TIMEOUT_MS;

    try {
        gameState.currentRunCharacters = players;
        gameState.combatState.enemies = enemies;
        gameState.combatState.playerCharacters = players;

        actionManager.startCombat();
        await waitForQueueIdle(actionManager, WALL_CLOCK_TIMEOUT_MS);

        let turns = 0;
        let outcome: 'victory' | 'defeat' | null = combatIsOver(gameState);

        while (outcome === null && turns < maxTurns && !timedOutGuard()) {
            turns++;
            log.push(`--- Turn ${turns} (energy ${gameState.combatState.energyAvailable}) ---`);

            // Player policy plays cards until it ends its turn or runs out
            // of legal plays (choosePlay returning 'endTurn' either way).
            let playsThisTurn = 0;
            const MAX_PLAYS_PER_TURN = 50; // guards a policy/card interaction that never drains energy
            while (playsThisTurn < MAX_PLAYS_PER_TURN && !timedOutGuard()) {
                outcome = combatIsOver(gameState);
                if (outcome) break;

                const choice = policy.choosePlay();
                if (choice.kind === 'endTurn') {
                    break;
                }
                playsThisTurn++;
                log.push(`play: ${choice.card.name}${choice.target ? ' -> ' + choice.target.name : ''}`);

                const physicalCardStub = { data: choice.card } as unknown as Parameters<typeof actionManager.playCard>[0];
                const played = actionManager.playCard(physicalCardStub, choice.target);
                if (!played) {
                    // Policy thought this was legal but ActionManager disagreed
                    // (e.g. a race in energy bookkeeping); stop this turn's
                    // plays rather than spin forever on the same illegal choice.
                    log.push(`  (rejected by ActionManager, ending turn)`);
                    break;
                }
                await waitForQueueIdle(actionManager, WALL_CLOCK_TIMEOUT_MS);
            }

            outcome = combatIsOver(gameState);
            if (outcome) break;

            actionManager.endTurn();
            await waitForQueueIdle(actionManager, WALL_CLOCK_TIMEOUT_MS);

            outcome = combatIsOver(gameState);
        }

        const timedOut = outcome === null;
        const victory = outcome === 'victory';

        const queueErrors = actionManager.actionQueue.lastErrors.slice(queueErrorCountAtStart);

        return {
            victory,
            timedOut,
            turns,
            survivingPlayerHp: players.map(p => ({ name: p.name, hitpoints: p.hitpoints, maxHitpoints: p.maxHitpoints })),
            survivingEnemyHp: enemies.map(e => ({ name: e.name, hitpoints: e.hitpoints, maxHitpoints: e.maxHitpoints })),
            log,
            queueErrors
        };
    } finally {
        setActiveHeadlessPolicy(null);
        setHeadlessZeroDelay(false);
    }
}
