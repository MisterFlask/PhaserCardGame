import { StandingOrdersState } from "./orders/StandingOrdersState";

export interface BoardEvent {
    week: number;
    message: string;
    /** true if this is bad news the UI should color red */
    isWarning: boolean;
}

export const WEEKS_PER_QUARTER = 13;
export const QUARTERS_PER_YEAR = 4;
export const CHARTER_YEARS = 10;

/** £ owed per rostered soldier at each quarterly board meeting — wounded
 *  included, since the Company honors its payroll regardless of fitness for
 *  duty. Keeps roster size honest: ongoing drain so hoarding has a cost
 *  (see src/docs/strategic_layer_redesign.md, "What money buys"). Raised
 *  from £15 in the economy balance pass (see CampaignSimulator.test.ts's
 *  "no-free-hoarding" describe block): at £15 a hoarded roster netted MORE
 *  vault on average than a lean one (avg £2510 at ROSTER_CAP vs £2095 at
 *  roster 6, 20 seeds) because wound-attrition throughput starvation on
 *  small rosters dwarfed the wage drag. £25 is the flat-wage frontier this
 *  pass landed on: a roster-5-vs-roster-8 head-to-head lands within 10% (or
 *  ahead) in ~40% of seed pairs (target ~45%; see the sim's measured
 *  before/after table) without making a healthy year-1 roster of 5
 *  actually cashflow-negative in practice — real sim throughput for a
 *  roster of 5 is ~3.7 sorties/quarter (£1000+ vault after year 1), well
 *  above the conservative "2 average contracts/quarter" floor case Wages.
 *  test.ts's baseline-economics sanity check uses, which is intentionally
 *  pessimistic and does go negative at this wage level — see that test's
 *  comment. Higher flat wages (30, the permitted ceiling) nudge T2 further
 *  but overshoot T1: at £30, roster-6's 40-quarter survival rate collapses
 *  well below the 50-80% band (measured ~25/60) while roster-8's barely
 *  moves — a flat wage bites proportionally harder on mid-size rosters
 *  than it closes the roster-5-vs-8 gap, so £25 was kept as the better
 *  overall fit against both targets rather than pushed to the ceiling. */
export const WAGE_PER_SOLDIER_PER_QUARTER = 25;

/** Balance-pass sketch numbers, tuned against CampaignSimulator.test.ts (see
 *  "baseline viability" describe block for the measured before/after). A
 *  flat 1.35x/year compounding escalation made the 40-quarter charter
 *  unwinnable at any roster size (0/10 seeds survived at winRate 0.9, even
 *  with an artificially generous £2000 starting vault — see the pre-fix
 *  `.skip`ped finding in CampaignSimulator.test.ts for the exact numbers).
 *  DIVIDEND_ESCALATION_RATE_BY_YEAR keeps the escalation INTO years 2-4
 *  untouched at 1.35x (the brief's "year-1-to-3 shape" must stay intact —
 *  the doc's "feels the squeeze from year 7" is intended), then decays the
 *  rate for later years so the clock still bites (every late year still
 *  escalates, never flat) without compounding into a guaranteed cliff.
 *  Keyed by the fiscal year being escalated INTO (2..CHARTER_YEARS); years
 *  not present fall back to the last defined entry. */
const DIVIDEND_ESCALATION_RATE_BY_YEAR: Record<number, number> = {
    2: 1.35,
    3: 1.35,
    4: 1.35,
    5: 1.24,
    6: 1.20,
    7: 1.16,
    8: 1.13,
    9: 1.10,
    10: 1.08,
};

/**
 * Campaign time and the shareholder doom clock.
 *
 * Time advances in weeks (sorties consume 1-2 weeks). Every 13 weeks the
 * board expects a dividend, paid automatically from the vault. Expectations
 * escalate yearly. Satisfaction at zero ends the campaign; the charter
 * expires after 10 years regardless.
 */
export class CampaignCalendar {
    /** Absolute week, 1-based. Week 1 = Q1, Year 1. */
    public week: number = 1;

    /** 0-100. The campaign ends if this reaches 0. */
    public shareholderSatisfaction: number = 50;

    /** £ owed at the end of the current quarter. Tuned against a lossless
     *  simulation: optimal play peaks mid-campaign and feels the squeeze from
     *  year 7; real play (wounds, recruits, therapy) feels it sooner. */
    public currentDividendExpectation: number = 120;

    /** Log of board meetings and warnings, newest last. */
    public boardEvents: BoardEvent[] = [];

    public get year(): number {
        return Math.floor((this.week - 1) / (WEEKS_PER_QUARTER * QUARTERS_PER_YEAR)) + 1;
    }

    public get quarterOfYear(): number {
        return Math.floor(((this.week - 1) % (WEEKS_PER_QUARTER * QUARTERS_PER_YEAR)) / WEEKS_PER_QUARTER) + 1;
    }

    public get weekOfQuarter(): number {
        return ((this.week - 1) % WEEKS_PER_QUARTER) + 1;
    }

    public get weeksUntilDividend(): number {
        return WEEKS_PER_QUARTER - this.weekOfQuarter + 1;
    }

    public get isCharterExpired(): boolean {
        return this.year > CHARTER_YEARS;
    }

    public get isSacked(): boolean {
        return this.shareholderSatisfaction <= 0;
    }

    private log(message: string, isWarning: boolean = false): void {
        this.boardEvents.push({ week: this.week, message, isWarning });
        console.log(`[Board, week ${this.week}] ${message}`);
    }

    /**
     * Advance time by N weeks. Returns the number of quarter boundaries
     * crossed (dividends are settled by the caller via settleDividend,
     * which needs access to the vault).
     *
     * getWageBillDue/payWagesFromVault, if supplied together, run at each
     * board meeting BEFORE the dividend draw: getWageBillDue computes the
     * quarter's wage bill (roster size × WAGE_PER_SOLDIER_PER_QUARTER — the
     * caller owns the roster) and payWagesFromVault takes that amount and
     * returns the amount actually paid (limited by vault contents, same
     * contract as payDividendFromVault). Callers that omit them (saves/tests
     * with no roster context) simply skip wages for that advance.
     *
     * onBoardMeetingStart, if supplied, runs FIRST at each board meeting —
     * before wages, before the dividend. It is the seam for quarterly income
     * (strategic-project bonds, embassies): money landing at the meeting is
     * available to the wage bill and the dividend alike. Accounting order is
     * income -> wages -> dividend.
     */
    public advanceWeeks(
        n: number,
        payDividendFromVault: (amountDue: number) => number,
        getWageBillDue?: () => number,
        payWagesFromVault?: (amountDue: number) => number,
        onBoardMeetingStart?: () => void,
    ): void {
        for (let i = 0; i < n; i++) {
            const crossingQuarter = this.weekOfQuarter === WEEKS_PER_QUARTER;
            const settledQuarter = this.quarterOfYear;
            this.week++;
            if (crossingQuarter) {
                this.settleDividend(payDividendFromVault, settledQuarter, getWageBillDue, payWagesFromVault, onBoardMeetingStart);
            }
        }
    }

    /**
     * Quarterly board meeting. onBoardMeetingStart (quarterly income) runs
     * first, then wages settle (getWageBillDue/payWagesFromVault), then the
     * dividend: payFromVault takes the amount due and returns the amount
     * actually paid (limited by vault contents).
     */
    private settleDividend(
        payFromVault: (amountDue: number) => number,
        settledQuarter: number,
        getWageBillDue?: () => number,
        payWagesFromVault?: (amountDue: number) => number,
        onBoardMeetingStart?: () => void,
    ): void {
        // Quarterly income lands before any money leaves the vault, so a
        // same-meeting bond coupon can cover the wage bill it arrives with.
        onBoardMeetingStart?.();

        if (getWageBillDue && payWagesFromVault) {
            const wagesDue = getWageBillDue();
            if (wagesDue > 0) {
                const wagesPaid = payWagesFromVault(wagesDue);
                if (wagesPaid >= wagesDue) {
                    this.log(`Q${settledQuarter} field wages: £${wagesPaid} paid to the roster.`);
                } else {
                    this.log(`Q${settledQuarter} field wages: only £${wagesPaid} of £${wagesDue} could be found. The roster notices.`, true);
                }
            }
        }

        const due = this.currentDividendExpectation;
        const paid = payFromVault(due);

        if (paid >= due) {
            this.shareholderSatisfaction = Math.min(100, this.shareholderSatisfaction + 5);
            this.log(`Q${settledQuarter} dividend of £${due} paid in full. The board purrs. Satisfaction ${this.shareholderSatisfaction}.`);
        } else {
            const shortfallFraction = (due - paid) / due;
            const baseHit = Math.round(10 + 20 * shortfallFraction); // 10-30 point hit
            const hit = StandingOrdersState.getInstance().satisfactionHit(baseHit);
            this.shareholderSatisfaction = Math.max(0, this.shareholderSatisfaction - hit);
            this.log(
                `Q${settledQuarter} dividend SHORT: £${paid} of £${due}. Satisfaction falls ${hit} to ${this.shareholderSatisfaction}.`,
                true
            );
        }

        // Expectations escalate at each year boundary (after Q4 settles).
        if (this.quarterOfYear === 1) {
            const baseRate = DIVIDEND_ESCALATION_RATE_BY_YEAR[this.year]
                ?? DIVIDEND_ESCALATION_RATE_BY_YEAR[CHARTER_YEARS];
            const rate = StandingOrdersState.getInstance().dividendEscalationRate(baseRate);
            this.currentDividendExpectation = Math.round(this.currentDividendExpectation * rate);
            this.log(`New fiscal year: the board raises its dividend expectation to £${this.currentDividendExpectation}.`, true);
            this.log(`The Survey Desk notes deteriorating conditions in the field; no corresponding revision to field pay is planned.`, true);
        }

        if (this.isSacked) {
            this.log(`The board has voted. Your services are no longer required.`, true);
        }

        // Standing Orders ratification happens at the board meeting, the same
        // moment dividends settle — AFTER the dividend/escalation above, so a
        // queued policy change never retroactively affects the quarter it was
        // queued in.
        StandingOrdersState.getInstance().onBoardMeeting();
    }
}
