import { describe, expect, it } from 'vitest';
import { CampaignCalendar, WAGE_PER_SOLDIER_PER_QUARTER, WEEKS_PER_QUARTER } from '../CampaignCalendar';

/**
 * Wages: £25/soldier/quarter, settled at the board meeting BEFORE the
 * dividend draw (see src/docs/strategic_layer_redesign.md, "What money
 * buys" — "keeps roster size honest; ongoing drain so hoarding has cost").
 * Raised from £15 in the economy balance pass (see CampaignCalendar.ts's
 * WAGE_PER_SOLDIER_PER_QUARTER comment and CampaignSimulator.test.ts's
 * "no-free-hoarding" describe block) — £15 was too small relative to
 * per-sortie payouts to make a hoarded roster net-negative versus a lean
 * one. £25 is the frontier this pass landed on: pushing further to the
 * permitted ceiling (£30) over-penalizes mid-size rosters (roster-6's
 * 40-quarter survival collapses well below the design band) without
 * meaningfully improving the roster-5-vs-8 comparison further, so £25 was
 * kept rather than maxed out. See the "baseline economics" test below for
 * the one place this shows up as a real tradeoff: at £25 a purely
 * conservative "2 average contracts/quarter" floor case is barely
 * cashflow-negative even though the sim shows actual roster-5 throughput
 * (~3.7 sorties/quarter) is comfortably positive in practice.
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
        expect(expectedWages).toBe(125);
        // Started at 10,000; wages then the full £120 dividend both clear, in order.
        expect(vault).toBe(10_000 - expectedWages - 120);
        expect(order).toEqual(['wages', 'dividend']);
    });

    it('floors the vault at 0 under wages and never goes negative', () => {
        const cal = new CampaignCalendar();
        const rosterSize = 8; // ROSTER_CAP
        let vault = 50; // less than the wage bill (8 * 25 = 200)

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
        expect(wageEvent!.message).toContain('£125');
        expect(wageEvent!.isWarning).toBe(false);
    });

    it('quarterly income (onBoardMeetingStart) lands before wages, which land before the dividend', () => {
        const cal = new CampaignCalendar();
        let vault = 0;              // broke going into the meeting
        const projectIncome = 100;  // bond coupon arrives at the meeting
        const wagesDue = 75;        // fixed test value (not tied to WAGE_PER_SOLDIER_PER_QUARTER)
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

    it('baseline economics: a roster of 5 running a conservative "2 average contracts/quarter" ' +
        '(act 1, year 1: avg payout ~£116, derived from ContractGenerator.generateContract\'s ' +
        'basePay/numCombats/jitter math; the year-scaling multiplier added in the balance pass ' +
        'is exactly 1.0 at year 1, so this baseline year-1 figure is unchanged) is only barely ' +
        'in the red against wages + the base dividend — NOT strictly positive as it was at the ' +
        'old £15 wage. This is intentional post-balance-pass: 2 contracts/quarter is a ' +
        'deliberately pessimistic floor case (the sim shows actual roster-5 throughput is closer ' +
        'to 3.7 sorties/quarter in year 1, comfortably cashflow-positive — see ' +
        'CampaignSimulator.test.ts). Report the numbers so a future rebalance can see them ' +
        'without rerunning.', () => {
        const rosterSize = 5;
        const wageBill = rosterSize * WAGE_PER_SOLDIER_PER_QUARTER; // £125
        const baseDividend = 120; // CampaignCalendar's currentDividendExpectation starting value

        // Average act-1 contract payout, derived (not guessed) from
        // ContractGenerator.generateContract: basePay = 30 + act*20 + segment*25
        // with segment uniform in {0,1,2} (mean 1) and act=1 -> E[basePay] = 75.
        // numCombats is 1 (45%) or 2 (55%) -> E[numCombats] = 1.55.
        // jitter is uniform [0.85, 1.15], mean 1 (rounding to £5 washes out).
        const averageContractPayout = (30 + 1 * 20 + 25 * 1) * 1.55; // = 116.25
        const quarterlyContractIncome = 2 * averageContractPayout;

        const netQuarterlyCashflow = quarterlyContractIncome - wageBill - baseDividend;

        expect(averageContractPayout).toBeCloseTo(116.25, 2);
        expect(wageBill).toBe(125);
        // -12.5: a slim floor-case deficit, not a cliff — see the test title.
        expect(netQuarterlyCashflow).toBeCloseTo(-12.5, 2);
    });
});
