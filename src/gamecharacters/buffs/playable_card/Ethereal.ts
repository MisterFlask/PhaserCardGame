import { AbstractBuff } from "../AbstractBuff";

export class Ethereal extends AbstractBuff {
    constructor() {
        super();
        this.isDebuff = true;
    }

    override getDisplayName(): string {
        return "Transient";
    }

    override getDescription(): string {
        return "This card exhausts at end of turn.";
    }

    override onTurnEnd(): void {
        const ownerCard = this.getOwnerAsPlayableCard();
        if (ownerCard) {
            this.actionManager.exhaustCard(ownerCard);
        }
    }
}
