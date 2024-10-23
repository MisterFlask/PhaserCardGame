import { AbstractCard, TargetingType } from "../../../../AbstractCard";
import { BaseCharacter } from "../../../../BaseCharacter";
import { VolatileBuff } from "../../../../buffs/playable_card/VolatileCardBuff";
import { Burning } from "../../../../buffs/standard/Burning";
import { Weak } from "../../../../buffs/standard/Weak";
import { CardRarity } from "../../../../PlayableCard";
import { PlayableCardWithHelpers } from "../../../../PlayableCardWithHelpers";
import { CardType } from "../../../../Primitives";

export class PocketVial extends PlayableCardWithHelpers {
    constructor() {
        super({
            name: "Pocket Vial",
            cardType: CardType.ATTACK,
            targetingType: TargetingType.ENEMY,
            rarity: CardRarity.COMMON,
        });
        this.baseDamage = 4;
        this.baseMagicNumber = 1;
        this.energyCost = 1;
        this.buffs.push(new VolatileBuff());
    }

    override get description(): string {
        return `Deal ${this.getDisplayedDamage()} damage and apply ${this.getDisplayedMagicNumber()} Weak to an enemy. Increase damage by 1 for each Burning they have. Volatile.`;
    }

    override InvokeCardEffects(targetCard?: AbstractCard): void {
        if (targetCard) {
            const burningCount = targetCard.getBuffStacks(new Burning(1).getName());
            const totalDamage = this.getBaseDamageAfterResourceScaling() + burningCount;
            
            this.dealDamageToTarget(targetCard as BaseCharacter);
            this.addBuff(targetCard as BaseCharacter, new Weak(this.getBaseMagicNumberAfterResourceScaling()));
        }
    }
}
