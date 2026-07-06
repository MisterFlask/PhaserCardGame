import { describe, expect, it } from 'vitest';
import { CampaignCalendar, WEEKS_PER_QUARTER } from '../CampaignCalendar';

function richVault(): (due: number) => number {
    return (due: number) => due; // always pays in full
}

describe('CampaignCalendar', () => {
    it('starts at year 1, Q1, week 1', () => {
        const cal = new CampaignCalendar();
        expect(cal.year).toBe(1);
        expect(cal.quarterOfYear).toBe(1);
        expect(cal.weekOfQuarter).toBe(1);
        expect(cal.weeksUntilDividend).toBe(WEEKS_PER_QUARTER);
    });

    it('does not settle a dividend before the quarter boundary', () => {
        const cal = new CampaignCalendar();
        let paymentsRequested = 0;
        cal.advanceWeeks(WEEKS_PER_QUARTER - 1, due => { paymentsRequested++; return due; });
        expect(paymentsRequested).toBe(0);
        expect(cal.quarterOfYear).toBe(1);
    });

    it('settles the dividend when crossing the quarter boundary and rewards full payment', () => {
        const cal = new CampaignCalendar();
        const startSatisfaction = cal.shareholderSatisfaction;
        cal.advanceWeeks(WEEKS_PER_QUARTER, richVault());
        expect(cal.quarterOfYear).toBe(2);
        expect(cal.shareholderSatisfaction).toBe(startSatisfaction + 5);
    });

    it('punishes a missed dividend proportionally to the shortfall', () => {
        const cal = new CampaignCalendar();
        const start = cal.shareholderSatisfaction;
        cal.advanceWeeks(WEEKS_PER_QUARTER, () => 0); // vault is empty
        // full shortfall = 10 + 20*1 = 30 point hit
        expect(cal.shareholderSatisfaction).toBe(start - 30);
    });

    it('sacks the player when satisfaction reaches zero', () => {
        const cal = new CampaignCalendar();
        cal.shareholderSatisfaction = 20;
        cal.advanceWeeks(WEEKS_PER_QUARTER, () => 0);
        expect(cal.isSacked).toBe(true);
    });

    it('escalates the dividend expectation at each new fiscal year', () => {
        const cal = new CampaignCalendar();
        const initial = cal.currentDividendExpectation;
        // Q1-Q3 settle without escalation
        cal.advanceWeeks(WEEKS_PER_QUARTER * 3, richVault());
        expect(cal.currentDividendExpectation).toBe(initial);
        // Q4 settles and rolls into year 2 -> escalation
        cal.advanceWeeks(WEEKS_PER_QUARTER, richVault());
        expect(cal.year).toBe(2);
        expect(cal.currentDividendExpectation).toBe(Math.round(initial * 1.35));
    });

    it('logs a field-hardening warning alongside the new-fiscal-year escalation', () => {
        const cal = new CampaignCalendar();
        cal.advanceWeeks(WEEKS_PER_QUARTER * 4, richVault()); // crosses into year 2
        const hardeningEvent = cal.boardEvents.find(e =>
            e.message.includes('Survey Desk') && e.message.includes('deteriorating conditions')
        );
        expect(hardeningEvent).toBeDefined();
        expect(hardeningEvent!.isWarning).toBe(true);
    });

    it('handles multi-week jumps that cross a boundary mid-jump', () => {
        const cal = new CampaignCalendar();
        let payments = 0;
        cal.week = WEEKS_PER_QUARTER; // last week of Q1
        cal.advanceWeeks(2, due => { payments++; return due; });
        expect(payments).toBe(1);
        expect(cal.quarterOfYear).toBe(2);
        expect(cal.weekOfQuarter).toBe(2);
    });

    it('expires the charter after 10 years', () => {
        const cal = new CampaignCalendar();
        cal.week = WEEKS_PER_QUARTER * 4 * 10; // last week of year 10
        expect(cal.isCharterExpired).toBe(false);
        cal.advanceWeeks(1, richVault());
        expect(cal.isCharterExpired).toBe(true);
    });
});
