// Uses the Phaser-free guid helper so this module stays importable from
// headless unit tests (AbstractCard's version drags in Phaser).
import { generateWordGuid } from "../utils/Guid";

export enum ContractType {
    BOUNTY = "Bounty",          // straight combat: clear the target, get paid
    TRADE_RUN = "Trade Run",    // escort cargo (cargo cards clog the deck); pays more. v2.
    PROCUREMENT = "Procurement" // payout in cards/resources rather than cash. v2.
}

/**
 * A contract posted on the HQ board. Undertaking one launches a sortie of
 * 1-2 combats; contracts expire off the board after deadlineWeeks.
 */
export class Contract {
    public id: string = generateWordGuid();
    public name: string;
    public description: string;
    public type: ContractType;

    /** The paying party. Every contract must communicate whose money this is. */
    public client: string;
    /** One invoice-style sentence describing how/when payment is rendered. */
    public paymentClause: string;

    /** Which encounter table the sortie pulls from. */
    public act: number;
    public segment: number;
    /** 1-3, shown to the player; derived from act/segment tier. */
    public difficultyStars: number;

    public numCombats: number;
    /** Weeks remaining before the contract vanishes off the board. */
    public deadlineWeeks: number;
    /** Weeks consumed by undertaking the sortie. */
    public durationWeeks: number;
    /** £ paid into the vault on completion. */
    public payout: number;
    /** Soldiers required to muster for this contract: 2, 3, or 4. */
    public squadSize: number;

    public regionName: string;

    /** Name of an AbstractConsumable to grant on completion (resolved to an
     *  instance by the UI layer via ConsumablesLibrary — src/campaign/ stores
     *  only the string, never the instance, per house rule 1). */
    public consumableRewardName?: string;

    constructor(args: {
        name: string;
        description: string;
        type: ContractType;
        client: string;
        paymentClause: string;
        act: number;
        segment: number;
        difficultyStars: number;
        numCombats: number;
        deadlineWeeks: number;
        durationWeeks: number;
        payout: number;
        squadSize: number;
        regionName: string;
        consumableRewardName?: string;
    }) {
        this.name = args.name;
        this.description = args.description;
        this.type = args.type;
        this.client = args.client;
        this.paymentClause = args.paymentClause;
        this.act = args.act;
        this.segment = args.segment;
        this.difficultyStars = args.difficultyStars;
        this.numCombats = args.numCombats;
        this.deadlineWeeks = args.deadlineWeeks;
        this.durationWeeks = args.durationWeeks;
        this.payout = args.payout;
        this.squadSize = args.squadSize;
        this.regionName = args.regionName;
        this.consumableRewardName = args.consumableRewardName;
    }
}
