///deal 5 damage twice.  Grants 1 blood.

import { AbstractCard, TargetingType } from "../../../../AbstractCard";
import { BaseCharacter } from "../../../../BaseCharacter";
import { EntityRarity } from "../../../../EntityRarity";
import { PlayableCard } from "../../../../PlayableCard";
import { CardType } from "../../../../Primitives";

export class RitualKnife extends PlayableCard {
    constructor() {
        super({
            name: "Ritual Knife",
            cardType: CardType.ATTACK,
            targetingType: TargetingType.ENEMY,
            rarity: EntityRarity.COMMON,
        });
        this.baseEnergyCost = 1;
        this.baseDamage = 5;
        this.baseMagicNumber = 2; // Number of times to deal damage
    }

    override get description(): string {
        return `Deal ${this.getDisplayedDamage()} damage ${this.getDisplayedMagicNumber()} times. Gain 1 Blood.`;
    }

    override InvokeCardEffects(targetCard?: AbstractCard): void {
        if (!targetCard || !(targetCard instanceof BaseCharacter)) return;

        // Deal damage twice
        for (let i = 0; i < this.getBaseMagicNumberAfterResourceScaling(); i++) {
            this.dealDamageToTarget(targetCard);
        }
        
        // Gain 1 Blood
        this.actionManager.modifyBlood(1);
    }
}