import { AbstractBuff } from "../AbstractBuff";
import { SlowBuff } from "./Slow";

export class StickyBuff extends AbstractBuff {
    constructor() {
        super();
        this.isDebuff = false;
    }

    override getDisplayName(): string {
        return "Sticky";
    }

    override getDescription(): string {
        return "If this card is retained, apply 1 Slow to its owner.";
    }

    override onInHandAtEndOfTurn(): void {
        const owner = this.getOwnerAsPlayableCard();
        if (owner && owner.owningCharacter) {
            this.actionManager.applyBuffToCharacterOrCard(owner.owningCharacter, new SlowBuff(this.stacks));
        }
    }
}
