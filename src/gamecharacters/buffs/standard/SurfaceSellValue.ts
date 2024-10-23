import { AbstractBuff } from "../AbstractBuff";

export class SurfaceSellValue extends AbstractBuff {
    constructor(stacks: number = 1) {
        super();
        this.imageName = "valuable-on-surface";
        this.stackable = true;
        this.isDebuff = false;
        this.stacks = stacks;
    }

    override getName(): string {
        return "Valuable on Surface";
    }

    override getDescription(): string {
        return `Increases the Surface value of this card by ${this.getStacksDisplayText()}.`;
    }

    override surfaceValueModifier(): number {
        return this.stacks;
    }
}
