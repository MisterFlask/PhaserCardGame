import { AbstractBuff } from "../AbstractBuff";

export class Unstable extends AbstractBuff {
    constructor() {
        super();
        this.isDebuff = true;
    }

    override getDisplayName(): string {
        return "Unstable";
    }

    override getDescription(): string {
        return "At the end of turn, if this card is retained, exhaust it.";
    }

    override onInHandAtEndOfTurn(): void {
        const ownerCard = this.getOwnerAsPlayableCard();
        if (ownerCard) {
            this.actionManager.exhaustCard(ownerCard);
        }
    }
}
