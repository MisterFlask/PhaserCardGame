import { ActionManager } from "../../../utils/ActionManager";
import { TargetingType } from "../../AbstractCard";
import { BaseCharacter } from "../../BaseCharacter";
import { AbstractBuff } from "../AbstractBuff";

export class VolatileBuff extends AbstractBuff {
    constructor() {
        super();
        this.isDebuff = false;
    }

    public onDiscard(): void {
        const ownerCard = this.getOwnerAsPlayableCard();
        if (ownerCard) {
            // Use its this card's effects instead. Targets random enemy if it needs a target.
            let targetCard: BaseCharacter | undefined;

            if (ownerCard.targetingType === TargetingType.ENEMY) {
                targetCard = ownerCard.randomEnemy();
            } else if (ownerCard.targetingType === TargetingType.ALLY) {
                targetCard = ownerCard.hoveredCharacter;
            } else {
                targetCard = undefined;
            }

            ownerCard.InvokeCardEffects(targetCard);

            // Exhaust a random card in hand
            ActionManager.getInstance().exhaustRandomCardInHand();
        }
    }

    public getName(): string {
        return "Volatile";
    }
    getDescription(): string {
        return "When this card is discarded, play it instead and exhaust a random card in hand.";
    }
}

