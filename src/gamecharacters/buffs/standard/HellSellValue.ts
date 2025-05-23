import { AbstractBuff } from "../AbstractBuff";

export class HellSellValue extends AbstractBuff {
    constructor(stacks: number = 1) {
        super();
        this.imageName = "valuable-in-hell";
        this.stackable = true;
        this.isDebuff = false;
        this.stacks = stacks;
    }

    override getBuffCanonicalName(): string {
        return "HELL_SELL_VALUE";
    }

    override getDisplayName(): string {
        return "Hell Sell Value";
    }

    override getDescription(): string {
        return `The sell value of this card in Hell is, at baseline, ${this.getStacksDisplayText()} 💷.`;
    }

    override hellValueFlatModifier(): number {
        return this.stacks;
    }
}
