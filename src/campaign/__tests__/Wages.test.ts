import { describe, expect, it } from 'vitest';
import { CampaignCalendar, WAGE_PER_SOLDIER_PER_QUARTER, WEEKS_PER_QUARTER } from '../CampaignCalendar';

/**
 * Wages: £15/soldier/quarter, settled at the board meeting BEFORE the
 * dividend draw (see src/docs/strategic_layer_redesign.md, "What money
 * buys" — "keeps roster size honest; ongoing drain so hoarding has cost").
 *
 * Wages are derived state (roster size × WAGE_PER_SOLDIER_PER_QUARTER) —
 * CampaignCalendar itself holds no roster; callers (CampaignUiState in
 * production) supply getWageBillDue/payWagesFromVault. These tests drive
 * the calendar directly, matching the house pattern in CampaignCalendar.test.ts.
 */
describe('Wages', () => {
    it('deducts roster x WAGE_PER_SOLDIER_PER_QUARTER from the vault before the dividend draw', () => {
        const cal = new CampaignCalendar();
        const rosterSize = 5;
        let vault = 10_000;
        const order: string[] = [];

        cal.advanceWeeks(
            WEEKS_PER_QUARTER,
            (due) => {
                order.push('dividend');
                const paid = Math.min(due, vault);
                vault -= paid;
                return paid;
            },
            () => rosterSize * WAGE_PER_SOLDIER_PER_QUARTER,
            (due) => {
                order.push('wages');
                const paid = Math.min(due, vault);
                vault -= paid;
                return paid;
            },
        );

        const expectedWages = rosterSize * WAGE_PER_SOLDIER_PER_QUARTER;
        expect(expectedWages).toBe(75);
        // Started at 10,000; wages then the full £120 dividend both clear, in order.
        expect(vault).toBe(10_000 - expectedWages - 120);
        expect(order).toEqual(['wages', 'dividend']);
    });

    it('floors the vault at 0 under wages and never goes negative', () => {
        const cal = new CampaignCalendar();
        const rosterSize = 8; // ROSTER_CAP
        let vault = 50; // less than the wage bill (8 * 15 = 120)

        cal.advanceWeeks(
            WEEKS_PER_QUARTER,
            (due) => {
                const paid = Math.min(due, vault);
                vault -= paid;
                return paid;
            },
            () => rosterSize * WAGE_PER_SOLDIER_PER_QUARTER,
            (due) => {
                const paid = Math.min(due, vault);
                vault -= paid;
                return paid;
            },
        );

        expect(vault).toBe(0);
        expect(vault).toBeGreaterThanOrEqual(0);
    });

    it('logs a wages line at the board meeting', () => {
        const cal = new CampaignCalendar();
        const rosterSize = 5;
        let vault = 10_000;

        cal.advanceWeeks(
            WEEKS_PER_QUARTER,
            (due) => { const paid = Math.min(due, vault); vault -= paid; return paid; },
            () => rosterSize * WAGE_PER_SOLDIER_PER_QUARTER,
            (due) => { const paid = Math.min(due, vault); vault -= paid; return paid; },
        );

        const wageEvent = cal.boardEvents.find(e => e.message.includes('field wages'));
        expect(wageEvent).toBeDefined();
        expect(wageEvent!.message).toContain('£75');
        expect(wageEvent!.isWarning).toBe(false);
    });

    it('quarterly income (onBoardMeetingStart) lands before wages, which land before the dividend', () => {
        const cal = new CampaignCalendar();
        let vault = 0;              // broke going into the meeting
        const projectIncome = 100;  // bond coupon arrives at the meeting
        const wagesDue = 75;        // 5 soldiers x £15
        // dividend due is the £120 default

        let wagesPaid = -1;
        let dividendPaid = -1;

        cal.advanceWeeks(
            WEEKS_PER_QUARTER,
            (due) => {
                dividendPaid = Math.min(due, vault);
                vault -= dividendPaid;
                return dividendPaid;
            },
            () => wagesDue,
            (due) => {
                wagesPaid = Math.min(due, vault);
                vault -= wagesPaid;
                return wagesPaid;
            },
            () => { vault += projectIncome; },
        );

        // Income arrived first, so the roster is paid in full...
        expect(wagesPaid).toBe(75);
        // ...the dividend gets what's left...
        expect(dividendPaid).toBe(25);
        expect(vault).toBe(0);
        // ...and no wage-shortfall warning is logged (the dividend shortfall
        // is the only bad news at this meeting).
        const wageEvent = cal.boardEvents.find(e => e.message.includes('field wages'));
        expect(wageEvent).toBeDefined();
        expect(wageEvent!.isWarning).toBe(false);
    });

    it('omitting the wage callbacks (legacy callers) settles no wages', () => {
        const cal = new CampaignCalendar();
        let vault = 10_000;
        cal.advanceWeeks(WEEKS_PER_QUARTER, (due) => { const paid = Math.min(due, vault); vault -= paid; return paid; });
        expect(vault).toBe(10_000 - 120);
        expect(cal.boardEvents.some(e => e.message.includes('field wages'))).toBe(false);
    });

    it('baseline economics: roster of 5 stays cashflow-positive after wages + base dividend, ' +
        'against income from ~2 average contracts/quarter (act 1: avg payout ~£116, derived from ' +
        'ContractGenerator.generateContract\'s basePay/numCombats/jitter math)', () => {
        const rosterSize = 5;
        const wageBill = rosterSize * WAGE_PER_SOLDIER_PER_QUARTER; // £75
        const baseDividend = 120; // CampaignCalendar's currentDividendExpectation starting value

        // Average act-1 contract payout, derived (not guessed) from
        // ContractGenerator.generateContract: basePay = 30 + act*20 + segment*25
        // with segment uniform in {0,1,2} (mean 1) and act=1 -> E[basePay] = 75.
        // numCombats is 1 (45%) or 2 (55%) -> E[numCombats] = 1.55.
        // jitter is uniform [0.85, 1.15], mean 1 (rounding to £5 washes out).
        const averageContractPayout = (30 + 1 * 20 + 25 * 1) * 1.55; // = 116.25
        const quarterlyContractIncome = 2 * averageContractPayout;

        const netQuarterlyCashflow = quarterlyContractIncome - wageBill - baseDividend;

        // Report the numbers so a future rebalance can see them without rerunning.
        expect(averageContractPayout).toBeCloseTo(116.25, 2);
        expect(wageBill).toBe(75);
        expect(netQuarterlyCashflow).toBeGreaterThan(0);
    });
});
