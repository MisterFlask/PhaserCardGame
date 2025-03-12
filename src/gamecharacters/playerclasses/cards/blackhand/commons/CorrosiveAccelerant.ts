import { AbstractCard, TargetingType } from "../../../../AbstractCard";
import { BaseCharacter } from "../../../../BaseCharacter";
import { Burning } from "../../../../buffs/standard/Burning";
import { Weak } from "../../../../buffs/standard/Weak";
import { EntityRarity } from "../../../../EntityRarity";
import { PlayableCardWithHelpers } from "../../../../PlayableCardWithHelpers";
import { CardType } from "../../../../Primitives";

export class PocketVial extends PlayableCardWithHelpers {
    constructor() {
        super({
            name: "Corrosive Accelerant",
            cardType: CardType.ATTACK,
            targetingType: TargetingType.NO_TARGETING,
            rarity: EntityRarity.COMMON,
        });
        this.baseDamage = 5;
        this.baseMagicNumber = 1;
        this.baseEnergyCost = 1;
    }

    override get description(): string {
        return `Deal ${this.getDisplayedDamage()} damage and apply ${this.getDisplayedMagicNumber()} Weak to ALL enemies. If the enemy is Burning: draw a card.`;
    }

    override InvokeCardEffects(targetCard?: AbstractCard): void {
        for (const enemy of this.combatState.enemies){
            this.dealDamageToTarget(targetCard as BaseCharacter);
            this.addBuff(targetCard as BaseCharacter, new Weak(this.getBaseMagicNumberAfterResourceScaling()));
            const burningCount = enemy.getBuffStacks(new Burning(1).getDisplayName());
            if (burningCount > 0) {
                this.actionManager.drawCards(1);
            }
        }
    }
}
