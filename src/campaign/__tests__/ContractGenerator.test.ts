import { describe, expect, it } from 'vitest';
import { ContractGenerator } from '../ContractGenerator';

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
    });

    it('unlocks deeper regions early for a fast-playing company', () => {
        const actsAtEightContracts = new Set<number>();
        const actsAtTwentyContracts = new Set<number>();
        for (let i = 0; i < 200; i++) {
            actsAtEightContracts.add(gen.generateContract(1, 8).act);
            actsAtTwentyContracts.add(gen.generateContract(1, 20).act);
        }
        expect(actsAtEightContracts.has(2)).toBe(true);
        expect(actsAtEightContracts.has(3)).toBe(false);
        expect(actsAtTwentyContracts.has(3)).toBe(true);
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
            expect(contract.maxCrates).toBe(6);
            expect(contract.freightRatePerCrate).toBe(30 * contract.act);
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
});
