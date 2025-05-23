// if this card is retained at end of turn, apply [stacks] Stress to its owner.

import { AbstractBuff } from "../AbstractBuff";
import { Stress } from "../standard/Stress";

export class Haunting extends AbstractBuff {
    constructor(stacks: number = 1) {
        super();
        this.isDebuff = true;
        this.stackable = true;
        this.stacks = stacks;
    }

    override getDisplayName(): string {
        return "Haunting";
    }

    override getDescription(): string {
        return `If this card is retained at end of turn, apply ${this.getStacksDisplayText()} Stress to its owner.`;
    }

    override onInHandAtEndOfTurn(): void {
        const owner = this.getOwnerAsPlayableCard();
        if (owner?.owningCharacter) {
            this.actionManager.applyBuffToCharacterOrCard(owner.owningCharacter, new Stress(this.stacks));
        }
    }
}

