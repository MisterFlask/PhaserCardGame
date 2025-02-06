import { ActionManager } from "../../../../utils/ActionManager";
import { AbstractCard, TargetingType } from "../../../AbstractCard";
import { EntityRarity } from "../../../EntityRarity";
import { PlayableCard } from "../../../PlayableCard";
import { CardType } from "../../../Primitives";

export class BalefireRevolver extends PlayableCard {
    constructor() {
        super({
            name: "Balefire Revolver",
            cardType: CardType.ATTACK,
            targetingType: TargetingType.ENEMY,
            rarity: EntityRarity.COMMON,
        });
        this.baseDamage = 20;
        this.baseMagicNumber = 2; // Health cost
        this.baseEnergyCost = 1;
    }

    override get description(): string {
        return `Deal ${this.getDisplayedDamage()} damage. Lose ${this.getDisplayedMagicNumber()} HP.`;
    }

    override InvokeCardEffects(targetCard?: AbstractCard): void {
        
        // Deal damage to target
        if (targetCard) {
            this.dealDamageToTarget(targetCard);
        }
        
        // Cost: Lose health
        ActionManager.getInstance().loseHealth(this.getBaseMagicNumberAfterResourceScaling(), this.owningCharacter!, this.owningCharacter!, this);
    }
}
