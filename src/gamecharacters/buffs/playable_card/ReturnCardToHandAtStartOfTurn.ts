import { DeckLogic, PileName } from "../../../rules/DeckLogicHelper";
import { AbstractBuff } from "../AbstractBuff";

export class ReturnCardToHandAtStartOfTurn extends AbstractBuff {
    constructor() {
        super();
        this.isDebuff = false;
    }

    override getDisplayName(): string {
        return "Return to Hand";
    }

    override getDescription(): string {
        return "At the start of your turn, return this card to your hand.";
    }

    override onTurnStart(): void {
        DeckLogic.moveCardToPile(this.getOwnerAsPlayableCard()!, PileName.Hand);
    }
}
