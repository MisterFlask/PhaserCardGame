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

    it('name/client/description/paymentClause always co-occur as defined in a single template', () => {
        const templates = ContractGenerator.getAllTemplates();
        const byName = new Map(templates.map(t => [t.name, t]));

        for (let i = 0; i < 300; i++) {
            const c = gen.generateContract(10);
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
