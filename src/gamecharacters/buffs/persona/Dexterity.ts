import { AbstractBuff } from "../AbstractBuff";

export class Dexterity extends AbstractBuff {
    constructor(stacks: number = 1) {
        super();
        this.stacks = stacks;
        this.isDebuff = false;
    }

    override getDisplayName(): string {
        return "Dexterity";
    }

    override getDescription(): string {
        return `Increase block applied by ${this.getStacksDisplayText()}.`;
    }

    override getBlockSentModifier(): number {
        return this.stacks;
    }
}
