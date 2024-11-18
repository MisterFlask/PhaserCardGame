import { AbstractBuff } from "../../AbstractBuff";

export class Damaged extends AbstractBuff {
    constructor(stacks: number = 1) {
        super();
        this.imageName = "damaged-tag"; 
        this.stackable = false;
        this.isDebuff = true;
        this.stacks = stacks;
    }

    override getName(): string {
        return "Damaged";
    }

    override getDescription(): string {
        return `Costs 1 more energy.`;
    }

    override energyCostModifier(): number {
        return 1;
    }
}
