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
import { CLIENT_RETAINER_ORDERS } from "./ClientRetainerOrders";

/** Every known order, launch pool and client retainers alike, always
 *  resolvable regardless of a retainer's unlock state. Internal resolution
 *  (getActiveOrders, save-load id lookup) must use this rather than the
 *  gated STANDING_ORDER_REGISTRY below, so an already-ratified retainer
 *  order is never "forgotten". */
const ALL_ORDERS_BY_ID: Map<string, StandingOrder> = new Map(
    [...LAUNCH_ORDERS, ...CLIENT_RETAINER_ORDERS].map(order => [order.id, order])
);

/** Client-retainer order ids, for the visibility gate below. Kept in this
 *  file (rather than re-deriving from CampaignUiState, which would create an
 *  import cycle: CampaignUiState -> ContractGenerator -> StandingOrdersState)
 *  as the set of ids ClientRetainerOrders.ts itself defines. */
const CLIENT_RETAINER_ORDER_ID_SET: Set<string> = new Set(CLIENT_RETAINER_ORDERS.map(o => o.id));

/**
 * Predicate the UI consults to decide whether a client-retainer order should
 * appear in the main Standing Orders grid yet (vs. InvestmentPanel's locked
 * placeholder row). Wired by CampaignUiState at module init (see the bottom
 * of that file) to CampaignUiState.isClientRetainerUnlockedForOrder, since
 * CampaignUiState owns CLIENT_RETAINER_ORDER_IDS and the completion counts
 * (house rule 3/6) and this module cannot import it directly without a load
 * cycle. Defaults to "always unlocked" so a direct StandingOrdersState test
 * that never wires this still sees every order (matches pre-retainer
 * behavior for the launch pool, and is the permissive default for tests that
 * don't care about retainer gating).
 */
let isRetainerOrderUnlocked: (orderId: string) => boolean = () => true;

/** Called once by CampaignUiState to supply the live unlock check. Not part
 *  of the public API surface other modules should call. */
export function _wireRetainerUnlockCheck(check: (orderId: string) => boolean): void {
    isRetainerOrderUnlocked = check;
}

function isVisible(orderId: string, order: StandingOrder): boolean {
    if (!CLIENT_RETAINER_ORDER_ID_SET.has(orderId)) return true; // launch pool: always visible
    const state = StandingOrdersState.getInstance();
    if (state.activeOrderIds.includes(orderId)) return true; // never hide an already-ratified order
    if (state.pendingOrderIds?.includes(orderId)) return true;
    return isRetainerOrderUnlocked(orderId);
}

class GatedStandingOrderRegistry {
    private visibleEntries(): [string, StandingOrder][] {
        return [...ALL_ORDERS_BY_ID.entries()].filter(([id, order]) => isVisible(id, order));
    }
    public get(id: string): StandingOrder | undefined {
        const order = ALL_ORDERS_BY_ID.get(id);
        return order && isVisible(id, order) ? order : undefined;
    }
    public has(id: string): boolean { return this.get(id) !== undefined; }
    public values(): IterableIterator<StandingOrder> { return this.visibleEntries().map(([, o]) => o)[Symbol.iterator](); }
    public keys(): IterableIterator<string> { return this.visibleEntries().map(([id]) => id)[Symbol.iterator](); }
    public [Symbol.iterator](): IterableIterator<[string, StandingOrder]> { return this.visibleEntries()[Symbol.iterator](); }
}

/**
 * The board's currently-offerable Standing Orders: the launch pool, always,
 * plus client-retainer orders once unlocked for their client (or already
 * ratified/pending). Behaves like a read-only Map (values()/has()/get()),
 * recomputed on every access since unlock state changes as contracts
 * complete. InvestmentPanel's main order grid iterates
 * STANDING_ORDER_REGISTRY.values() and relies on exactly this gating to keep
 * not-yet-unlocked retainers out of the grid — its locked-row placeholder
 * covers them instead — and StandingOrdersState.enact/queueReplace rely on
 * STANDING_ORDER_REGISTRY.has() to refuse enacting a locked retainer.
 */
export const STANDING_ORDER_REGISTRY: {
    get(id: string): StandingOrder | undefined;
    has(id: string): boolean;
    values(): IterableIterator<StandingOrder>;
    keys(): IterableIterator<string>;
    [Symbol.iterator](): IterableIterator<[string, StandingOrder]>;
} = new GatedStandingOrderRegistry();

type OrderHookName =
    | "modifyContractPayout"
    | "modifyContractDeadlineWeeks"
    | "modifyContractBoardTarget"
    | "modifyRecruitCost"
    | "modifyTherapyCost"
    | "modifyWoundWeeks"
    | "modifyDividendEscalationRate"
    | "modifySatisfactionHit"
    | "modifyCardRewardChoices"
    | "modifyStatusApplicationStacks"
    | "modifyXpGain"
    | "modifyFreightRatePerCrate";

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

    /** 1 slot at campaign start; +1 at years 3, 5, 7, 9 (max 5 before bonuses).
     *  `unionSlotPenalty` (default 0) is the Union-Hostile suspension from
     *  FactionPressures.unionOrderSlotPenalty (faction_reputation_design.md
     *  v2.1 amendment) — callers thread it through, EXCEPT the save-restore
     *  re-enactment path (CampaignSerializer), which deliberately passes
     *  nothing so restoring prior state never fails on pressure. Floored at
     *  1: the Company always keeps one order running. */
    public slotsForYear(year: number, unionSlotPenalty: number = 0): number {
        let slots = 1;
        if (year >= 3) slots++;
        if (year >= 5) slots++;
        if (year >= 7) slots++;
        if (year >= 9) slots++;
        return Math.max(1, slots + this.bonusSlots - unionSlotPenalty);
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
     *
     * `unionSlotPenalty` (default 0, see slotsForYear) gates only NEW
     * enactments while over quota — an order already active from before the
     * Union went Hostile stays active by construction (this method never
     * evicts anything); it's the quota check on the way IN that shrinks
     * (faction_reputation_design.md v2.1 amendment).
     */
    public enact(orderId: string, year: number, unionSlotPenalty: number = 0): boolean {
        if (!STANDING_ORDER_REGISTRY.has(orderId)) return false;
        if (this.activeOrderIds.includes(orderId)) return false;
        if (this.activeOrderIds.length >= this.slotsForYear(year, unionSlotPenalty)) return false;
        // A pending change is the post-meeting configuration; a fresh
        // enactment must survive ratification, so it joins both lists.
        if (this.pendingOrderIds !== null) {
            if (this.pendingOrderIds.includes(orderId)) return false;
            if (this.pendingOrderIds.length >= this.slotsForYear(year, unionSlotPenalty)) return false;
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
    public xpGain(base: number): number { return this.apply("modifyXpGain", base); }
    public freightRatePerCrate(base: number): number { return this.apply("modifyFreightRatePerCrate", base); }

    /** Wipe insurance (Underwriting Retainer): £ recovered on a squad-wipe
     *  contract failure, summed across any active orders that grant it
     *  (in practice at most one — see LaunchOrders). */
    public wipeInsurancePayout(contractPayout: number): number {
        return this.getActiveOrders().reduce((total, order) => total + order.wipeInsurancePayout(contractPayout), 0);
    }

    /** Death benefit (Ossuary Death Benefit retainer): £ credited to the
     *  vault per Company soldier death, summed across any active orders that
     *  grant it. */
    public deathBenefitPerCasualty(): number {
        return this.getActiveOrders().reduce((total, order) => total + order.deathBenefitPerCasualty(), 0);
    }

    /** buffId is a stable canonical buff name (AbstractBuff.getBuffCanonicalName()). */
    public statusApplicationStacks(buffId: string, stacks: number, sourceIsAlly: boolean, targetIsAlly: boolean): number {
        return this.getActiveOrders().reduce(
            (value, order) => order.modifyStatusApplicationStacks(buffId, value, sourceIsAlly, targetIsAlly),
            stacks
        );
    }
}
