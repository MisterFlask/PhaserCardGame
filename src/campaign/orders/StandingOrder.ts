// Pure, Phaser-free. Standing Orders are board-ratified policies occupying
// limited slots (see src/docs/strategic_layer_redesign.md, "Amendment:
// Standing Orders"). Each order is a small bundle of hook overrides; the
// identity defaults mean an order only needs to override what it changes.

/**
 * A single board-ratified policy. Subclasses override only the hooks they
 * affect; every hook defaults to identity (no effect). Effects are combined
 * across all active orders by StandingOrdersState, in registration order —
 * no order needs to know about any other order.
 */
export abstract class StandingOrder {
    /** Stable kebab-case key, used in saves. Never change once shipped. */
    public abstract readonly id: string;
    public abstract readonly name: string;
    /** Player-facing BBCode; £ for money, dry corporate register. */
    public abstract readonly description: string;
    /** One dry corporate line, invoice/memo register. */
    public abstract readonly flavor: string;

    public modifyContractPayout(p: number): number { return p; }
    public modifyContractDeadlineWeeks(w: number): number { return w; }
    public modifyContractBoardTarget(n: number): number { return n; }
    public modifyRecruitCost(c: number): number { return c; }
    public modifyTherapyCost(c: number): number { return c; }
    public modifyWoundWeeks(w: number): number { return w; }
    /** rate is a multiplier, e.g. 1.35 for +35%/year. */
    public modifyDividendEscalationRate(rate: number): number { return rate; }
    /** hit is the shareholder-satisfaction point loss from a short dividend. */
    public modifySatisfactionHit(hit: number): number { return hit; }
    public modifyCardRewardChoices(n: number): number { return n; }
    /**
     * Combat/card-mechanics hook (see strategic_layer_redesign.md, "Amendment:
     * Standing Orders" — "+2 damage to Burning" is a legitimate order). Called
     * whenever a status/buff is applied to a combat character, before stacks
     * are committed. `buffId` is the buff's stable canonical name (e.g.
     * "Burning", from AbstractBuff.getBuffCanonicalName()); `sourceIsAlly` /
     * `targetIsAlly` describe who is applying and who is receiving, so an
     * order can distinguish offense from self-affliction. The order checks
     * buffId itself — combat code must never branch on which order is active
     * (house rule 6).
     */
    public modifyStatusApplicationStacks(buffId: string, stacks: number, sourceIsAlly: boolean, targetIsAlly: boolean): number { return stacks; }
}
