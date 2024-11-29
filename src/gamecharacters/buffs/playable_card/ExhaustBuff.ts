import { ActionManager } from "../../../utils/ActionManager";
import { BaseCharacter } from "../../BaseCharacter";
import { AbstractBuff } from "../AbstractBuff";

export class ExhaustBuff extends AbstractBuff {
    constructor() {
        super();
        this.isDebuff = false;
    }

    public onThisCardInvoked(target?: BaseCharacter): void {
        const ownerCard = this.getOwnerAsPlayableCard();
        if (ownerCard) {
            // Exhaust the card when played
            ActionManager.getInstance().exhaustCard(ownerCard);
        }
    }

    public getDisplayName(): string {
        return "Exhaust";
    }

    getDescription(): string {
        return "Exhaust this card when played.";
    }
}
