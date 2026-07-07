import { describe, expect, it } from 'vitest';
import { CampaignCalendar, WEEKS_PER_QUARTER } from '../../campaign/CampaignCalendar';
import { CONSUMABLE_REWARD_NAMES } from '../../campaign/ConsumableStock';
import { ContractGenerator } from '../../campaign/ContractGenerator';
import { calendarFromDTO, calendarToDTO, contractFromDTO, contractToDTO } from '../PureDTOConversions';

describe('calendar DTO round-trip', () => {
    it('preserves time, satisfaction, expectation, and the event log', () => {
        const cal = new CampaignCalendar();
        cal.advanceWeeks(WEEKS_PER_QUARTER + 3, due => due); // settle one dividend
        cal.shareholderSatisfaction = 42;

        // Survive actual JSON, not just object identity.
        const restored = calendarFromDTO(JSON.parse(JSON.stringify(calendarToDTO(cal))));

        expect(restored.week).toBe(cal.week);
        expect(restored.year).toBe(cal.year);
        expect(restored.quarterOfYear).toBe(cal.quarterOfYear);
        expect(restored.shareholderSatisfaction).toBe(42);
        expect(restored.currentDividendExpectation).toBe(cal.currentDividendExpectation);
        expect(restored.boardEvents).toEqual(cal.boardEvents);
    });

    it('restored calendars keep ticking correctly', () => {
        const cal = new CampaignCalendar();
        cal.week = WEEKS_PER_QUARTER; // one week before the boundary
        const restored = calendarFromDTO(JSON.parse(JSON.stringify(calendarToDTO(cal))));

        let payments = 0;
        restored.advanceWeeks(1, due => { payments++; return due; });
        expect(payments).toBe(1);
        expect(restored.quarterOfYear).toBe(2);
    });
});

describe('contract DTO round-trip', () => {
    it('preserves every field the sortie runner reads', () => {
        for (let i = 0; i < 20; i++) {
            const contract = ContractGenerator.getInstance().generateContract(5);
            const restored = contractFromDTO(JSON.parse(JSON.stringify(contractToDTO(contract))));

            expect(restored.name).toBe(contract.name);
            expect(restored.description).toBe(contract.description);
            expect(restored.type).toBe(contract.type);
            expect(restored.client).toBe(contract.client);
            expect(restored.paymentClause).toBe(contract.paymentClause);
            expect(restored.act).toBe(contract.act);
            expect(restored.segment).toBe(contract.segment);
            expect(restored.difficultyStars).toBe(contract.difficultyStars);
            expect(restored.numCombats).toBe(contract.numCombats);
            expect(restored.deadlineWeeks).toBe(contract.deadlineWeeks);
            expect(restored.durationWeeks).toBe(contract.durationWeeks);
            expect(restored.payout).toBe(contract.payout);
            expect(restored.squadSize).toBe(contract.squadSize);
            expect(restored.regionName).toBe(contract.regionName);
            expect(restored.consumableRewardName).toBe(contract.consumableRewardName);
            expect(restored.maxCrates).toBe(contract.maxCrates);
            expect(restored.freightRatePerCrate).toBe(contract.freightRatePerCrate);
            expect(restored.vpReward).toBe(contract.vpReward);
        }
    });

    it('preserves a Prestige Commission\'s £0 payout and vpReward through the round-trip', () => {
        let sawPrestige = false;
        for (let i = 0; i < 200 && !sawPrestige; i++) {
            const board = ContractGenerator.getInstance().refillBoard([], 6);
            const prestige = board.find(c => c.isPrestige);
            if (!prestige) continue;
            sawPrestige = true;
            expect(prestige.payout).toBe(0);
            expect(prestige.vpReward).toBeGreaterThan(0);
            const restored = contractFromDTO(JSON.parse(JSON.stringify(contractToDTO(prestige))));
            expect(restored.type).toBe(prestige.type);
            expect(restored.isPrestige).toBe(true);
            expect(restored.payout).toBe(0);
            expect(restored.vpReward).toBe(prestige.vpReward);
            expect(restored.client).toBe('The Court of Directors');
        }
        expect(sawPrestige).toBe(true);
    });

    it('preserves Trade Run maxCrates/freightRatePerCrate through the round-trip', () => {
        let sawTradeRun = false;
        for (let i = 0; i < 200; i++) {
            const contract = ContractGenerator.getInstance().generateContract(10);
            if (!contract.isTradeRun) continue;
            sawTradeRun = true;
            expect(contract.maxCrates).toBeGreaterThan(0);
            expect(contract.freightRatePerCrate).toBeGreaterThan(0);
            const restored = contractFromDTO(JSON.parse(JSON.stringify(contractToDTO(contract))));
            expect(restored.type).toBe(contract.type);
            expect(restored.maxCrates).toBe(contract.maxCrates);
            expect(restored.freightRatePerCrate).toBe(contract.freightRatePerCrate);
            // cratesLoaded deliberately never serializes; a contract restored
            // from the board (year always 0 on save) must come back at 0.
            expect(restored.cratesLoaded).toBe(0);
        }
        expect(sawTradeRun).toBe(true);
    });

    it('generates a consumable reward on roughly 20% of contracts, always from the reward name table', () => {
        let withReward = 0;
        const trials = 500;
        for (let i = 0; i < trials; i++) {
            const contract = ContractGenerator.getInstance().generateContract(5);
            if (contract.consumableRewardName) {
                withReward++;
                expect(CONSUMABLE_REWARD_NAMES).toContain(contract.consumableRewardName);
            }
        }
        // 20% target; generous tolerance since this is a random sample.
        const rate = withReward / trials;
        expect(rate).toBeGreaterThan(0.1);
        expect(rate).toBeLessThan(0.32);
    });

    it('rolls squadSize 2/3/4 at roughly the 20/60/20 target distribution', () => {
        const trials = 1000;
        const counts: Record<number, number> = { 2: 0, 3: 0, 4: 0 };
        for (let i = 0; i < trials; i++) {
            const contract = ContractGenerator.getInstance().generateContract(5);
            expect([2, 3, 4]).toContain(contract.squadSize);
            counts[contract.squadSize]++;
        }
        // Generous tolerance since this is a random sample.
        expect(counts[2] / trials).toBeGreaterThan(0.1);
        expect(counts[2] / trials).toBeLessThan(0.32);
        expect(counts[4] / trials).toBeGreaterThan(0.1);
        expect(counts[4] / trials).toBeLessThan(0.32);
        expect(counts[3] / trials).toBeGreaterThan(0.45);
        expect(counts[3] / trials).toBeLessThan(0.72);
    });
});
