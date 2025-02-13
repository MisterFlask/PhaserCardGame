import { AbstractCard, TargetingType } from "../../../../AbstractCard";
import { BaseCharacter } from "../../../../BaseCharacter";
import { EntityRarity } from "../../../../EntityRarity";
import { PlayableCard } from "../../../../PlayableCard";
import { CardType } from "../../../../Primitives";

export class SelfUpgradingRevolver extends PlayableCard {
    constructor() {
        super({
            name: "Self-Upgrading Revolver",
            cardType: CardType.ATTACK,
            targetingType: TargetingType.ENEMY,
            rarity: EntityRarity.COMMON,
        });
        this.baseEnergyCost = 1;
        this.baseDamage = 6;
        this.baseMagicNumber = 2; // Amount of damage increase
    }

    override get description(): string {
        return `Deal ${this.getDisplayedDamage()} damage. Increase this card's damage by ${this.getDisplayedMagicNumber()}.`;
    }

    override InvokeCardEffects(targetCard?: AbstractCard): void {
        if (targetCard instanceof BaseCharacter) {
            this.dealDamageToTarget(targetCard);
            this.baseDamage += this.getBaseMagicNumberAfterResourceScaling();
        }
    }
}