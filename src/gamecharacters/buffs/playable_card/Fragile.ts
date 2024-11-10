import { AbstractBuff } from "../AbstractBuff";

export class Fragile extends AbstractBuff {
    constructor() {
        super();
    }

    getName(): string {
        return "Fragile";
    }

    getDescription(): string {
        return "When this card is exhausted or actively discarded, destroy it. [to implement]";
    }

    override onExhaust(): void {
        const ownerCard = this.getOwnerAsPlayableCard();
        if (ownerCard) {
            //this.actionManager.destroyCard(ownerCard);
        }
    }

    override onActiveDiscard(): void {
        const ownerCard = this.getOwnerAsPlayableCard();
        if (ownerCard) {
            //this.actionManager.destroyCard(ownerCard);
        }
    }
}
