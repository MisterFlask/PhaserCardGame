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

    public regionName: string;

    constructor(args: {
        name: string;
        description: string;
        type: ContractType;
        act: number;
        segment: number;
        difficultyStars: number;
        numCombats: number;
        deadlineWeeks: number;
        durationWeeks: number;
        payout: number;
        regionName: string;
    }) {
        this.name = args.name;
        this.description = args.description;
        this.type = args.type;
        this.act = args.act;
        this.segment = args.segment;
        this.difficultyStars = args.difficultyStars;
        this.numCombats = args.numCombats;
        this.deadlineWeeks = args.deadlineWeeks;
        this.durationWeeks = args.durationWeeks;
        this.payout = args.payout;
        this.regionName = args.regionName;
    }
}
