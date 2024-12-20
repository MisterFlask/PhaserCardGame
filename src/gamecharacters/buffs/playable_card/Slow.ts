import { AbstractBuff } from "../AbstractBuff";

export class SlowBuff extends AbstractBuff {
    constructor(stacks: number = 1) {
        super();
        this.stacks = stacks;
        this.isDebuff = true;
    }

    override getDisplayName(): string {
        return "Slow";
    }

    override getDescription(): string {
        return `The next ${this.stacks} cards drawn cost 1 more energy this combat.`;
    }

    override onCardDrawn(): void {
        if (this.stacks > 0) {
            this.getOwnerAsPlayableCard()!.baseEnergyCost++;
            this.stacks--;
        }
    }
}
