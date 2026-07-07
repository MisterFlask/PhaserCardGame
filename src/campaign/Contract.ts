// Uses the Phaser-free guid helper so this module stays importable from
// headless unit tests (AbstractCard's version drags in Phaser).
import { generateWordGuid } from "../utils/Guid";

export enum ContractType {
    BOUNTY = "Bounty",          // straight combat: clear the target, get paid
    TRADE_RUN = "Trade Run",    // freight: crates pay per-unit but clog the deck with cargo cards.
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

    /** Trade Run only: maximum crates the freight stepper allows (0/absent
     *  on combat contracts). */
    public maxCrates: number;
    /** Trade Run only: £ paid per crate delivered, on top of the (low) base
     *  `payout` (0/absent on combat contracts). */
    public freightRatePerCrate: number;
    /**
     * Trade Run only: crates the player actually loaded at muster, 0..
     * maxCrates. Chosen at dispatch, not generation — deliberately NOT
     * serialized (see ContractDTO / SAVE_FORMAT_VERSION 8 history comment):
     * a sortie is never mid-flight in a save (saves are HQ-only, house rule
     * 4), so a contract on the board always has cratesLoaded 0 and never
     * needs to survive a reload.
     */
    public cratesLoaded: number = 0;

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
        maxCrates?: number;
        freightRatePerCrate?: number;
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
        this.maxCrates = args.maxCrates ?? 0;
        this.freightRatePerCrate = args.freightRatePerCrate ?? 0;
    }

    /** True for trade-run contracts: the muster UI shows a freight stepper
     *  and payout includes cratesLoaded * freightRatePerCrate. */
    public get isTradeRun(): boolean {
        return this.type === ContractType.TRADE_RUN;
    }

    /** Projected payout at the current cratesLoaded (base contract's payout
     *  field IS the low base for trade runs — see ContractGenerator). */
    public get projectedPayout(): number {
        return this.payout + this.cratesLoaded * this.freightRatePerCrate;
    }
}
