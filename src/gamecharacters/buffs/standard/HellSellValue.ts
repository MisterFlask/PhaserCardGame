import { AbstractBuff } from "../AbstractBuff";

export class HellSellValue extends AbstractBuff {
    constructor(stacks: number = 1) {
        super();
        this.imageName = "valuable-in-hell";
        this.stackable = true;
        this.isDebuff = false;
        this.stacks = stacks;
    }

    override getName(): string {
        return "Hell Sell Value";
    }

    override getDescription(): string {
        return `Increases the Hell value of this card by ${this.getStacksDisplayText()}.`;
    }

    override hellValueModifier(): number {
        return this.stacks;
    }
}
