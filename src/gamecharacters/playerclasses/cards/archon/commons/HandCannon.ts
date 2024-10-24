import { AbstractCard, TargetingType } from "../../../../AbstractCard";
import { BaseCharacter } from "../../../../BaseCharacter";
import { Vulnerable } from "../../../../buffs/standard/Vulnerable";
import { CardRarity, PlayableCard } from "../../../../PlayableCard";
import { CardType } from "../../../../Primitives";
import { BasicProcs } from "../../../../procs/BasicProcs";

export class HandCannon extends PlayableCard {
    constructor() {
        super({
            name: "Hand Cannon",
            cardType: CardType.ATTACK,
            targetingType: TargetingType.ENEMY,
            rarity: CardRarity.COMMON,
        });
        this.baseDamage = 8;
        this.energyCost = 1;
        this.baseMagicNumber = 1; // Amount of Vulnerable applied
        this.resourceScalings.push({
            resource: this.iron,
            attackScaling: 1,
        });
    }

    override InvokeCardEffects(targetCard?: AbstractCard): void {
        if (targetCard instanceof BaseCharacter) {
            this.dealDamageToTarget(targetCard);
            
            BasicProcs.getInstance().Exert(this, 1, (energyExerted) => {
                if (energyExerted > 0) {
                    this.actionManager.applyBuffToCharacter(targetCard, new Vulnerable(this.getBaseMagicNumberAfterResourceScaling()));
                }
            });
        }
    }

    override get description(): string {
        return `Deal ${this.getDisplayedDamage()} damage. Exert 1: Apply ${this.getDisplayedMagicNumber()} Vulnerable to the target.`;
    }
}
