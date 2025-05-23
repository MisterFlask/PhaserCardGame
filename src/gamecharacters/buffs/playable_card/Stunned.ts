import { PlayableCard } from "../../PlayableCard";
import { AbstractBuff } from "../AbstractBuff";

export class StunnedBuff extends AbstractBuff {
    constructor(stacks: number = 1) {
        super();
        this.stacks = stacks;
        this.isDebuff = true;
    }

    override getDisplayName(): string {
        return "Stunned";
    }

    override getDescription(): string {
        return `The next ${this.stacks} cards drawn owned by this character cost 1 more energy this combat.`;
    }

    override onAnyCardDrawn(card: PlayableCard): void {
        if (this.stacks > 0 && card.owningCharacter === this.getOwnerAsCharacter()) {
            card.baseEnergyCost++;
            this.stacks--;
        }
    }
}
