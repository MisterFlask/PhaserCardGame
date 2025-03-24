import { AbstractBuff } from "../AbstractBuff";

export class SurfaceSellValue extends AbstractBuff {
    constructor(stacks: number = 1) {
        super();
        this.imageName = "valuable-on-surface";
        this.stackable = true;
        this.isDebuff = false;
        this.stacks = stacks;
    }

    override getDisplayName(): string {
        return "Surface Sale Value";
    }

    override getDescription(): string {
        return `You can sell this on the surface for ${this.getStacksDisplayText()} 💷.`;
    }

    override surfaceValueModifier(): number {
        return this.stacks;
    }
}
