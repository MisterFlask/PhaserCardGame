// deal 10 damage, then apply 2 Vulnerable.   If this card was Manufactured, do it again.  Venture scaling: 1.  Cost 1.

import { AbstractCard, TargetingType } from "../../../../AbstractCard";
import { BaseCharacter } from "../../../../BaseCharacter";
import { EntityRarity } from "../../../../EntityRarity";
import { PlayableCard } from "../../../../PlayableCard";
import { CardType } from "../../../../Primitives";
import { AbstractBuff } from "../../../../buffs/AbstractBuff";

class VulnerableBuff extends AbstractBuff {
    constructor(stacks: number) {
        super();
        this.isDebuff = true;
        this.stackable = true;
        this.stacks = Math.round(stacks);
    }

    override getDisplayName(): string {
        return "Vulnerable";
    }

    override getDescription(): string {
        return `Takes ${Math.round(this.stacks * 50)}% more damage from attacks.`;
    }
}

export class PneumaticAxe extends PlayableCard {
    constructor() {
        super({
            name: "Pneumatic Axe",
            cardType: CardType.ATTACK,
            targetingType: TargetingType.ENEMY,
            rarity: EntityRarity.UNCOMMON,
        });
        
        this.baseDamage = 10;
        this.baseMagicNumber = 2; // Amount of Vulnerable to apply
        this.baseEnergyCost = 1;
        
        // Add Venture scaling
        this.resourceScalings.push({
            resource: this.venture,
            attackScaling: 1,
        });
    }

    override InvokeCardEffects(targetCard?: AbstractCard): void {
        if (!this.owningCharacter || !targetCard || !(targetCard instanceof BaseCharacter)) {
            console.error("PneumaticAxe was invoked without an owning character or valid target.");
            return;
        }

        // Function to apply the card's effects once
        const applyEffects = () => {
            // Deal damage
            this.dealDamageToTarget(targetCard);
            
            // Apply Vulnerable
            if (targetCard instanceof BaseCharacter) {
                this.actionManager.applyBuffToCharacterOrCard(
                    targetCard,
                    new VulnerableBuff(this.getBaseMagicNumberAfterResourceScaling())
                );
            }
        };

        // Apply effects once
        applyEffects();

        // If the card was manufactured, apply effects again
        if (this.wasManufactured()) {
            applyEffects();
        }
    }

    override get description(): string {
        return `Deal ${this.getDisplayedDamage()} damage, then apply ${this.getDisplayedMagicNumber()} Vulnerable. If this card was Manufactured, do it again.`;
    }
}