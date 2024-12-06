import { AbstractCard, TargetingType } from "../../../../AbstractCard";
import { BaseCharacter } from "../../../../BaseCharacter";
import { EntityRarity, PlayableCard } from "../../../../PlayableCard";
import { CardType } from "../../../../Primitives";
import { DamageIncreaseOnKill } from "../../../../buffs/standard/DamageIncreaseOnKill";
import { Holy } from "../../../../buffs/standard/Holy";
import { StressReliefFinisher } from "../../../../buffs/standard/StressReliefFinisher";
import { BasicProcs } from "../../../../procs/BasicProcs";

export class BlessedBuzzsword extends PlayableCard {
    constructor() {
        super({
            name: "Blessed Buzzsword",
            cardType: CardType.ATTACK,
            targetingType: TargetingType.ENEMY,
            rarity: EntityRarity.UNCOMMON,
        });
        this.baseEnergyCost = 2;
        this.baseDamage = 12;
        this.buffs.push(new StressReliefFinisher());
        this.buffs.push(new Holy());
        this.buffs.push(new DamageIncreaseOnKill(2));
        this.resourceScalings.push({
            resource: this.pluck,
            attackScaling: 1,
        });
        this.resourceScalings.push({
            resource: this.venture,
            attackScaling: 1,
        });
        this.resourceScalings.push({
            resource: this.blood,
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
        return `Deal ${this.getDisplayedDamage()} damage. Holy. When this kills an enemy, increase its damage by 2 permanently. Exert 1: Do it again.`;
    }
}
