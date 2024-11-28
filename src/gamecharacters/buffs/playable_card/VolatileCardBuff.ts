import { ActionManager } from "../../../utils/ActionManager";
import { TargetingType } from "../../AbstractCard";
import { BaseCharacter } from "../../BaseCharacter";
import { AbstractBuff } from "../AbstractBuff";

export class VolatileBuff extends AbstractBuff {
    constructor() {
        super();
        this.isDebuff = false;
    }

    public onActiveDiscard(): void {
        const ownerCard = this.getOwnerAsPlayableCard();
        if (ownerCard) {
            // Use its this card's effects instead. Targets random enemy if it needs a target.
            let targetCard: BaseCharacter | undefined;

            if (ownerCard.targetingType === TargetingType.ENEMY) {
                targetCard = ownerCard.randomEnemy() as BaseCharacter;
            } else if (ownerCard.targetingType === TargetingType.ALLY) {
                targetCard = ownerCard.hoveredCharacter as BaseCharacter;
            } else {
                targetCard = undefined;
            }

            ownerCard.InvokeCardEffects(targetCard);
            ActionManager.getInstance().exhaustCard(this.getOwnerAsPlayableCard()!);

            // Exhaust a random card in hand
            ActionManager.getInstance().exhaustRandomCardInHand();
        }
    }

    public getDisplayName(): string {
        return "Volatile";
    }
    getDescription(): string {
        return "When this card is discarded, play it instead, exhaust it, and exhaust another random card in hand.";
    }
}

