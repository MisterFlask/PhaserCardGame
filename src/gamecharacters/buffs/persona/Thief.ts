import { AbstractBuff } from "../AbstractBuff";

export class Thief extends AbstractBuff {
    constructor(stacks: number = 1) {
        super();
        this.stacks = stacks;
        this.isDebuff = false;
        this.isPersistentBetweenCombats = true;
        this.isPersonaTrait = true;
    }

    override getDisplayName(): string {
        return "Known Thief";
    }

    override getDescription(): string {
        return `At each merchant, one random card is 'free'.`;
    }
}
