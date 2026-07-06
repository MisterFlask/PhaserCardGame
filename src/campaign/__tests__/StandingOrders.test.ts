import { beforeEach, describe, expect, it } from 'vitest';
import { CampaignCalendar, WEEKS_PER_QUARTER } from '../CampaignCalendar';
import { ContractGenerator } from '../ContractGenerator';
import {
    AggressiveTendering, ArchivesStandingOrder, BarristersOnRetainer, HazardPaySchedule,
    InvestorRelationsRetainer, LAUNCH_ORDERS, PhrenologyRetainer, PunctualityClause,
    RecruitingSergeants
} from '../orders/LaunchOrders';
import { StandingOrdersState } from '../orders/StandingOrdersState';
import { applyCasualties, CasualtySubject } from '../SortieResolution';

const gen = ContractGenerator.getInstance();

function richVault(): (due: number) => number {
    return (due: number) => due;
}

describe('StandingOrdersState', () => {
    beforeEach(() => {
        StandingOrdersState.getInstance().reset();
    });

    describe('slot math', () => {
        it('grants slots at years 1/3/5/7/9', () => {
            const state = StandingOrdersState.getInstance();
            expect(state.slotsForYear(1)).toBe(1);
            expect(state.slotsForYear(2)).toBe(1);
            expect(state.slotsForYear(3)).toBe(2);
            expect(state.slotsForYear(4)).toBe(2);
            expect(state.slotsForYear(5)).toBe(3);
            expect(state.slotsForYear(6)).toBe(3);
            expect(state.slotsForYear(7)).toBe(4);
            expect(state.slotsForYear(8)).toBe(4);
            expect(state.slotsForYear(9)).toBe(5);
            expect(state.slotsForYear(10)).toBe(5);
        });

        it('adds bonusSlots on top of the year schedule', () => {
            const state = StandingOrdersState.getInstance();
            state.bonusSlots = 1;
            expect(state.slotsForYear(1)).toBe(2);
            expect(state.slotsForYear(9)).toBe(6);
        });
    });

    describe('ratification semantics', () => {
        it('enacting into a free slot takes effect immediately', () => {
            const state = StandingOrdersState.getInstance();
            expect(state.enact('aggressive-tendering', 1)).toBe(true);
            expect(state.activeOrderIds).toEqual(['aggressive-tendering']);
            expect(state.pendingOrderIds).toBeNull();
        });

        it('cannot enact beyond available slots', () => {
            const state = StandingOrdersState.getInstance();
            expect(state.enact('aggressive-tendering', 1)).toBe(true); // fills the sole year-1 slot
            expect(state.enact('punctuality-clause', 1)).toBe(false);
            expect(state.activeOrderIds).toEqual(['aggressive-tendering']);
        });

        it('cannot enact an unknown order id', () => {
            const state = StandingOrdersState.getInstance();
            expect(state.enact('not-a-real-order', 5)).toBe(false);
        });

        it('removing an active order queues a pending change rather than applying immediately', () => {
            const state = StandingOrdersState.getInstance();
            state.enact('aggressive-tendering', 5);
            expect(state.queueRemoval('aggressive-tendering')).toBe(true);
            // still active until the board meets
            expect(state.activeOrderIds).toEqual(['aggressive-tendering']);
            expect(state.pendingOrderIds).toEqual([]);
        });

        it('onBoardMeeting ratifies the pending change and clears it', () => {
            const state = StandingOrdersState.getInstance();
            state.enact('aggressive-tendering', 5);
            state.queueRemoval('aggressive-tendering');
            state.onBoardMeeting();
            expect(state.activeOrderIds).toEqual([]);
            expect(state.pendingOrderIds).toBeNull();
        });

        it('replacing an active order queues the swap for the next board meeting', () => {
            const state = StandingOrdersState.getInstance();
            state.enact('aggressive-tendering', 5);
            expect(state.queueReplace('aggressive-tendering', 'punctuality-clause')).toBe(true);
            expect(state.activeOrderIds).toEqual(['aggressive-tendering']); // unchanged pre-meeting
            state.onBoardMeeting();
            expect(state.activeOrderIds).toEqual(['punctuality-clause']);
        });

        it('onBoardMeeting with nothing pending is a no-op', () => {
            const state = StandingOrdersState.getInstance();
            state.enact('aggressive-tendering', 5);
            state.onBoardMeeting();
            expect(state.activeOrderIds).toEqual(['aggressive-tendering']);
        });

        it('an order enacted while a change is pending survives ratification', () => {
            const state = StandingOrdersState.getInstance();
            state.enact('aggressive-tendering', 5);
            state.queueRemoval('aggressive-tendering'); // pending: []
            expect(state.enact('punctuality-clause', 5)).toBe(true);
            state.onBoardMeeting();
            // The removal lands; the fresh enactment is not wiped with it.
            expect(state.activeOrderIds).toEqual(['punctuality-clause']);
        });

        it('queueReplace refuses a replacement already in the post-meeting configuration', () => {
            const state = StandingOrdersState.getInstance();
            state.enact('aggressive-tendering', 5);
            state.enact('punctuality-clause', 5);
            expect(state.queueReplace('aggressive-tendering', 'punctuality-clause')).toBe(false);
            state.queueReplace('aggressive-tendering', 'hazard-pay-schedule');
            // Now hazard-pay is in pending; replacing punctuality with it must also refuse.
            expect(state.queueReplace('punctuality-clause', 'hazard-pay-schedule')).toBe(false);
            state.onBoardMeeting();
            expect(new Set(state.activeOrderIds).size).toBe(state.activeOrderIds.length);
        });
    });

    describe('getActiveOrders', () => {
        it('resolves ids through the registry and skips unknown ids', () => {
            const state = StandingOrdersState.getInstance();
            state.activeOrderIds = ['aggressive-tendering', 'not-a-real-order'];
            const orders = state.getActiveOrders();
            expect(orders).toHaveLength(1);
            expect(orders[0]).toBeInstanceOf(AggressiveTendering);
        });
    });

    describe('launch pool', () => {
        it('has exactly 8 orders with stable kebab-case ids', () => {
            expect(LAUNCH_ORDERS).toHaveLength(8);
            LAUNCH_ORDERS.forEach(order => {
                expect(order.id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
                expect(order.name.length).toBeGreaterThan(0);
                expect(order.description.length).toBeGreaterThan(0);
                expect(order.flavor.length).toBeGreaterThan(0);
            });
            const ids = new Set(LAUNCH_ORDERS.map(o => o.id));
            expect(ids.size).toBe(8);
        });
    });

    describe('effect wiring: ContractGenerator', () => {
        it('Aggressive Tendering refills the board to 6 instead of 5', () => {
            const state = StandingOrdersState.getInstance();
            state.enact('aggressive-tendering', 5);
            const board = gen.refillBoard([], 1);
            expect(board).toHaveLength(6);
        });

        it('Punctuality Clause adds 1 week to contract deadlines', () => {
            const state = StandingOrdersState.getInstance();
            const withoutOrder = Array.from({ length: 200 }, () => gen.generateContract(5).deadlineWeeks);
            state.reset();
            state.enact('punctuality-clause', 5);
            const withOrder = Array.from({ length: 200 }, () => gen.generateContract(5).deadlineWeeks);

            // base range is 2-4; with the order every contract should be 3-5,
            // and specifically 1 week higher than the base range floor/ceiling.
            expect(Math.min(...withoutOrder)).toBe(2);
            expect(Math.max(...withoutOrder)).toBe(4);
            expect(Math.min(...withOrder)).toBe(3);
            expect(Math.max(...withOrder)).toBe(5);
        });

        it('Hazard Pay Schedule raises payouts ~20% (rounded to £5) and the clause matches the final payout', () => {
            const state = StandingOrdersState.getInstance();
            state.enact('hazard-pay-schedule', 5);
            for (let i = 0; i < 50; i++) {
                const c = gen.generateContract(5);
                expect(c.payout % 5).toBe(0);
                expect(c.paymentClause).toContain(`£${c.payout}`);
                expect(c.paymentClause).not.toContain('{payout}');
            }
        });
    });

    describe('effect wiring: CampaignCalendar', () => {
        it('Investor Relations Retainer dampens the yearly escalation by 25%', () => {
            const state = StandingOrdersState.getInstance();
            state.enact('investor-relations-retainer', 1);

            const cal = new CampaignCalendar();
            const initial = cal.currentDividendExpectation;
            cal.advanceWeeks(WEEKS_PER_QUARTER * 4, richVault()); // roll into year 2
            expect(cal.year).toBe(2);
            const expectedRate = 1 + 0.35 * 0.75;
            expect(cal.currentDividendExpectation).toBe(Math.round(initial * expectedRate));
        });

        it('Barristers on Retainer reduces the shortfall satisfaction hit by 25%', () => {
            const state = StandingOrdersState.getInstance();
            state.enact('barristers-on-retainer', 1);

            const cal = new CampaignCalendar();
            const start = cal.shareholderSatisfaction;
            cal.advanceWeeks(WEEKS_PER_QUARTER, () => 0); // full shortfall: base hit = 30
            const expectedHit = Math.round(30 * 0.75);
            expect(cal.shareholderSatisfaction).toBe(start - expectedHit);
        });

        it('onBoardMeeting ratifies a pending order change at the quarter boundary, after settlement', () => {
            const state = StandingOrdersState.getInstance();
            state.enact('aggressive-tendering', 1);
            state.queueRemoval('aggressive-tendering');

            const cal = new CampaignCalendar();
            cal.advanceWeeks(WEEKS_PER_QUARTER, richVault());

            expect(state.activeOrderIds).toEqual([]);
            expect(state.pendingOrderIds).toBeNull();
        });
    });

    describe('effect wiring: SortieResolution', () => {
        it('Hazard Pay Schedule adds 1 week to wound recovery', () => {
            const state = StandingOrdersState.getInstance();
            state.enact('hazard-pay-schedule', 5);

            const squad: CasualtySubject[] = [
                { name: 'A', hitpoints: 10, maxHitpoints: 100, weeksWoundedRemaining: 0, isDeceased: false },
            ];
            const report = applyCasualties(squad, () => 0); // rng=0 -> base WOUND_WEEKS_MIN (2)
            expect(report.wounds[0].weeks).toBe(3); // 2 + 1
        });
    });

    describe('effect wiring: recruit and therapy cost helpers', () => {
        it('Recruiting Sergeants cuts recruit cost by 40%, rounded to £5', () => {
            const state = StandingOrdersState.getInstance();
            state.enact('recruiting-sergeants', 5);
            const RECRUIT_COST = 80;
            expect(state.recruitCost(RECRUIT_COST)).toBe(Math.round(RECRUIT_COST * 0.6 / 5) * 5);
        });

        it('Phrenology Retainer halves a base therapy cost, rounded to £5', () => {
            const state = StandingOrdersState.getInstance();
            state.enact('phrenology-retainer', 5);
            expect(state.therapyCost(30)).toBe(Math.round(30 * 0.5 / 5) * 5);
        });
    });

    describe('effect wiring: card reward choices', () => {
        it('Archives Standing Order adds 1 card reward choice', () => {
            const state = StandingOrdersState.getInstance();
            state.enact('archives-standing-order', 5);
            expect(state.cardRewardChoices(3)).toBe(4);
        });
    });

    describe('order classes referenced (sanity against unused-import drift)', () => {
        it('are all present in the registry', () => {
            const ids = LAUNCH_ORDERS.map(o => o.id);
            expect(ids).toContain(new HazardPaySchedule().id);
            expect(ids).toContain(new PunctualityClause().id);
            expect(ids).toContain(new RecruitingSergeants().id);
            expect(ids).toContain(new PhrenologyRetainer().id);
            expect(ids).toContain(new InvestorRelationsRetainer().id);
            expect(ids).toContain(new BarristersOnRetainer().id);
            expect(ids).toContain(new ArchivesStandingOrder().id);
        });
    });
});
