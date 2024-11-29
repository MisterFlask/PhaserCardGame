import { PileName } from "../../../rules/DeckLogicHelper";
import { AbstractBuff } from "../AbstractBuff";

export class Obsession extends AbstractBuff {
    private turnsSinceLastPlayed: number = 0;

    constructor(stacks: number = 1) {
        super();
        this.stacks = stacks;
        this.isDebuff = false;
    }

    override getDisplayName(): string {
        return "Obsession";
    }

    override getDescription(): string {
        return `If this card hasn't been played for ${this.getStacksDisplayText()} turn${this.stacks !== 1 ? 's' : ''}, move it to your hand at the start of your turn.`;
    }

    override onTurnStart(): void {
        this.turnsSinceLastPlayed++;
        if (this.turnsSinceLastPlayed > this.stacks) {
            const ownerCard = this.getOwnerAsPlayableCard();
            if (ownerCard) {
                const actionManager = this.actionManager;
                actionManager.moveCardToPile(ownerCard, PileName.Hand);
            }
        }
    }

    override onThisCardInvoked(): void {
        this.turnsSinceLastPlayed = 0;
    }
}
