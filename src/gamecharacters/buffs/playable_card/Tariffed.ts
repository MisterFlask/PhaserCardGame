import { AbstractBuff } from "../AbstractBuff";

export class Tariffed extends AbstractBuff {
    constructor(stacks: number = 1) {
        super();
        this.isDebuff = true;
        this.stacks = stacks;
        this.imageName = "coins";
    }

    override getDisplayName(): string {
        return "Tariffed";
    }

    override getDescription(): string {
        return `Costs ${this.getStacksDisplayText()} more energy.`;
    }

    override energyCostModifier(): number {
        return this.stacks;
    }
}
