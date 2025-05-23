// While this is on the card, increases its cost by 1.
// ticks down by 1 each turn; goes away when it reaches 0.

import { AbstractBuff } from "../AbstractBuff";

export class CostIncreased extends AbstractBuff {
    constructor(stacks: number = 1) {
        super();
        this.stacks = stacks;
        this.isDebuff = true;
        this.imageName = "cost-up";
    }

    override getDisplayName(): string {
        return "Cost Increased";
    }

    override getDescription(): string {
        return `This card costs 1 more for the next ${this.stacks} turn(s).`;
    }

    override onTurnEnd(): void {
        if (this.stacks > 0) {
            this.stacks--;
        }
    }

    override energyCostModifier(): number {
        return 1;
    }
}


