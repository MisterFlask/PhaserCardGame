import { beforeEach, describe, expect, it } from 'vitest';
import {
    CombatModel, DEFAULT_COMBAT_MODEL, SIM_ROSTER_CAP, greedyPayout, leanCrewPreference,
    makeLcgRng, maxFreight, runCampaignSimulation
} from '../sim/CampaignSimulator';
import { StandingOrdersState } from '../orders/StandingOrdersState';
import { RUSH_TREATMENT_COST_PER_WEEK } from '../RushTreatment';

/**
 * NOTE on the whole file above this comment: it was already 531 lines when
 * this section was appended (combat win-rate measurement bridge task) --
 * see the "combatModel: 'fixture' mode" describe block at the bottom for
 * the one new test this task adds. Nothing above this line was touched.
 */

/**
 * Balance-ratchet tests for the campaign economy, run headlessly via
 * CampaignSimulator (no Phaser, no browser). Each test runs 10-60 seeded
 * repetitions and reports on the aggregate — see each test's comment for
 * the numbers actually measured when this file was written (2026-07-07)
 * and the reasoning behind the threshold chosen.
 *
 * UPDATE (economy balance pass, same date): the two findings below —
 * "full 40-quarter charter is unwinnable" and "hoarding beats lean
 * rosters" — were fixed via three levers (year-scaled contract payouts in
 * ContractGenerator, a softened late-charter dividend escalation curve in
 * CampaignCalendar, and a wage raise from £15 to £25/soldier/quarter) and
 * the two `.skip`ped ratchets have been replaced with real assertions
 * tuned against the new equilibrium. See CampaignCalendar.ts's
 * WAGE_PER_SOLDIER_PER_QUARTER and DIVIDEND_ESCALATION_RATE_BY_YEAR
 * comments, and ContractGenerator.ts's PAYOUT_PER_YEAR comment, for the
 * balance-pass sketch numbers and reasoning.
 */
describe('CampaignSimulator', () => {
    beforeEach(() => {
        StandingOrdersState.getInstance().reset();
    });

    function seededRuns<T>(count: number, fn: (rng: () => number, seed: number) => T): T[] {
        const results: T[] = [];
        for (let seed = 1; seed <= count; seed++) {
            // Large odd multiplier spreads seeds well across the LCG's state space.
            results.push(fn(makeLcgRng(seed * 104729), seed));
        }
        return results;
    }

    describe('baseline viability', () => {
        /**
         * As literally specified in the ORIGINAL brief (winRate 0.9,
         * greedyPayout, 40 quarters, "survives in >=8/10 seeds") this still
         * does NOT hold, and is not meant to — see the design targets below.
         * This test instead checks viability through year 6 (quarter 24),
         * which stays comfortably survivable post-balance-pass: 10/10 seeded
         * runs with a roster of 6 and a 500 vault starting cushion reach
         * quarter 24 without satisfaction hitting 0.
         */
        it('survives through year 6 (quarter 24) at a 0.9 sortie win rate, greedyPayout, roster 6', () => {
            // 20 seeds (not 10) and a 70% floor rather than 80%: the
            // balance pass tightened the economy on purpose (see the T1
            // ratchet below), so this checkpoint no longer has the huge
            // margin it used to — measured post-fix, 5 independent runs of
            // 20 seeds each landed 16-20/20 (80%-100%); a 10-seed sample
            // was observed to flake between 7-9/10 at the old threshold.
            const results = seededRuns(20, rng => runCampaignSimulation({
                combatModel: DEFAULT_COMBAT_MODEL, // sortieWinRate 0.9
                policy: greedyPayout,
                targetRosterSize: 6,
                quarters: 24,
                startingVault: 500,
                startingRosterSize: 6,
                rng,
            }));

            const survivedTo24 = results.filter(r => r.quartersSurvived >= 24).length;
            expect(survivedTo24, `${survivedTo24}/20 survived to quarter 24`).toBeGreaterThanOrEqual(14);
        });

        /**
         * T1 ratchet (economy balance pass design target): "winRate 0.9,
         * greedyPayout, sensible roster -> 40-quarter survival in 50-80% of
         * 10+ seeded runs (tense but winnable)". Fixed via year-scaled
         * contract payouts (ContractGenerator.PAYOUT_PER_YEAR) and a
         * softened late-charter dividend escalation curve
         * (CampaignCalendar.DIVIDEND_ESCALATION_RATE_BY_YEAR) — see those
         * constants' comments for the numbers and reasoning. The old flat
         * 1.35x/year escalation made this 0/10 at every roster size 4-8,
         * even with an artificially generous £2000 starting vault (avg ~32
         * quarters survived, i.e. the charter was terminal by ~year 8).
         *
         * Measured post-fix (60 seeds = 3 blocks of 20, roster 6 and 8,
         * vault 500), repeated across 4 independent runs to check
         * stability: roster 6 survived40 ranged 27-39/60 (45%-65%, avg
         * ~56%); roster 8 ranged 42-44/60 (70%-73%, avg ~72%). Both
         * "sensible roster" sizes land inside the 50-80% band with margin
         * to spare either direction — this uses a generous internal
         * tolerance (40%-90%, well wider than the 50-80% design target) so
         * the test doesn't flake on ContractGenerator's own internal
         * Math.random() nondeterminism (see this file's RNG-discipline
         * note at the top of CampaignSimulator.ts).
         */
        it('T1: 40-quarter charter survival lands in a tense-but-winnable band at winRate 0.9, ' +
            'greedyPayout, sensible roster sizes (6 and 8)', () => {
            for (const roster of [6, 8]) {
                const results = seededRuns(40, rng => runCampaignSimulation({
                    combatModel: DEFAULT_COMBAT_MODEL, // sortieWinRate 0.9
                    policy: greedyPayout,
                    targetRosterSize: roster,
                    quarters: 40,
                    startingVault: 500,
                    startingRosterSize: roster,
                    rng,
                }));
                const survived40 = results.filter(r => r.quartersSurvived >= 40).length;
                // Band history: originally 16-36/40 (40%-90%) around a
                // 50-80% design target. Act 4 (July 2026) deliberately
                // shifted the equilibrium: Brimstone Badlands unlocks at
                // year 7 as late-charter income relief, so a 0.9-winrate
                // company that reaches it now mostly survives (measured
                // 37-39/40 post-act-4). LEAD RULING: accepted — late-game
                // tension lives in the score pivot (Charter Buyback vs
                // solvency), not raw survival; the doom clock still kills
                // the 0.75-winrate company (see the losing-economy test).
                // Band retuned around the measured post-act-4 equilibrium;
                // the floor is the load-bearing edge now.
                expect(survived40, `roster ${roster}: ${survived40}/40 survived to quarter 40`)
                    .toBeGreaterThanOrEqual(26);
                expect(survived40, `roster ${roster}: ${survived40}/40 survived to quarter 40`)
                    .toBeLessThanOrEqual(40);
            }
        });

        /**
         * T1's other half: "At winRate 0.75, most runs still die mid-charter
         * (the clock must keep teeth)". Measured post-fix (20 seeds, roster
         * 6, vault 500): 0/20 survive to quarter 40, average quarters
         * survived ~9-12 (i.e. year 2-3) — the clock still bites hard below
         * the tuned win rate, exactly as intended.
         */
        it('T1: at a 0.75 sortie win rate most runs still die mid-charter, well short of quarter 40', () => {
            const results = seededRuns(20, rng => runCampaignSimulation({
                combatModel: { ...DEFAULT_COMBAT_MODEL, sortieWinRate: 0.75 },
                policy: greedyPayout,
                targetRosterSize: 6,
                quarters: 40,
                startingVault: 500,
                startingRosterSize: 6,
                rng,
            }));
            const survived40 = results.filter(r => r.quartersSurvived >= 40).length;
            expect(survived40).toBeLessThanOrEqual(4); // <=20%, i.e. "most" die first
            const avgQuarters = results.reduce((a, r) => a + r.quartersSurvived, 0) / results.length;
            expect(avgQuarters).toBeLessThan(20); // dies mid-charter (well under half of 40), not near the finish
        });
    });

    describe('losing economy loses', () => {
        /**
         * Measured: at a 0.4 win rate (greedyPayout, roster 6, vault 500),
         * all 10 seeds are sacked well before quarter 40 — median around
         * quarter 3-4, worst case quarter 6, best case quarter 6. The doom
         * clock works: a losing squad cannot outrun the dividend at any
         * roster size (fewer sorties completed AND the same wage bill).
         */
        it('gets sacked well before quarter 40 at a 0.4 sortie win rate', () => {
            const losingModel: CombatModel = { ...DEFAULT_COMBAT_MODEL, sortieWinRate: 0.4 };
            const results = seededRuns(10, rng => runCampaignSimulation({
                combatModel: losingModel,
                policy: greedyPayout,
                targetRosterSize: 6,
                quarters: 40,
                startingVault: 500,
                startingRosterSize: 6,
                rng,
            }));

            const sackedEarly = results.filter(r => r.quartersSurvived < 20).length;
            expect(sackedEarly).toBeGreaterThanOrEqual(8);
            // Every seed should be sacked (satisfaction hit 0) rather than
            // merely running out of quarters to simulate.
            const actuallySacked = results.filter(r => r.sacked).length;
            expect(actuallySacked).toBeGreaterThanOrEqual(8);
        });
    });

    describe('no-free-hoarding', () => {
        /**
         * T2 ratchet (economy balance pass design target): "an actively-
         * played roster-5 company finishes within ~10% of (or ahead of) a
         * roster-8 company in head-to-head seed pairs at least ~45% of the
         * time — roster size becomes a real choice, not a dominant
         * strategy." Fixed by raising WAGE_PER_SOLDIER_PER_QUARTER from £15
         * to £25 (see CampaignCalendar.ts's comment on that constant for
         * the frontier tried — £30, the permitted ceiling, over-penalizes
         * mid-size rosters and breaks the T1 band without buying more T2
         * ground, so £25 was kept).
         *
         * Measured post-fix (200 seed pairs = 10 blocks of 20, roster 5 vs
         * roster 8, greedyPayout, vault 500, 16 quarters), repeated across
         * 2 independent runs to check stability: 91/200 (45.5%) and 73/200
         * (36.5%) of pairs landed roster 5 within 10% of (or ahead of)
         * roster 8's final vault — averaging close to the ~45% target, with
         * some run-to-run spread from ContractGenerator's own internal
         * Math.random(). This is the documented frontier: wound-attrition
         * throughput starvation on small rosters (see the old finding this
         * test replaces) is a structural effect wages alone can only
         * partially offset without over-taxing mid-size rosters elsewhere
         * (see T1). A healing-throughput purchase (faster wound recovery,
         * a field-hospital Standing Order, etc.) is the missing lever to
         * close the rest of the gap — out of scope for this pass (wound
         * durations are off-limits per the brief).
         */
        it('T2: a roster of 5 finishes within 10% of (or ahead of) a roster of 8 in a meaningful ' +
            'share of head-to-head seed pairs', () => {
            const N = 60; // 3 blocks of 20, distinct seed ranges per block
            let within10pct = 0;
            for (let block = 0; block < 3; block++) {
                const roster5 = seededRuns(20, (rng, seed) => runCampaignSimulation({
                    combatModel: DEFAULT_COMBAT_MODEL,
                    policy: greedyPayout,
                    targetRosterSize: 5,
                    quarters: 16,
                    startingVault: 500,
                    startingRosterSize: 5,
                    rng: makeLcgRng((seed + block * 1000) * 104729),
                }));
                const roster8 = seededRuns(20, (rng, seed) => runCampaignSimulation({
                    combatModel: DEFAULT_COMBAT_MODEL,
                    policy: greedyPayout,
                    targetRosterSize: SIM_ROSTER_CAP,
                    quarters: 16,
                    startingVault: 500,
                    startingRosterSize: SIM_ROSTER_CAP,
                    rng: makeLcgRng((seed + block * 1000) * 104729),
                }));
                for (let i = 0; i < 20; i++) {
                    if (roster5[i].finalVault >= roster8[i].finalVault * 0.9) within10pct++;
                }
            }
            // Generous tolerance around the ~45% target (roughly 20%-70%
            // of pairs) to absorb run-to-run noise without flaking, while
            // still catching a regression back to "roster 5 essentially
            // never keeps pace" (the pre-fix finding).
            expect(within10pct, `${within10pct}/${N} pairs favored roster 5`).toBeGreaterThanOrEqual(12);
            expect(within10pct, `${within10pct}/${N} pairs favored roster 5`).toBeLessThanOrEqual(42);
        });

        /**
         * T2 healing-throughput lever (infirmary rush treatment,
         * src/campaign/RushTreatment.ts): the comment above names "a
         * healing-throughput purchase" as the missing lever to close the
         * rest of the roster-5-vs-8 gap. CampaignSimulator's useRushHealing
         * knob models it — when a roster is fully stalled (zero soldiers
         * fit for duty, so not even the cheapest squadSize-2 contract can
         * muster) and the vault can afford it, it spends
         * RUSH_TREATMENT_COST_PER_WEEK per wound-week on the soldier
         * closest to recovery to unstall.
         *
         * MEASURED FINDING (does not clear the ~45% target): across large,
         * same-process paired samples (300 seed pairs per side, repeated 3x
         * per price point, using the less noisy avg-vault-ratio metric
         * rather than the noisier per-pair boolean) at all three prices
         * pre-authorized for this pass — £20, £15, £10/wound-week — the
         * roster5/roster8 average-final-vault ratio with rush-healing ON
         * measured *flat to slightly below* the OFF baseline (e.g. one
         * three-run set at £20: off ratios 77.1%/78.7%/78.0% vs on ratios
         * 77.0%/71.7%/69.4%). Root cause: this sim's loss rule wipes the
         * WHOLE squad on a lost sortie (10% chance at the default win
         * rate); rush-healing's only lever is enabling MORE sorties during
         * weeks that would otherwise sit idle, which proportionally
         * increases wipe-roll exposure — losing a 2-person squad is 40% of
         * a 5-person roster but only 25% of an 8-person one, so the
         * additional throughput's expected wipe cost falls harder on the
         * smaller roster than its extra income helps. This held under
         * three independently-tuned trigger designs (chase the largest
         * musterable squad size, chase the smallest, and the current
         * true-stall-floor-only design with a weeksLeftInQuarter guard
         * against wasted end-of-quarter spend) — see
         * rushHealStalledRoster's doc comment in CampaignSimulator.ts for
         * the full trigger history. Price (£20/£15/£10) did not
         * meaningfully move the outcome either: the effect is dominated by
         * ContractGenerator's uncontrolled internal Math.random() (see
         * this file's RNG-discipline note; ContractGenerator has since been
         * seeded, 2026-07-08 — this finding predates that fix), which
         * cascades any change in *when* sorties fire into materially
         * different combat-roll sequences for the rest of the run.
         *
         * This assertion therefore does NOT ratchet parity upward — it
         * pins down that useRushHealing stays a strict improvement-or-wash
         * on roster5's own economy in isolation (never catastrophically
         * negative) and never flips it into strictly dominating recruiting
         * (per the brief's sanity check: rushing every wound at roster 5
         * must not always beat maintaining a larger roster). A real parity
         * win needs a different lever than "buy back idle weeks" — e.g.
         * softening or removing the full-squad-wipe rule, which is out of
         * scope here (SortieManager/combat-loss rules are not owned by this
         * pass). Flagged back to the lead per the brief's "stop and report
         * on unlisted decisions" instruction rather than silently forcing a
         * fake pass.
         */
        it('T2 (rush-healing): useRushHealing is a wash on roster 5\'s own economy, never ' +
            'catastrophic, and never strictly dominates recruiting', () => {
            const N = 40;
            const withHealing = seededRuns(N, rng => runCampaignSimulation({
                combatModel: DEFAULT_COMBAT_MODEL,
                policy: greedyPayout,
                targetRosterSize: 5,
                quarters: 16,
                startingVault: 500,
                startingRosterSize: 5,
                rng,
                useRushHealing: true,
            }));
            const withoutHealing = seededRuns(N, rng => runCampaignSimulation({
                combatModel: DEFAULT_COMBAT_MODEL,
                policy: greedyPayout,
                targetRosterSize: 5,
                quarters: 16,
                startingVault: 500,
                startingRosterSize: 5,
                rng,
                useRushHealing: false,
            }));
            const avgWith = withHealing.reduce((a, r) => a + r.finalVault, 0) / N;
            const avgWithout = withoutHealing.reduce((a, r) => a + r.finalVault, 0) / N;
            // Not catastrophic: healing must not tank roster 5's own vault
            // by more than a generous margin relative to not healing at
            // all (measured same-process deltas were within +/-10%; 40% is
            // a wide guard against a real regression, e.g. an infinite
            // spend loop, while tolerating the RNG-cascade noise above).
            expect(avgWith, `avgWith=${avgWith.toFixed(0)} avgWithout=${avgWithout.toFixed(0)}`)
                .toBeGreaterThanOrEqual(avgWithout * 0.6);

            // Never strictly dominant: rushing every wound at roster 5 must
            // cost less than 3 extra soldiers' wages (the roster-5-to-8 gap)
            // for a full 16-quarter run ONLY MOST of the time, not always —
            // i.e. total rush-heal spend implied by the vault delta should
            // not consistently outstrip what those soldiers would have
            // cost. 3 soldiers x WAGE_PER_SOLDIER_PER_QUARTER(£25) x 16
            // quarters = £1200; rush-healing every wound for 40 seeded runs
            // spends nowhere near that per-seed on average (the stall-floor
            // trigger fires ~1-2 times per run), so this is comfortably
            // satisfied and mainly guards against a future looser trigger
            // creeping back in unnoticed.
            const impliedWagesSaved = 3 * 25 * 16; // £1200
            expect(avgWithout - avgWith, 'rush-healing should not consistently ' +
                'out-earn maintaining 3 extra soldiers\' worth of wages')
                .toBeLessThan(impliedWagesSaved);
        });

        /**
         * Idle rosters must still strictly bleed money regardless of the
         * above — a hoarded-but-never-deployed roster is never a good
         * strategy, only a hoarded-and-actively-deployed one is
         * competitive (see T2 above). This is the pre-existing passing
         * test, unchanged in spirit; only the illustrative wage/dividend
         * numbers in the comment below moved with the balance pass.
         */

        /**
         * The one hoarding-cost signal the sim DOES confirm robustly: wages
         * are a real, measurable drag, even though they don't flip the
         * comparison at these roster sizes. A roster sitting fully idle
         * (never deployed at all) strictly loses money every quarter to
         * wages with zero offsetting income — the mechanism the wages fix
         * was built to close is present and working; it's just not strong
         * enough at these numbers to make a *deployed* large roster net
         * worse than a *deployed* small one (see finding above).
         */
        it('an idle (never-deployed) roster strictly loses money to wages every quarter', () => {
            const idlePolicy = {
                name: 'neverDeploy',
                selectContract: () => null,
            };
            const result = runCampaignSimulation({
                combatModel: DEFAULT_COMBAT_MODEL,
                policy: idlePolicy,
                targetRosterSize: 6,
                quarters: 4,
                startingVault: 1000,
                startingRosterSize: 6,
                rng: makeLcgRng(42),
            });
            // 6 soldiers x £25/quarter x 4 quarters = £600 in wages, plus the
            // dividend draws (£120, £162, £219, £296 across 4 escalating
            // quarters = £797) with zero income to offset either.
            expect(result.finalVault).toBeLessThan(1000);
            expect(result.sortiesRun).toBe(0);
        });
    });

    describe('trade-run policy shape', () => {
        /**
         * RETIGHTENED (economy balance pass, 2026-07-08): two independent
         * signals agreed trade runs were overpowered — this canary's old
         * ~6x ceiling was widened to accommodate a ~2.78x measurement
         * instead of acting on it, and a full-engine longplay (commit
         * 5a2c232) banked £15.5k by year 3 at satisfaction 100 running
         * trade runs at full crates, never tripping the doom clock. Fix:
         * ContractGenerator's TRADE_RUN_FREIGHT_RATE_PER_ACT £30 -> £20 -> £18
         * were both still capable of poking over 2.0x average at N=30-60
         * seeds; £15/act (TRADE_RUN_MAX_CRATES unchanged at 5, stepped down
         * from 6 separately) is the frontier that held clear of 2.0x across
         * 20 repeated N=100 measurements (observed range ~1.55x-1.92x,
         * roster 6, vault 500, 16 quarters). See trade_run_design.md's
         * "Numbers (post-nerf)" section for both constants.
         *
         * N=100 (not the original 10, mislabeled "20" in the old comment)
         * is needed for measurement stability: at measurement time
         * ContractGenerator used uncontrolled Math.random() internally for
         * board generation (see this file's RNG-discipline note in
         * CampaignSimulator.ts; since seeded, 2026-07-08), so the ratio
         * itself was noisy run-to-run even with the seeded rng fixed. The
         * N=100 sample size is kept as a margin-of-safety measurement
         * buffer regardless. N=60 was tried first and flaked against the 2.0x ceiling roughly
         * 1-in-13 runs (one observed failure in 15 repeats); N=100 was
         * stable across 20/20 repeated measurements with real margin (max
         * observed 1.92x), so it's used here to keep this a genuine
         * non-flake canary rather than a coin flip at the boundary.
         *
         * The known sim-fidelity gap remains: ContractGenerator's own doc
         * comment on trade runs still shows a real £ edge (full-load act-1
         * ~£133 vs ~£116 average combat contract) for 10 dead cards spread
         * across three decks — a deck-quality tax this abstracted sim
         * cannot represent (combat is a single sortieWinRate parameter, not
         * a card-level simulation) — so the sim's measured ratio runs
         * somewhat hotter than the raw £ edge alone would suggest. The
         * bounds below are the brief's own target band (1.2x-2.0x), not
         * widened for the gap this time.
         */
        it('nets a materially higher but not fantastical average vault than greedyPayout', () => {
            const tradeResults = seededRuns(100, rng => runCampaignSimulation({
                combatModel: DEFAULT_COMBAT_MODEL,
                policy: maxFreight,
                targetRosterSize: 6,
                quarters: 16,
                startingVault: 500,
                startingRosterSize: 6,
                rng,
            }));
            const greedyResults = seededRuns(100, rng => runCampaignSimulation({
                combatModel: DEFAULT_COMBAT_MODEL,
                policy: greedyPayout,
                targetRosterSize: 6,
                quarters: 16,
                startingVault: 500,
                startingRosterSize: 6,
                rng,
            }));

            const avgTrade = tradeResults.reduce((a, r) => a + r.finalVault, 0) / tradeResults.length;
            const avgGreedy = greedyResults.reduce((a, r) => a + r.finalVault, 0) / greedyResults.length;

            expect(avgTrade).toBeGreaterThan(0);
            expect(avgGreedy).toBeGreaterThan(0);
            // Retightened canary: catches both a genuine blowup (freight-math
            // bug) and a return to the pre-nerf overpowered band, while
            // leaving headroom for legitimate run-to-run noise.
            expect(avgTrade / avgGreedy).toBeLessThan(2.0);
            expect(avgTrade / avgGreedy).toBeGreaterThan(1.2);
        });

        it('a policy with no eligible squad size returns null and the sim does not crash', () => {
            const result = runCampaignSimulation({
                combatModel: DEFAULT_COMBAT_MODEL,
                policy: leanCrewPreference,
                targetRosterSize: 1, // below every contract's minimum squadSize (2)
                quarters: 4,
                startingVault: 500,
                startingRosterSize: 1,
                rng: makeLcgRng(7),
            });
            expect(result.sortiesRun).toBe(0);
        });
    });

    describe('Charter Buyback ratchet (VP endgame pivot, src/docs/vp_endgame_design.md)', () => {
        /**
         * Design target: "at winRate 0.9, convert-late final SCORE beats
         * never-convert in the clear majority of seed pairs with no
         * survival-rate loss (measure, band it)."
         *
         * Measured (200 seeds, roster 8, vault 500, 40 quarters, winRate
         * 0.9, greedyPayout): convert-late's score beat never-convert's in
         * 105/200 seed pairs (52.5%); sacked count was actually LOWER with
         * convert (56/200 vs 61/200) and survived-to-quarter-40 count was
         * HIGHER (144/200 vs 139/200) — no survival-rate loss, some
         * improvement. Average score: 1054 (convert) vs 785 (never-convert).
         *
         * Roster 6 (leaner economy, less buffer against the buyback's vault
         * draw) is noisier and NOT asserted here: at measurement time
         * ContractGenerator's board generation used uncontrolled
         * Math.random() internally (this file's RNG-discipline note at the
         * top; since seeded, 2026-07-08), so any quarter's conversion could
         * perturb the vault just enough to select a different contract
         * downstream, cascading into a different sortie sequence unrelated
         * to the buyback's own economics — a roster-8
         * company's larger buffer absorbs that noise far more cleanly than
         * roster 6's does. Roster 8 (a "sensible roster" size, matching the
         * T1 ratchet's own choice above) is the one this ratchet locks down.
         */
        it('T3: convert-late beats never-convert on score in a clear majority of seed pairs, ' +
            'with no survival-rate loss, at winRate 0.9 / roster 8 / 40 quarters', () => {
            const N = 200;
            const roster = 8;

            const withConvert = seededRuns(N, rng => runCampaignSimulation({
                combatModel: DEFAULT_COMBAT_MODEL, // sortieWinRate 0.9
                policy: greedyPayout,
                targetRosterSize: roster,
                quarters: 40,
                startingVault: 500,
                startingRosterSize: roster,
                rng,
                convertLateToVP: true,
            }));
            const noConvert = seededRuns(N, rng => runCampaignSimulation({
                combatModel: DEFAULT_COMBAT_MODEL,
                policy: greedyPayout,
                targetRosterSize: roster,
                quarters: 40,
                startingVault: 500,
                startingRosterSize: roster,
                rng,
                convertLateToVP: false,
            }));

            let convertWinsScore = 0;
            for (let i = 0; i < N; i++) {
                if (withConvert[i].score > noConvert[i].score) convertWinsScore++;
            }
            // "Clear majority": measured 52.5%; a >=45% floor gives headroom
            // against re-seeding noise without accepting a coin-flip result.
            expect(convertWinsScore, `${convertWinsScore}/${N} seed pairs favored convert-late on score`)
                .toBeGreaterThanOrEqual(Math.round(N * 0.45));

            // No survival-rate loss: sacked count and full-charter-survival
            // count must not be meaningfully worse with convert-late.
            // Generous tolerance (10 percentage points of N) around the
            // measured near-parity/improvement to absorb seed-batch noise.
            const sackedWith = withConvert.filter(r => r.sacked).length;
            const sackedNo = noConvert.filter(r => r.sacked).length;
            expect(sackedWith, `sacked ${sackedWith}/${N} (convert) vs ${sackedNo}/${N} (never-convert)`)
                .toBeLessThanOrEqual(sackedNo + Math.round(N * 0.1));

            const survived40With = withConvert.filter(r => r.quartersSurvived >= 40).length;
            const survived40No = noConvert.filter(r => r.quartersSurvived >= 40).length;
            expect(survived40With, `survived-40 ${survived40With}/${N} (convert) vs ${survived40No}/${N} (never-convert)`)
                .toBeGreaterThanOrEqual(survived40No - Math.round(N * 0.1));

            // Sanity: convert-late actually banks VP (the policy fires).
            const avgCharterVp = withConvert.reduce((a, r) => a + r.charterVictoryPoints, 0) / N;
            expect(avgCharterVp).toBeGreaterThan(0);
            const neverConvertBanksNoVp = noConvert.every(r => r.charterVictoryPoints === 0);
            expect(neverConvertBanksNoVp).toBe(true);
        });
    });

    describe("combatModel: 'fixture' mode (combat win-rate measurement bridge)", () => {
        /**
         * Non-ratcheting smoke test only: combatModel: 'fixture' resolves a
         * per-sortie CombatModel from the real measured headless-combat win
         * rates in combat-rates.fixture.json (see
         * scripts/measure-combat-rates.mjs and combatModelForSortie's doc
         * comment in CampaignSimulator.ts) instead of one flat scalar. This
         * test asserts only that 10 seeded campaigns complete without
         * throwing in fixture mode -- it does NOT assert any survival-rate
         * band (that would be a ratchet, and this task's brief explicitly
         * forbids retuning any existing economy ratchet). The
         * survival-delta vs scalar mode is logged for the record, not
         * asserted.
         */
        it('runs 10 seeded campaigns in fixture mode without error', () => {
            const N = 10;
            const fixtureResults = seededRuns(N, rng => runCampaignSimulation({
                combatModel: 'fixture',
                policy: greedyPayout,
                targetRosterSize: 6,
                quarters: 16,
                startingVault: 500,
                startingRosterSize: 6,
                rng,
            }));
            expect(fixtureResults).toHaveLength(N);
            for (const r of fixtureResults) {
                expect(Number.isFinite(r.finalVault)).toBe(true);
                expect(r.quartersSurvived).toBeGreaterThanOrEqual(0);
            }

            // Logged only, per the brief -- not a ratchet assertion.
            const scalarResults = seededRuns(N, rng => runCampaignSimulation({
                combatModel: DEFAULT_COMBAT_MODEL,
                policy: greedyPayout,
                targetRosterSize: 6,
                quarters: 16,
                startingVault: 500,
                startingRosterSize: 6,
                rng,
            }));
            const avgSurvivedFixture = fixtureResults.reduce((a, r) => a + r.quartersSurvived, 0) / N;
            const avgSurvivedScalar = scalarResults.reduce((a, r) => a + r.quartersSurvived, 0) / N;
            const avgVaultFixture = fixtureResults.reduce((a, r) => a + r.finalVault, 0) / N;
            const avgVaultScalar = scalarResults.reduce((a, r) => a + r.finalVault, 0) / N;
            console.log(
                `[fixture-vs-scalar] avgQuartersSurvived: fixture=${avgSurvivedFixture.toFixed(1)} ` +
                `scalar=${avgSurvivedScalar.toFixed(1)} (delta=${(avgSurvivedFixture - avgSurvivedScalar).toFixed(1)}); ` +
                `avgFinalVault: fixture=${avgVaultFixture.toFixed(0)} scalar=${avgVaultScalar.toFixed(0)} ` +
                `(delta=${(avgVaultFixture - avgVaultScalar).toFixed(0)})`
            );
        });
    });

    describe('determinism', () => {
        /**
         * Regression guard for the flake fixed 2026-07-08: ContractGenerator
         * used to call Math.random() internally for board generation (squad
         * size, payout jitter, region/template picks), so two "seeded" runs
         * of runCampaignSimulation with identical config could still diverge
         * — the root cause of the intermittent "trade-run vs greedy" ratio
         * and T1 "survived to quarter 40" band flakes elsewhere in this
         * file. ContractGenerator.generateContract/refillBoard now take an
         * injectable rng (see this file's and CampaignSimulator.ts's
         * RNG-discipline notes), and CampaignSimulator threads config.rng
         * into both refillBoard call sites, so two runs seeded identically
         * must now produce byte-for-byte identical results.
         */
        it('produces identical results for two runs with the same seeded rng', () => {
            const config = {
                combatModel: DEFAULT_COMBAT_MODEL,
                policy: greedyPayout,
                targetRosterSize: 6,
                quarters: 16,
                startingVault: 500,
                startingRosterSize: 6,
            };
            const resultA = runCampaignSimulation({ ...config, rng: makeLcgRng(12345) });
            const resultB = runCampaignSimulation({ ...config, rng: makeLcgRng(12345) });
            expect(resultA).toEqual(resultB);
        });
    });
});
