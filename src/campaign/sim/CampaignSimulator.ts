// Pure, Phaser-free campaign economy simulator. Plays N quarters of the
// contract-board / wages / dividends / hardening loop headlessly, so balance
// regressions (e.g. the wages gap where hoarding was strictly optimal) show
// up in `npm test` instead of waiting on a human playtest.
//
// House rule 1: only imports Phaser-free campaign modules. Soldiers are
// modeled as plain records here — this module must NOT import
// CampaignUiState, GameState, PlayerCharacter, or anything under
// src/screens or src/gamecharacters.
//
// Combat itself is abstracted to parameters (sortieWinRate,
// woundChancePerSoldier, deathChancePerSoldier) rather than simulated card
// by card — ActionManager/the combat scene are scene-bound and cannot run
// headless (see CLAUDE.md "Known sharp edges").
//
// RNG discipline: ContractGenerator uses Math.random() internally for board
// generation (squad size, payout jitter, region/template picks) — that
// nondeterminism is accepted as-is and NOT controlled here. Every decision
// this simulator itself makes (contract selection among the generated
// board, win/wound/death rolls, recruiting) is driven through the injected
// `rng` parameter so a seeded run is reproducible modulo ContractGenerator's
// own internal randomness.

import { CampaignCalendar, WAGE_PER_SOLDIER_PER_QUARTER, WEEKS_PER_QUARTER } from "../CampaignCalendar";
import { Contract } from "../Contract";
import { ContractGenerator } from "../ContractGenerator";
import { StandingOrdersState } from "../orders/StandingOrdersState";
// Real constant (Phaser-free, src/campaign/RushTreatment.ts) — imported
// directly rather than hand-mirrored like SIM_RECRUIT_COST/SIM_ROSTER_CAP
// below, since it already lives somewhere legal for this module to import.
import { RUSH_TREATMENT_COST_PER_WEEK } from "../RushTreatment";

/**
 * Mirrors CampaignUiState.RECRUIT_COST (src/screens/campaign/hq_ux/CampaignUiState.ts).
 * Duplicated here rather than imported because CampaignUiState transitively
 * pulls in Phaser (house rule 1) — keep this number in sync by hand if the
 * real constant changes.
 */
export const SIM_RECRUIT_COST = 80;

/**
 * Mirrors CampaignUiState.ROSTER_CAP (src/screens/campaign/hq_ux/CampaignUiState.ts).
 * Same duplication rationale as SIM_RECRUIT_COST.
 */
export const SIM_ROSTER_CAP = 8;

/** A soldier as far as the economy sim is concerned — no cards, no buffs. */
export interface SimSoldier {
    id: number;
    xp: number;
    level: number;
    /** Absolute calendar week the soldier becomes available again; 0 = fit for duty now. */
    woundedUntilWeek: number;
}

export interface CombatModel {
    /** Chance a single sortie (all its combats) ends in a win. */
    sortieWinRate: number;
    /** Per-soldier chance of being wounded, rolled independently on a win. */
    woundChancePerSoldier: number;
    /** Per-soldier chance of dying outright, rolled independently on a win (small). */
    deathChancePerSoldier: number;
    /** Wound duration range in weeks (inclusive), mirrors SortieResolution's WOUND_WEEKS_MIN/MAX. */
    woundWeeksMin: number;
    woundWeeksMax: number;
}

export const DEFAULT_COMBAT_MODEL: CombatModel = {
    sortieWinRate: 0.9,
    woundChancePerSoldier: 0.15,
    deathChancePerSoldier: 0.02,
    woundWeeksMin: 2,
    woundWeeksMax: 4,
};

/**
 * A contract-selection policy: given the board and the currently available
 * (unwounded) roster, pick which contract to run next and which soldiers to
 * send, or null to sit the week out (no affordable/sensible option).
 * Policies must only use `rng` for any randomized tie-breaking, never
 * Math.random.
 */
export interface ContractPolicy {
    name: string;
    selectContract(board: Contract[], availableSoldiers: SimSoldier[], rng: () => number): {
        contract: Contract;
        squad: SimSoldier[];
        /** Trade runs only: crates to load (0 for combat contracts). */
        cratesLoaded: number;
    } | null;
}

/** Simple seeded LCG so tests are reproducible without pulling in a dependency. */
export function makeLcgRng(seed: number): () => number {
    let state = seed >>> 0;
    return () => {
        // Numerical Recipes constants.
        state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
        return state / 0xffffffff;
    };
}

function pickSquad(soldiers: SimSoldier[], size: number): SimSoldier[] {
    return soldiers.slice(0, size);
}

/**
 * Healing-spend policy (useRushHealing config knob): only spends when the
 * available (unwounded) roster has dropped to zero, i.e. the roster is
 * completely stalled and cannot muster even the cheapest possible contract
 * (minimum squadSize 2) for the rest of the quarter otherwise. Two earlier,
 * looser triggers were measured and rejected as net-negative for T2 parity
 * (worse than doing nothing): chasing the LARGEST musterable board
 * contract's squad size (paying to marginally upsize a squad that could
 * already muster something), and chasing the SMALLEST musterable board
 * contract's squad size (reacting to a board that happens to be trade-run-
 * heavy, squadSize 3-4 only). Both fired often enough that the RNG-stream/
 * board-refill coupling documented at this file's top (ContractGenerator
 * uses uncontrolled Math.random() internally) dominated: shifting *when*
 * sorties fire cascades into materially different win/wound/death rolls for
 * everything after, so eagerly buying back partial availability didn't
 * reliably pay for itself. Restricting to the true stall floor (zero
 * available) fires far less often (~1-2 times per 16-quarter run) and only
 * when the alternative is certain idle weeks with no income at all — the
 * scenario the T2 gap analysis actually describes ("wound-attrition
 * throughput starvation") — which measured as a small, real, price-
 * insensitive parity nudge (see RushTreatment.ts's cost comment for the
 * £20/£15/£10 frontier measured).
 *
 * Spends RUSH_TREATMENT_COST_PER_WEEK per wound-week (mirrors the Barracks
 * rush-treatment purchase — see src/campaign/RushTreatment.ts) on the
 * nearest-to-fit-for-duty wounded soldier, stopping as soon as that soldier
 * is available again or the vault can't afford another week. Returns the
 * (possibly reduced) vault; mutates the soldier's woundedUntilWeek in place.
 */
function rushHealStalledRoster(
    roster: SimSoldier[],
    board: Contract[],
    currentWeek: number,
    weeksLeftInQuarter: number,
    vault: number,
): number {
    if (board.length === 0) return vault;
    const available = roster.filter(s => s.woundedUntilWeek <= currentWeek);
    // Absolute stall floor only: nobody is fit for duty, so every contract
    // on the board (minimum squadSize 2) is unreachable without healing.
    if (available.length > 0) return vault;
    // Don't spend if nothing on the board could complete in the weeks left
    // this quarter anyway (e.g. the quarter is nearly over) — that would be
    // pure waste, buying availability with no sortie left to spend it on.
    if (!board.some(c => c.durationWeeks <= weeksLeftInQuarter)) return vault;

    // Nearest-to-fit-for-duty first: cheapest to fully clear, so the vault
    // buys back an available soldier for the least spend.
    const wounded = roster
        .filter(s => s.woundedUntilWeek > currentWeek)
        .sort((a, b) => a.woundedUntilWeek - b.woundedUntilWeek);
    const soldier = wounded[0];
    if (!soldier) return vault;

    while (soldier.woundedUntilWeek > currentWeek && vault >= RUSH_TREATMENT_COST_PER_WEEK) {
        vault -= RUSH_TREATMENT_COST_PER_WEEK;
        soldier.woundedUntilWeek -= 1;
    }

    return vault;
}

/** Highest-payout contract the available roster can muster (greedy). */
export const greedyPayout: ContractPolicy = {
    name: "greedyPayout",
    selectContract(board, availableSoldiers) {
        const affordable = board
            .filter(c => c.squadSize <= availableSoldiers.length)
            .sort((a, b) => b.projectedPayout - a.projectedPayout);
        const contract = affordable[0];
        if (!contract) return null;
        return { contract, squad: pickSquad(availableSoldiers, contract.squadSize), cratesLoaded: 0 };
    },
};

/** Prefers the smallest muster (squadSize 2) to minimize bodies at risk / wage overhead. */
export const leanCrewPreference: ContractPolicy = {
    name: "leanCrewPreference",
    selectContract(board, availableSoldiers) {
        const runnable = board.filter(c => c.squadSize <= availableSoldiers.length);
        if (runnable.length === 0) return null;
        // Prefer squadSize 2 contracts; among those (or if none), highest payout.
        const twoManCrews = runnable.filter(c => c.squadSize === 2);
        const pool = twoManCrews.length > 0 ? twoManCrews : runnable;
        const contract = [...pool].sort((a, b) => b.projectedPayout - a.projectedPayout)[0];
        return { contract, squad: pickSquad(availableSoldiers, contract.squadSize), cratesLoaded: 0 };
    },
};

/** Prefers trade runs, always loaded to maxCrates, for the freight-vs-bounty comparison. */
export const maxFreight: ContractPolicy = {
    name: "maxFreight",
    selectContract(board, availableSoldiers) {
        const runnable = board.filter(c => c.squadSize <= availableSoldiers.length);
        if (runnable.length === 0) return null;
        const tradeRuns = runnable.filter(c => c.isTradeRun);
        if (tradeRuns.length > 0) {
            const contract = [...tradeRuns].sort((a, b) => b.maxCrates - a.maxCrates)[0];
            return { contract, squad: pickSquad(availableSoldiers, contract.squadSize), cratesLoaded: contract.maxCrates };
        }
        // No trade run on the board this pass: fall back to greedy payout so
        // the policy still does something useful while waiting for one.
        const contract = [...runnable].sort((a, b) => b.projectedPayout - a.projectedPayout)[0];
        return { contract, squad: pickSquad(availableSoldiers, contract.squadSize), cratesLoaded: 0 };
    },
};

export interface SimulatorConfig {
    combatModel: CombatModel;
    policy: ContractPolicy;
    /** Roster size the sim recruits up to when short and can afford it. */
    targetRosterSize: number;
    /** Quarters to run before giving up (safety net; quartersSurvived reports actual). */
    quarters: number;
    /** Starting vault balance. */
    startingVault: number;
    /** Starting roster size. */
    startingRosterSize: number;
    rng: () => number;
    /**
     * Healing-spend policy knob (economy balance pass, T2 lever). When true,
     * before each muster attempt the sim checks whether the roster has zero
     * soldiers fit for duty (a full stall — no contract, not even the
     * cheapest, is musterable); if so and the vault can afford it, it
     * spends RUSH_TREATMENT_COST_PER_WEEK per wound-week (mirrors the
     * Barracks' rush-treatment purchase) on the soldier closest to
     * recovery, clearing just enough weeksWoundedRemaining to unstall.
     * See rushHealStalledRoster's doc comment for the (measured, rejected)
     * looser trigger designs. Off by default so existing callers/tests are
     * unaffected.
     */
    useRushHealing?: boolean;
    /**
     * Charter Buyback policy knob (VP endgame pivot, src/docs/vp_endgame_design.md).
     * When true, at each quarter boundary from calendar year
     * CHARTER_BUYBACK_MIN_YEAR onward, the sim retires as many £100 blocks
     * as it can while the vault stays above 2x the next quarter's dividend
     * expectation (mirrors the design doc's sim-support policy: "retire
     * shares each quarter from year 8 while vault > 2x next dividend
     * expectation"). Off by default so existing callers/tests are
     * unaffected. Mirrors CampaignUiState.retireSharesForVp/
     * CHARTER_BUYBACK_MONEY_COST/CHARTER_BUYBACK_VP_REWARD/
     * CHARTER_BUYBACK_MIN_YEAR by hand (that module is Phaser-tainted — see
     * SIM_RECRUIT_COST's doc for the same duplication rationale).
     */
    convertLateToVP?: boolean;
}

/** Mirrors CampaignUiState.CHARTER_BUYBACK_MONEY_COST/VP_REWARD/MIN_YEAR
 *  (src/screens/campaign/hq_ux/CampaignUiState.ts). Same duplication
 *  rationale as SIM_RECRUIT_COST. */
export const SIM_CHARTER_BUYBACK_MONEY_COST = 100;
export const SIM_CHARTER_BUYBACK_VP_REWARD = 130;
export const SIM_CHARTER_BUYBACK_MIN_YEAR = 8;

export interface SimulatorResult {
    quartersSurvived: number;
    finalVault: number;
    satisfactionTrajectory: number[];
    sortiesRun: number;
    deaths: number;
    sacked: boolean;
    charterExpired: boolean;
    /** VP banked outside projects: Prestige Commissions (vpReward on won
     *  sorties) + Charter Buyback (convertLateToVP). */
    charterVictoryPoints: number;
    /** finalVault + charterVictoryPoints (project VP is not modeled by this
     *  sim — see design doc "Sim support" clause). */
    score: number;
}

/**
 * Runs the campaign economy loop headlessly for up to config.quarters
 * quarters (stopping early if the board sacks the company or the charter
 * expires). Each quarter: refill the board, run sorties until the quarter's
 * remaining weeks can't fit another, recruit if short and affordable, then
 * let CampaignCalendar.advanceWeeks settle wages + dividend for the weeks
 * consumed.
 *
 * ContractGenerator and StandingOrdersState are process-wide singletons;
 * callers running multiple sims in one process should call
 * StandingOrdersState.getInstance().reset() between runs (this function does
 * so at the start of every call so it's self-contained by default).
 */
export function runCampaignSimulation(config: SimulatorConfig): SimulatorResult {
    const { combatModel, policy, targetRosterSize, quarters, rng, useRushHealing, convertLateToVP } = config;

    // Standing Orders are a process-wide singleton; the sim doesn't exercise
    // orders (no policy enacts any), so reset to a clean/neutral baseline
    // rather than inheriting state from a previous test.
    StandingOrdersState.getInstance().reset();

    const calendar = new CampaignCalendar();
    const contractGenerator = ContractGenerator.getInstance();

    let vault = config.startingVault;
    let board: Contract[] = [];
    let contractsCompleted = 0;
    let nextSoldierId = 1;
    let roster: SimSoldier[] = [];
    for (let i = 0; i < config.startingRosterSize; i++) {
        roster.push({ id: nextSoldierId++, xp: 0, level: 1, woundedUntilWeek: 0 });
    }

    const satisfactionTrajectory: number[] = [];
    let sortiesRun = 0;
    let deaths = 0;
    let quartersSurvived = 0;
    let charterVictoryPoints = 0;

    for (let q = 0; q < quarters; q++) {
        if (calendar.isSacked || calendar.isCharterExpired) break;

        // Recruit up to target if short and the vault can cover it. Recruits
        // join immediately (fit for duty this quarter), mirroring
        // CampaignUiState.hireRecruit's instant-add (no travel time modeled).
        while (roster.length < targetRosterSize && roster.length < SIM_ROSTER_CAP && vault >= SIM_RECRUIT_COST) {
            vault -= SIM_RECRUIT_COST;
            roster.push({ id: nextSoldierId++, xp: 0, level: 1, woundedUntilWeek: 0 });
        }

        // Refill the board (mirrors CampaignUiState.advanceWeeks's board
        // maintenance: age off happens implicitly here since we rebuild the
        // board fresh each quarter rather than carrying deadlines across
        // quarter boundaries — a simplification documented here: the sim
        // does not model individual contract deadlines expiring mid-quarter).
        board = contractGenerator.refillBoard(board, calendar.year, contractsCompleted);

        // Run sorties for as many weeks as fit in this quarter.
        let weeksLeftInQuarter = WEEKS_PER_QUARTER;
        while (weeksLeftInQuarter > 0) {
            if (useRushHealing) {
                vault = rushHealStalledRoster(roster, board, calendar.week, weeksLeftInQuarter, vault);
            }
            const available = roster.filter(s => s.woundedUntilWeek <= calendar.week);
            const choice = policy.selectContract(board, available, rng);
            if (!choice) break;
            if (choice.contract.durationWeeks > weeksLeftInQuarter) break;

            // Muster: contract leaves the board, crates loaded if a trade run.
            board = board.filter(c => c.id !== choice.contract.id);
            choice.contract.cratesLoaded = choice.cratesLoaded;
            sortiesRun++;

            const won = rng() < combatModel.sortieWinRate;
            if (won) {
                vault += choice.contract.projectedPayout;
                // Prestige Commissions pay £0 (projectedPayout collapses to
                // 0) and grant vpReward instead — see design doc "Sim
                // support": "Prestige contracts: sim policies treat vpReward
                // as payout×1.0 for selection but bank it as VP".
                if (choice.contract.isPrestige) {
                    charterVictoryPoints += choice.contract.vpReward;
                }
                contractsCompleted++;
                choice.squad.forEach(soldier => {
                    if (rng() < combatModel.deathChancePerSoldier) {
                        deaths++;
                        roster = roster.filter(s => s.id !== soldier.id);
                    } else if (rng() < combatModel.woundChancePerSoldier) {
                        const weeks = combatModel.woundWeeksMin
                            + Math.floor(rng() * (combatModel.woundWeeksMax - combatModel.woundWeeksMin + 1));
                        soldier.woundedUntilWeek = calendar.week + choice.contract.durationWeeks + weeks;
                    }
                });
            } else {
                // Loss: whole squad wiped (SortieManager.handleSquadWipe), no payout.
                deaths += choice.squad.length;
                const squadIds = new Set(choice.squad.map(s => s.id));
                roster = roster.filter(s => !squadIds.has(s.id));
            }

            weeksLeftInQuarter -= choice.contract.durationWeeks;
            board = contractGenerator.refillBoard(board, calendar.year, contractsCompleted);
        }

        // Settle the quarter: wages, then dividend, via CampaignCalendar's
        // real callback seams (same accounting order as CampaignUiState.advanceWeeks).
        // Each loop iteration starts at a quarter boundary (weekOfQuarter 1),
        // so weeksUntilDividend is always exactly WEEKS_PER_QUARTER here —
        // using the getter keeps this correct even if that invariant changes.
        calendar.advanceWeeks(
            calendar.weeksUntilDividend,
            (amountDue: number) => {
                const paid = Math.min(amountDue, vault);
                vault -= paid;
                return paid;
            },
            () => roster.length * WAGE_PER_SOLDIER_PER_QUARTER,
            (amountDue: number) => {
                const paid = Math.min(amountDue, vault);
                vault -= paid;
                return paid;
            },
        );

        // Charter Buyback policy (convertLateToVP): from year
        // SIM_CHARTER_BUYBACK_MIN_YEAR, retire a £100 block into 130 VP
        // while the vault comfortably clears next quarter's obligations —
        // mirrors the design doc's headline trigger ("vault > 2x next
        // dividend expectation") plus a wage-bill reserve, tuned against
        // CampaignSimulator.test.ts's "Charter Buyback" ratchet:
        //  - The floor reserves 2x next quarter's wage bill on top of the
        //    2x-dividend trigger. Converting down to exactly 2x the
        //    dividend with no wage reserve measured as a real survival-rate
        //    loss (wages settle before the dividend the same meeting —
        //    CampaignCalendar's accounting order — so a bare-dividend floor
        //    starves that meeting's wage bill).
        //  - At most one block converts per quarter (not a greedy drain to
        //    the floor). ContractGenerator's board generation uses
        //    uncontrolled Math.random() internally (see this file's
        //    RNG-discipline note at the top); a larger single-quarter vault
        //    delta between the convert/never-convert runs was measured to
        //    cascade into a materially different sortie sequence entirely
        //    independent of the buyback's own economics, swinging survival
        //    by 20-40 percentage points seed-to-seed noise alone. Capping to
        //    one block/quarter keeps the perturbation small enough for a
        //    stable, repeatable measurement.
        if (convertLateToVP && calendar.year >= SIM_CHARTER_BUYBACK_MIN_YEAR) {
            const nextWageBill = roster.length * WAGE_PER_SOLDIER_PER_QUARTER;
            const solvencyFloor = 2 * calendar.currentDividendExpectation + 2 * nextWageBill;
            if (vault - SIM_CHARTER_BUYBACK_MONEY_COST > solvencyFloor) {
                vault -= SIM_CHARTER_BUYBACK_MONEY_COST;
                charterVictoryPoints += SIM_CHARTER_BUYBACK_VP_REWARD;
            }
        }

        satisfactionTrajectory.push(calendar.shareholderSatisfaction);
        if (!calendar.isSacked) {
            quartersSurvived++;
        }
    }

    return {
        quartersSurvived,
        finalVault: vault,
        satisfactionTrajectory,
        charterVictoryPoints,
        score: vault + charterVictoryPoints,
        sortiesRun,
        deaths,
        sacked: calendar.isSacked,
        charterExpired: calendar.isCharterExpired,
    };
}
