import { AbstractCard, TargetingType } from "../../../../AbstractCard";
import { BaseCharacter } from "../../../../BaseCharacter";
import { EntityRarity, PlayableCard } from "../../../../PlayableCard";
import { CardType } from "../../../../Primitives";
import { StressReliefFinisher } from "../../../../buffs/standard/StressReliefFinisher";
import { BasicProcs } from "../../../../procs/BasicProcs";

export class Buzzsword extends PlayableCard {
    constructor() {
        super({
            name: "Buzzsword",
            cardType: CardType.ATTACK,
            targetingType: TargetingType.ENEMY,
            rarity: EntityRarity.COMMON,
        });
        this.baseEnergyCost = 2;
        this.baseDamage = 12;
        this.buffs.push(new StressReliefFinisher());
        this.resourceScalings.push({
            resource: this.pluck,
            attackScaling: 1,
        });
        this.resourceScalings.push({
            resource: this.venture,
            attackScaling: 1,
        });
    }

    override InvokeCardEffects(targetCard?: AbstractCard): void {
        if (targetCard instanceof BaseCharacter) {
            this.dealDamageToTarget(targetCard);
        }
        BasicProcs.getInstance().Exert(this, 1, (energyExerted) => {
            if (energyExerted > 0) {
                this.dealDamageToTarget(targetCard);
            }
        });
    }

    override get description(): string {
        return `Deal 8 damage. Exert 1: Do it again.`;
    }
}
