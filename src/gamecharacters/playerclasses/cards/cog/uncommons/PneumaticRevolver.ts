// deal 6 damage, 3 times.  Gain 1 Mettle. Cost 2.  If this card was Manufactured, do it again. 

import { AbstractCard, TargetingType } from "../../../../AbstractCard";
import { BaseCharacter } from "../../../../BaseCharacter";
import { EntityRarity } from "../../../../EntityRarity";
import { PlayableCard } from "../../../../PlayableCard";
import { CardType } from "../../../../Primitives";

export class PneumaticRevolver extends PlayableCard {
    constructor() {
        super({
            name: "Pneumatic Revolver",
            cardType: CardType.ATTACK,
            targetingType: TargetingType.ENEMY,
            rarity: EntityRarity.UNCOMMON,
        });
        this.baseEnergyCost = 2;
        this.baseDamage = 6;
        this.baseMagicNumber = 3; // Number of times to deal damage
    }

    override get description(): string {
        return `Deal ${this.getDisplayedDamage()} damage ${this.getDisplayedMagicNumber()} times. Gain 1 Mettle. If this card was Manufactured, do it again.`;
    }

    override InvokeCardEffects(targetCard?: AbstractCard): void {
        if (!targetCard || !(targetCard instanceof BaseCharacter)) return;

        // Function to perform the attack sequence
        const performAttackSequence = () => {
            for (let i = 0; i < this.getBaseMagicNumberAfterResourceScaling(); i++) {
                this.dealDamageToTarget(targetCard);
            }
            // Gain 1 Mettle
            this.mettle.value += 1;
        };

        // Perform the initial attack sequence
        performAttackSequence();

        // If the card was Manufactured, do it again
        if (this.wasManufactured()) {
            performAttackSequence();
        }
    }
} 
