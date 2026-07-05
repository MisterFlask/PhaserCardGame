export interface BoardEvent {
    week: number;
    message: string;
    /** true if this is bad news the UI should color red */
    isWarning: boolean;
}

export const WEEKS_PER_QUARTER = 13;
export const QUARTERS_PER_YEAR = 4;
export const CHARTER_YEARS = 10;

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
     */
    public advanceWeeks(n: number, payDividendFromVault: (amountDue: number) => number): void {
        for (let i = 0; i < n; i++) {
            const crossingQuarter = this.weekOfQuarter === WEEKS_PER_QUARTER;
            const settledQuarter = this.quarterOfYear;
            this.week++;
            if (crossingQuarter) {
                this.settleDividend(payDividendFromVault, settledQuarter);
            }
        }
    }

    /**
     * Quarterly board meeting. payFromVault takes the amount due and returns
     * the amount actually paid (limited by vault contents).
     */
    private settleDividend(payFromVault: (amountDue: number) => number, settledQuarter: number): void {
        const due = this.currentDividendExpectation;
        const paid = payFromVault(due);

        if (paid >= due) {
            this.shareholderSatisfaction = Math.min(100, this.shareholderSatisfaction + 5);
            this.log(`Q${settledQuarter} dividend of £${due} paid in full. The board purrs. Satisfaction ${this.shareholderSatisfaction}.`);
        } else {
            const shortfallFraction = (due - paid) / due;
            const hit = Math.round(10 + 20 * shortfallFraction); // 10-30 point hit
            this.shareholderSatisfaction = Math.max(0, this.shareholderSatisfaction - hit);
            this.log(
                `Q${settledQuarter} dividend SHORT: £${paid} of £${due}. Satisfaction falls ${hit} to ${this.shareholderSatisfaction}.`,
                true
            );
        }

        // Expectations escalate at each year boundary (after Q4 settles).
        if (this.quarterOfYear === 1) {
            this.currentDividendExpectation = Math.round(this.currentDividendExpectation * 1.35);
            this.log(`New fiscal year: the board raises its dividend expectation to £${this.currentDividendExpectation}.`, true);
        }

        if (this.isSacked) {
            this.log(`The board has voted. Your services are no longer required.`, true);
        }
    }
}
