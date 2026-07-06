// Pure, Phaser-free. Slot-limited, swappable Standing Orders state (see
// src/docs/strategic_layer_redesign.md, "Amendment: Standing Orders").
//
// Ratification semantics:
//  - Enacting an order into a FREE slot takes effect immediately (the board
//    readily approves new policy that costs it nothing).
//  - Removing or replacing an ACTIVE order goes into `pendingOrderIds` and is
//    applied by onBoardMeeting() (the board must meet to reverse itself).
//  - onBoardMeeting() applies pending -> active and clears pending. Callers
//    must invoke this AFTER the quarter's dividend settles, so a policy
//    change doesn't retroactively affect the quarter it was queued in.

import { StandingOrder } from "./StandingOrder";
import { LAUNCH_ORDERS } from "./LaunchOrders";

export const STANDING_ORDER_REGISTRY: Map<string, StandingOrder> = new Map(
    LAUNCH_ORDERS.map(order => [order.id, order])
);

type OrderHookName =
    | "modifyContractPayout"
    | "modifyContractDeadlineWeeks"
    | "modifyContractBoardTarget"
    | "modifyRecruitCost"
    | "modifyTherapyCost"
    | "modifyWoundWeeks"
    | "modifyDividendEscalationRate"
    | "modifySatisfactionHit"
    | "modifyCardRewardChoices";

export class StandingOrdersState {
    private static instance: StandingOrdersState;
    public static getInstance(): StandingOrdersState {
        if (!StandingOrdersState.instance) {
            StandingOrdersState.instance = new StandingOrdersState();
        }
        return StandingOrdersState.instance;
    }

    /** Currently ratified order ids, in enactment order. */
    public activeOrderIds: string[] = [];
    /** Queued change awaiting the next board meeting; null = nothing pending. */
    public pendingOrderIds: string[] | null = null;
    /** Extra slots beyond the year-based schedule (future Company Secretariat). */
    public bonusSlots: number = 0;

    private constructor() {}

    /** Resets all state. For tests and new-campaign setup. */
    public reset(): void {
        this.activeOrderIds = [];
        this.pendingOrderIds = null;
        this.bonusSlots = 0;
    }

    /** 1 slot at campaign start; +1 at years 3, 5, 7, 9 (max 5 before bonuses). */
    public slotsForYear(year: number): number {
        let slots = 1;
        if (year >= 3) slots++;
        if (year >= 5) slots++;
        if (year >= 7) slots++;
        if (year >= 9) slots++;
        return slots + this.bonusSlots;
    }

    /** Resolved order objects for the active ids; unknown ids are skipped. */
    public getActiveOrders(): StandingOrder[] {
        const orders: StandingOrder[] = [];
        this.activeOrderIds.forEach(id => {
            const order = STANDING_ORDER_REGISTRY.get(id);
            if (order) {
                orders.push(order);
            } else {
                console.warn(`StandingOrdersState: unknown order id "${id}", skipping`);
            }
        });
        return orders;
    }

    /**
     * Enact an order into a free slot for the given year. Returns false (no
     * change) if the order is unknown, already active, or no free slot exists.
     * Free-slot enactment is immediate — no board meeting required.
     */
    public enact(orderId: string, year: number): boolean {
        if (!STANDING_ORDER_REGISTRY.has(orderId)) return false;
        if (this.activeOrderIds.includes(orderId)) return false;
        if (this.activeOrderIds.length >= this.slotsForYear(year)) return false;
        // A pending change is the post-meeting configuration; a fresh
        // enactment must survive ratification, so it joins both lists.
        if (this.pendingOrderIds !== null) {
            if (this.pendingOrderIds.includes(orderId)) return false;
            if (this.pendingOrderIds.length >= this.slotsForYear(year)) return false;
            this.pendingOrderIds = [...this.pendingOrderIds, orderId];
        }

        this.activeOrderIds.push(orderId);
        return true;
    }

    /**
     * Remove an active order. Does not take effect immediately: it queues
     * into pendingOrderIds (a snapshot of activeOrderIds minus this one),
     * ratified at the next onBoardMeeting().
     */
    public queueRemoval(orderId: string): boolean {
        if (!this.activeOrderIds.includes(orderId)) return false;
        const base = this.pendingOrderIds ?? [...this.activeOrderIds];
        this.pendingOrderIds = base.filter(id => id !== orderId);
        return true;
    }

    /**
     * Replace an active order with a different one, within the same slot.
     * Queues into pendingOrderIds, ratified at the next onBoardMeeting().
     */
    public queueReplace(activeOrderId: string, newOrderId: string): boolean {
        if (!this.activeOrderIds.includes(activeOrderId)) return false;
        if (!STANDING_ORDER_REGISTRY.has(newOrderId)) return false;
        const base = this.pendingOrderIds ?? [...this.activeOrderIds];
        // Never produce a duplicate: the replacement may not already be in
        // the post-meeting configuration.
        if (base.includes(newOrderId)) return false;
        const index = base.indexOf(activeOrderId);
        if (index === -1) return false;
        const next = [...base];
        next[index] = newOrderId;
        this.pendingOrderIds = next;
        return true;
    }

    /** Ratify any pending change. Call after the quarter's dividend settles. */
    public onBoardMeeting(): void {
        if (this.pendingOrderIds !== null) {
            this.activeOrderIds = this.pendingOrderIds;
            this.pendingOrderIds = null;
        }
    }

    private apply(hook: OrderHookName, base: number): number {
        return this.getActiveOrders().reduce((value, order) => (order[hook] as (n: number) => number)(value), base);
    }

    public contractPayout(base: number): number { return this.apply("modifyContractPayout", base); }
    public contractDeadlineWeeks(base: number): number { return this.apply("modifyContractDeadlineWeeks", base); }
    public contractBoardTarget(base: number): number { return this.apply("modifyContractBoardTarget", base); }
    public recruitCost(base: number): number { return this.apply("modifyRecruitCost", base); }
    public therapyCost(base: number): number { return this.apply("modifyTherapyCost", base); }
    public woundWeeks(base: number): number { return this.apply("modifyWoundWeeks", base); }
    public dividendEscalationRate(base: number): number { return this.apply("modifyDividendEscalationRate", base); }
    public satisfactionHit(base: number): number { return this.apply("modifySatisfactionHit", base); }
    public cardRewardChoices(base: number): number { return this.apply("modifyCardRewardChoices", base); }
}
