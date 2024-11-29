import { AbstractBuff } from "../AbstractBuff";

export class Figment extends AbstractBuff {
    constructor() {
        super();
    }

    getDisplayName(): string {
        return "Figment";
    }

    getDescription(): string {
        return "If this card is in hand at the end of turn, exhaust it.";
    }

    override onInHandAtEndOfTurn(): void {
        const ownerCard = this.getOwnerAsPlayableCard();
        if (ownerCard) {
            this.actionManager.exhaustCard(ownerCard);
        }
    }
}
