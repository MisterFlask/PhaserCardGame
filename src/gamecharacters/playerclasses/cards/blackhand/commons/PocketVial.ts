import { AbstractCard, TargetingType } from "../../../../AbstractCard";
import { BaseCharacter } from "../../../../BaseCharacter";
import { Burning } from "../../../../buffs/standard/Burning";
import { Weak } from "../../../../buffs/standard/Weak";
import { EntityRarity } from "../../../../PlayableCard";
import { PlayableCardWithHelpers } from "../../../../PlayableCardWithHelpers";
import { CardType } from "../../../../Primitives";

export class PocketVial extends PlayableCardWithHelpers {
    constructor() {
        super({
            name: "Pocket Vial",
            cardType: CardType.ATTACK,
            targetingType: TargetingType.ENEMY,
            rarity: EntityRarity.COMMON,
        });
        this.baseDamage = 5;
        this.baseMagicNumber = 1;
        this.baseEnergyCost = 1;
    }

    override get description(): string {
        return `Deal ${this.getDisplayedDamage()} damage and apply ${this.getDisplayedMagicNumber()} Weak to an enemy. If the enemy is Burning: draw a card.`;
    }

    override InvokeCardEffects(targetCard?: AbstractCard): void {
        if (targetCard) {
            this.dealDamageToTarget(targetCard as BaseCharacter);
            this.addBuff(targetCard as BaseCharacter, new Weak(this.getBaseMagicNumberAfterResourceScaling()));
            const burningCount = targetCard.getBuffStacks(new Burning(1).getDisplayName());
            if (burningCount > 0) {
                this.actionManager.drawCards(1);
            }
        }
    }
}
