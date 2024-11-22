import { AbstractCard, TargetingType } from "../../../../AbstractCard";
import { BaseCharacter } from "../../../../BaseCharacter";
import { EntityRarity, PlayableCard } from "../../../../PlayableCard";
import { CardType } from "../../../../Primitives";
import { Holy } from "../../../../buffs/standard/Holy";
import { StressReliefFinisher } from "../../../../buffs/standard/StressReliefFinisher";

export class Buzzsword extends PlayableCard {
    constructor() {
        super({
            name: "Buzzsword",
            cardType: CardType.ATTACK,
            targetingType: TargetingType.ENEMY,
            rarity: EntityRarity.COMMON,
        });
        this.baseEnergyCost = 2;
        this.baseDamage = 11;
        this.buffs.push(new StressReliefFinisher());
        this.buffs.push(new Holy());
        this.resourceScalings.push({
            resource: this.pluck,
            attackScaling: 3,
        });
    }

    override InvokeCardEffects(targetCard?: AbstractCard): void {
        if (targetCard instanceof BaseCharacter) {
            this.dealDamageToTarget(targetCard);
        }
    }

    override get description(): string {
        return `Deal ${this.getDisplayedDamage()} damage.`;
    }
}
