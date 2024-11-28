import { AbstractBuff } from "../AbstractBuff";

export class Bulwark extends AbstractBuff {
    constructor(stacks: number = 1) {
        super();
        this.stacks = stacks;
        this.isDebuff = false;
    }

    override getDisplayName(): string {
        return "Bulwark";
    }

    override getDescription(): string {
        return `Increase block applied by ${this.getStacksDisplayText()}.`;
    }

    override getBlockSentModifier(): number {
        return this.stacks;
    }
}
