import { ActionManager } from "../../../utils/ActionManager";
import { AbstractBuff } from "../AbstractBuff";
import { PlayableCard } from "../../PlayableCard";
import { BaseCharacter } from "../../BaseCharacter";

export class ExhaustBuff extends AbstractBuff {
    constructor() {
        super();
        this.isDebuff = false;
    }

    public onCardInvoked(target?: BaseCharacter): void {
        const ownerCard = this.getOwnerAsPlayableCard();
        if (ownerCard) {
            // Exhaust the card when played
            ActionManager.getInstance().exhaustCard(ownerCard);
        }
    }

    public getName(): string {
        return "Exhaust";
    }

    getDescription(): string {
        return "Exhaust this card when played.";
    }
}
