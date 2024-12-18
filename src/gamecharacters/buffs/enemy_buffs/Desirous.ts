import { BaseCharacter } from "../../BaseCharacter";
import { PlayableCard } from "../../PlayableCard";
import { AbstractBuff } from "../AbstractBuff";

export class Desirous extends AbstractBuff {
    constructor(stacks: number = 1) {
        super();
        this.stacks = stacks;
        this.secondaryStacks = 0;
        this.isDebuff = true;
    }

    override getDisplayName(): string {
        return "Desirous";
    }

    override getDescription(): string {
        return `The first ${this.getStacksDisplayText()} cards played each turn exhaust.`;
    }

    override onTurnStart(): void {
        this.secondaryStacks = 0;
    }

    override onAnyCardPlayedByAnyone(playedCard: PlayableCard, target?: BaseCharacter): void {
        if (this.secondaryStacks < this.stacks) {
            this.actionManager.exhaustCard(playedCard);
            this.secondaryStacks++;
        }
    }
}
