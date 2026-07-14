import { describe, expect, it } from 'vitest';
import { ContractGenerator, ESCROW_DEADLINE_WEEKS, LEGATION_DEADLINE_WEEKS, LEGATION_PAYOUT_MULTIPLIER } from '../ContractGenerator';
import { isOppositionId, OPPOSITIONS } from '../Oppositions';
import { makeLcgRng } from '../sim/CampaignSimulator';

const gen = ContractGenerator.getInstance();

describe('ContractGenerator', () => {
    it('generates only Styx Delta (act 1) contracts in early years', () => {
        for (let i = 0; i < 50; i++) {
            const contract = gen.generateContract(1);
            expect(contract.act).toBe(1);
        }
    });

    it('unlocks deeper regions in later years', () => {
        const acts = new Set<number>();
        for (let i = 0; i < 200; i++) {
            acts.add(gen.generateContract(10).act);
        }
        expect(acts.has(2)).toBe(true);
        expect(acts.has(3)).toBe(true);
        expect(acts.has(4)).toBe(true);
    });

    it('unlocks deeper regions early for a fast-playing company', () => {
        const actsAtEightContracts = new Set<number>();
        const actsAtTwentyContracts = new Set<number>();
        const actsAtFiftySixContracts = new Set<number>();
        for (let i = 0; i < 200; i++) {
            actsAtEightContracts.add(gen.generateContract(1, 8).act);
            actsAtTwentyContracts.add(gen.generateContract(1, 20).act);
            actsAtFiftySixContracts.add(gen.generateContract(1, 56).act);
        }
        expect(actsAtEightContracts.has(2)).toBe(true);
        expect(actsAtEightContracts.has(3)).toBe(false);
        expect(actsAtTwentyContracts.has(3)).toBe(true);
        expect(actsAtTwentyContracts.has(4)).toBe(false);
        expect(actsAtFiftySixContracts.has(4)).toBe(true);
    });

    it('act 4 (Brimstone Badlands) unlocks at year 7, not before', () => {
        const actsAtYearSix = new Set<number>();
        const actsAtYearSeven = new Set<number>();
        for (let i = 0; i < 300; i++) {
            actsAtYearSix.add(gen.generateContract(6).act);
            actsAtYearSeven.add(gen.generateContract(7).act);
        }
        expect(actsAtYearSix.has(4)).toBe(false);
        expect(actsAtYearSeven.has(4)).toBe(true);
    });

    it('produces well-formed contracts', () => {
        for (let i = 0; i < 100; i++) {
            const c = gen.generateContract(5);
            expect(c.numCombats).toBeGreaterThanOrEqual(1);
            expect(c.numCombats).toBeLessThanOrEqual(2);
            expect(c.segment).toBeGreaterThanOrEqual(0);
            expect(c.segment).toBeLessThanOrEqual(2);
            expect(c.difficultyStars).toBe(c.segment + 1);
            expect(c.payout).toBeGreaterThan(0);
            expect(c.payout % 5).toBe(0);
            expect(c.deadlineWeeks).toBeGreaterThanOrEqual(2);
            expect(c.deadlineWeeks).toBeLessThanOrEqual(4);
            expect(c.durationWeeks).toBe(c.numCombats + 1); // +1 week mustering overhead
            expect(c.name.length).toBeGreaterThan(0);
        }
    });

    it('refills the board up to the target count without disturbing existing contracts', () => {
        const existing = [gen.generateContract(1)];
        const board = gen.refillBoard(existing, 1);
        expect(board).toHaveLength(5);
        expect(board[0]).toBe(existing[0]);
    });

    it('every generated contract has a non-empty client and payment clause', () => {
        for (let i = 0; i < 100; i++) {
            const c = gen.generateContract(5);
            expect(c.client.length).toBeGreaterThan(0);
            expect(c.paymentClause.length).toBeGreaterThan(0);
        }
    });

    it('payment clause has {payout} replaced with the actual £ amount', () => {
        for (let i = 0; i < 100; i++) {
            const c = gen.generateContract(5);
            expect(c.paymentClause).not.toContain('{payout}');
            expect(c.paymentClause).toContain(`£${c.payout}`);
        }
    });

    it('generates trade runs at roughly the 20% target, with the freight fields set', () => {
        const trials = 1000;
        let tradeRunCount = 0;
        for (let i = 0; i < trials; i++) {
            const contract = gen.generateContract(10);
            if (!contract.isTradeRun) continue;
            tradeRunCount++;
            expect(contract.maxCrates).toBe(5);
            expect(contract.freightRatePerCrate).toBe(15 * contract.act);
            expect(contract.cratesLoaded).toBe(0);
            expect([3, 4]).toContain(contract.squadSize); // never 2: no hands to spare
        }
        const rate = tradeRunCount / trials;
        expect(rate).toBeGreaterThan(0.1);
        expect(rate).toBeLessThan(0.32);
    });

    it('combat (non-trade-run) contracts carry no freight fields', () => {
        for (let i = 0; i < 200; i++) {
            const c = gen.generateContract(5);
            if (c.isTradeRun) continue;
            expect(c.maxCrates).toBe(0);
            expect(c.freightRatePerCrate).toBe(0);
            expect(c.cratesLoaded).toBe(0);
        }
    });

    it('trade run squadSize never rolls 2, at roughly a 75/25 three/four split', () => {
        // Trade runs are themselves only ~20% of generated contracts, so a
        // large trial count is needed to keep the inner 3-vs-4 split's
        // sample size (and thus its variance) under control. The 75/25 split
        // is the full distribution's 60%-three/20%-four renormalized over
        // {3, 4} alone (2 excluded): 0.6/0.8 = 0.75, 0.2/0.8 = 0.25.
        const trials = 6000;
        const counts: Record<number, number> = { 3: 0, 4: 0 };
        let seen = 0;
        for (let i = 0; i < trials; i++) {
            const c = gen.generateContract(10);
            if (!c.isTradeRun) continue;
            seen++;
            expect(c.squadSize).not.toBe(2);
            counts[c.squadSize]++;
        }
        expect(seen).toBeGreaterThan(300); // sanity: sampled enough trade runs
        expect(counts[3] / seen).toBeGreaterThan(0.6);
        expect(counts[3] / seen).toBeLessThan(0.88);
    });

    it('trade run projectedPayout is base + crates * freightRatePerCrate', () => {
        for (let i = 0; i < 100; i++) {
            const c = gen.generateContract(5);
            if (!c.isTradeRun) continue;
            expect(c.projectedPayout).toBe(c.payout);
            c.cratesLoaded = c.maxCrates;
            expect(c.projectedPayout).toBe(c.payout + c.maxCrates * c.freightRatePerCrate);
        }
    });

    it('refillBoard guarantees at least one trade run on a full refresh from empty', () => {
        for (let i = 0; i < 20; i++) {
            const board = gen.refillBoard([], 5);
            expect(board.some(c => c.isTradeRun)).toBe(true);
        }
    });

    it('trade run name/client/description/paymentClause always co-occur as defined in a single template', () => {
        const templates = ContractGenerator.getAllTradeRunTemplates();
        const byName = new Map(templates.map(t => [t.name, t]));

        let seen = 0;
        for (let i = 0; i < 500; i++) {
            const c = gen.generateContract(10);
            if (!c.isTradeRun) continue;
            seen++;
            const template = byName.get(c.name);
            expect(template).toBeDefined();
            expect(c.client).toBe(template!.client);
            expect(c.description).toBe(template!.description);
            expect(c.paymentClause).toBe(template!.paymentClause.replace('{payout}', `£${c.payout}`));
        }
        expect(seen).toBeGreaterThan(20);
    });

    it('name/client/description/paymentClause always co-occur as defined in a single template', () => {
        const templates = ContractGenerator.getAllTemplates();
        const byName = new Map(templates.map(t => [t.name, t]));

        for (let i = 0; i < 300; i++) {
            const c = gen.generateContract(10);
            if (c.isTradeRun) continue; // trade runs draw from a separate template table, checked above
            const template = byName.get(c.name);
            expect(template).toBeDefined();
            expect(c.client).toBe(template!.client);
            expect(c.description).toBe(template!.description);
            // paymentClause on the contract has {payout} substituted; the
            // template's raw clause (with the token) must match modulo that.
            expect(c.paymentClause).toBe(template!.paymentClause.replace('{payout}', `£${c.payout}`));
        }
    });

    describe('Brimstone Badlands (act 4, src/docs/act4_brimstone_badlands_design.md)', () => {
        it('bounty templates keep name/client/description/paymentClause co-occurring as defined', () => {
            const templates = ContractGenerator.getAllTemplates().filter(t => t.client.includes('Iron Choir')
                || t.name.includes('Vent-Field') || t.name.includes('Caldera') || t.name.includes('Concordat')
                || t.name.includes('Runaway Extraction') || t.name.includes('Pilgrim'));
            expect(templates.length).toBeGreaterThan(0);
            const byName = new Map(templates.map(t => [t.name, t]));

            let seen = 0;
            for (let i = 0; i < 500; i++) {
                const c = gen.generateContract(10);
                if (c.isTradeRun || c.act !== 4) continue;
                seen++;
                const template = byName.get(c.name);
                expect(template).toBeDefined();
                expect(c.client).toBe(template!.client);
                expect(c.description).toBe(template!.description);
                expect(c.paymentClause).toBe(template!.paymentClause.replace('{payout}', `£${c.payout}`));
            }
            expect(seen).toBeGreaterThan(0);
        });

        it('trade run templates keep name/client/description/paymentClause co-occurring as defined', () => {
            const templates = ContractGenerator.getAllTradeRunTemplates().filter(t => t.cargoLabel.includes('brimstone')
                || t.cargoLabel.includes('oil casks') || t.cargoLabel.includes('phlogiston'));
            expect(templates.length).toBe(3);
            const byName = new Map(templates.map(t => [t.name, t]));

            let seen = 0;
            for (let i = 0; i < 1000; i++) {
                const c = gen.generateContract(10);
                if (!c.isTradeRun || c.act !== 4) continue;
                seen++;
                const template = byName.get(c.name);
                expect(template).toBeDefined();
                expect(c.client).toBe(template!.client);
                expect(c.description).toBe(template!.description);
                expect(c.paymentClause).toBe(template!.paymentClause.replace('{payout}', `£${c.payout}`));
            }
            expect(seen).toBeGreaterThan(0);
        });

        it('introduces "The Iron Choir, per its Concordat" as a new client string', () => {
            const templates = ContractGenerator.getAllTemplates();
            expect(templates.some(t => t.client === 'The Iron Choir, per its Concordat')).toBe(true);
        });
    });

    describe('Prestige Commissions (src/docs/vp_endgame_design.md)', () => {
        it('never appear before year 3', () => {
            for (let i = 0; i < 30; i++) {
                const board = gen.refillBoard([], 1);
                expect(board.some(c => c.isPrestige)).toBe(false);
                const board2 = gen.refillBoard([], 2);
                expect(board2.some(c => c.isPrestige)).toBe(false);
            }
        });

        it('appear at most once per full board refresh from year 3+', () => {
            for (let i = 0; i < 60; i++) {
                const board = gen.refillBoard([], 5);
                const prestigeCount = board.filter(c => c.isPrestige).length;
                expect(prestigeCount).toBeLessThanOrEqual(1);
            }
        });

        it('eventually appear across enough refreshes at year 5', () => {
            let sawPrestige = false;
            for (let i = 0; i < 60; i++) {
                const board = gen.refillBoard([], 5);
                if (board.some(c => c.isPrestige)) {
                    sawPrestige = true;
                    break;
                }
            }
            expect(sawPrestige).toBe(true);
        });

        it('pay £0 with vpReward = 150 + 25*(year-3), rounded to 5, scaled by danger pay', () => {
            let seen = 0;
            for (let i = 0; i < 200; i++) {
                const board = gen.refillBoard([], 7);
                const prestige = board.find(c => c.isPrestige);
                if (!prestige) continue;
                seen++;
                expect(prestige.payout).toBe(0);
                expect(prestige.projectedPayout).toBe(0);
                expect(prestige.client).toBe('The Court of Directors');
                expect(prestige.vpReward).toBeGreaterThan(0);
                expect(prestige.vpReward % 5).toBe(0);

                const dangerMultiplier: Record<number, number> = { 2: 1.3, 3: 1.0, 4: 0.85 };
                const baseVp = 150 + 25 * (7 - 3);
                const expected = Math.round((baseVp * dangerMultiplier[prestige.squadSize]) / 5) * 5;
                expect(prestige.vpReward).toBe(expected);
            }
            expect(seen).toBeGreaterThan(0);
        });

        it('name/description always co-occur as defined in a single template', () => {
            const templates = ContractGenerator.getAllPrestigeTemplates();
            const byName = new Map(templates.map(t => [t.name, t]));

            let seen = 0;
            for (let i = 0; i < 200; i++) {
                const board = gen.refillBoard([], 8);
                const prestige = board.find(c => c.isPrestige);
                if (!prestige) continue;
                seen++;
                const template = byName.get(prestige.name);
                expect(template).toBeDefined();
                expect(prestige.description).toBe(template!.description);
            }
            expect(seen).toBeGreaterThan(0);
        });
    });

    describe('Opposition system (src/campaign/Oppositions.ts)', () => {
        it('every bounty template carries a valid opposition matching its own region\'s act', () => {
            const templates = ContractGenerator.getAllTemplates();
            expect(templates.length).toBeGreaterThan(0);
            templates.forEach(t => {
                expect(isOppositionId(t.opposition), `${t.name}: "${t.opposition}" is not a valid OppositionId`).toBe(true);
            });
        });

        it('every trade-run template carries a valid opposition', () => {
            const templates = ContractGenerator.getAllTradeRunTemplates();
            expect(templates.length).toBeGreaterThan(0);
            templates.forEach(t => {
                expect(isOppositionId(t.opposition), `${t.name}: "${t.opposition}" is not a valid OppositionId`).toBe(true);
            });
        });

        it('generated bounty and trade-run contracts carry their template\'s opposition, matching their own act', () => {
            let seenBounty = 0, seenTradeRun = 0;
            for (let i = 0; i < 500; i++) {
                const c = gen.generateContract(10);
                if (c.isPrestige) continue;
                expect(isOppositionId(c.opposition), `${c.name}: "${c.opposition}" is not a valid OppositionId`).toBe(true);
                expect(OPPOSITIONS[c.opposition as keyof typeof OPPOSITIONS].act).toBe(c.act);
                if (c.isTradeRun) seenTradeRun++; else seenBounty++;
            }
            expect(seenBounty).toBeGreaterThan(0);
            expect(seenTradeRun).toBeGreaterThan(0);
        });

        it('prestige contracts always have undefined opposition', () => {
            let seen = 0;
            for (let i = 0; i < 200; i++) {
                const board = gen.refillBoard([], 8);
                const prestige = board.find(c => c.isPrestige);
                if (!prestige) continue;
                seen++;
                expect(prestige.opposition).toBeUndefined();
            }
            expect(seen).toBeGreaterThan(0);
        });
    });

    describe('Legation commissions (Capital Works Rebuild, The Dis Legation)', () => {
        it('generateLegationContract applies the payout multiplier, fixed deadline, exempt flag, and name prefix', () => {
            for (let i = 0; i < 100; i++) {
                const c = gen.generateLegationContract(5);
                expect(c.name.startsWith('Legation: ')).toBe(true);
                expect(c.deadlineWeeks).toBe(LEGATION_DEADLINE_WEEKS);
                expect(c.exemptFromBoardSlots).toBe(true);
                expect(c.isTradeRun).toBe(false);
                expect(c.isPrestige).toBe(false);

                // The underlying bounty payout is always a multiple of £5, so
                // the multiplied payout must be exactly base * 1.4 (an integer:
                // 5k * 1.4 = 7k) and dividing back out must recover a clean
                // multiple of £5 — a deterministic check on the ×1.4 despite
                // the roll's jitter.
                expect(c.payout).toBeGreaterThan(0);
                const impliedBase = c.payout / LEGATION_PAYOUT_MULTIPLIER;
                expect(impliedBase % 5).toBeCloseTo(0, 8);
                // Invoice stays honest: the clause quotes the multiplied figure.
                expect(c.paymentClause).toContain(`£${c.payout}`);
            }
        });

        it('generates at the CURRENT max act for the given year/contracts-completed inputs', () => {
            for (let i = 0; i < 50; i++) {
                expect(gen.generateLegationContract(1, 0).act).toBe(1);
                expect(gen.generateLegationContract(1, 8).act).toBe(2);
                expect(gen.generateLegationContract(1, 20).act).toBe(3);
                expect(gen.generateLegationContract(10, 0).act).toBe(4);
            }
        });

        it('refillBoard tops up to the target count of NON-exempt contracts when an exempt contract is present', () => {
            for (let i = 0; i < 20; i++) {
                const legation = gen.generateLegationContract(5);
                const board = gen.refillBoard([legation], 5);
                expect(board).toContain(legation);
                expect(board.filter(c => !c.exemptFromBoardSlots)).toHaveLength(5);
                expect(board).toHaveLength(6);
            }
        });
    });

    describe('Recovery of Company Assets (Capital Works Rebuild Batch C, The Soul Collateral Office)', () => {
        it('posts on the Office\'s terms: £0, no VP, 8-week deadline, slot-exempt, souls attached', () => {
            for (let i = 0; i < 50; i++) {
                const c = gen.generateRecoveryContract(['Pte. Ostrander'], 2);
                expect(c.payout).toBe(0);
                expect(c.projectedPayout).toBe(0);
                expect(c.vpReward).toBe(0);
                expect(c.deadlineWeeks).toBe(ESCROW_DEADLINE_WEEKS);
                expect(c.exemptFromBoardSlots).toBe(true);
                expect(c.recoveryOfSouls).toEqual(['Pte. Ostrander']);
                expect(c.client).toBe('The Soul Collateral Office');
                expect(c.paymentClause).toBe('No invoice will be raised. The Company does not pay to be returned its own property.');
                expect(c.description).toContain('Pte. Ostrander');
                expect(c.description).toContain('clause 44(b)');
                expect(c.consumableRewardName).toBeUndefined();
                expect(c.isTradeRun).toBe(false);
                expect(c.isPrestige).toBe(false);
            }
        });

        it('names the first soul and counts the rest', () => {
            expect(gen.generateRecoveryContract(['Pte. Ostrander'], 1).name)
                .toBe('Recovery of Company Assets: Pte. Ostrander');
            expect(gen.generateRecoveryContract(['Pte. Ostrander', 'Cpl. Weeks'], 1).name)
                .toBe('Recovery of Company Assets: Pte. Ostrander (and 1 other)');
            expect(gen.generateRecoveryContract(['Pte. Ostrander', 'Cpl. Weeks', 'Sgt. Vane'], 1).name)
                .toBe('Recovery of Company Assets: Pte. Ostrander (and 2 others)');
        });

        it('draws its encounter fields from the act the souls were lost on', () => {
            for (let act = 1; act <= 4; act++) {
                const c = gen.generateRecoveryContract(['Pte. Ostrander'], act);
                expect(c.act).toBe(act);
                expect(c.numCombats).toBeGreaterThanOrEqual(1);
                expect(c.numCombats).toBeLessThanOrEqual(2);
                expect([2, 3, 4]).toContain(c.squadSize);
                expect(c.durationWeeks).toBe(c.numCombats + 1);
            }
        });
    });

    describe('Event presence pre-roll (board disclosure)', () => {
        it('forcing every rng draw low gives every combat an event, within bounds', () => {
            const forceEventsRng = () => 0.0;
            for (let i = 0; i < 50; i++) {
                const c = gen.generateContract(10, 0, {}, forceEventsRng);
                expect(c.eventCombatIndices).toHaveLength(c.numCombats);
                expect(c.eventCombatIndices).toEqual(
                    Array.from({ length: c.numCombats }, (_, idx) => idx)
                );
                c.eventCombatIndices.forEach(idx => {
                    expect(idx).toBeGreaterThanOrEqual(0);
                    expect(idx).toBeLessThan(c.numCombats);
                });
                expect(c.hasEventEnRoute).toBe(true);
            }
        });

        it('forcing every rng draw high (below 1) gives no combat an event', () => {
            // 0.99 is comfortably above every roll-chance threshold in the
            // generator (TRADE_RUN_CHANCE 0.2, numCombats 0.45, EVENT_CHANCE
            // 0.35, etc.), so this exercises the bounty path with zero events.
            const forceNoEventsRng = () => 0.99;
            for (let i = 0; i < 50; i++) {
                const c = gen.generateContract(10, 0, {}, forceNoEventsRng);
                expect(c.eventCombatIndices).toEqual([]);
                expect(c.hasEventEnRoute).toBe(false);
            }
        });

        it('is deterministic: the same seed produces the same indices', () => {
            const seed = 104729 * 7;
            const c1 = gen.generateContract(10, 0, {}, makeLcgRng(seed));
            const c2 = gen.generateContract(10, 0, {}, makeLcgRng(seed));
            expect(c2.eventCombatIndices).toEqual(c1.eventCombatIndices);
            expect(c2.numCombats).toBe(c1.numCombats);
        });

        it('at the default 35% chance, most multi-trial boards mix contracts with and without events', () => {
            let withEvent = 0, without = 0;
            for (let i = 0; i < 200; i++) {
                const c = gen.generateContract(10);
                if (c.hasEventEnRoute) withEvent++; else without++;
                c.eventCombatIndices.forEach(idx => {
                    expect(idx).toBeGreaterThanOrEqual(0);
                    expect(idx).toBeLessThan(c.numCombats);
                });
            }
            expect(withEvent).toBeGreaterThan(0);
            expect(without).toBeGreaterThan(0);
        });
    });
});
