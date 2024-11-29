import { AbstractBuff } from "../AbstractBuff";

export class Fragile extends AbstractBuff {
    constructor() {
        super();
    }

    getDisplayName(): string {
        return "Fragile";
    }

    getDescription(): string {
        return "When this card is exhausted or actively discarded, destroy it. [to implement]";
    }

    override onExhaust(): void {
        const ownerCard = this.getOwnerAsPlayableCard();
        if (ownerCard) {
            this.actionManager.destroyCardInMasterDeck(ownerCard);
        }
    }

    override onActiveDiscard(): void {
        const ownerCard = this.getOwnerAsPlayableCard();
        if (ownerCard) {
            this.actionManager.destroyCardInMasterDeck(ownerCard);
        }
    }
}
