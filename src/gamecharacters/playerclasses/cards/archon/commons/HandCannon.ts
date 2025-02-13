import { AbstractCard, TargetingType } from "../../../../AbstractCard";
import { BaseCharacter } from "../../../../BaseCharacter";
import { Weak } from "../../../../buffs/standard/Weak";
import { EntityRarity } from "../../../../EntityRarity";
import { PlayableCard } from "../../../../PlayableCard";
import { CardType } from "../../../../Primitives";
import { BasicProcs } from "../../../../procs/BasicProcs";

export class HandCannon extends PlayableCard {
    constructor() {
        super({
            name: "Hand Cannon",
            cardType: CardType.ATTACK,
            targetingType: TargetingType.ENEMY,
            rarity: EntityRarity.COMMON,
        });
        this.baseDamage = 8;
        this.baseEnergyCost = 1;
        this.baseMagicNumber = 2; // Amount of Vulnerable and Weak applied
        this.resourceScalings.push({
            resource: this.mettle,
            attackScaling: 1,
        });
    }

    override InvokeCardEffects(targetCard?: AbstractCard): void {
        if (targetCard instanceof BaseCharacter) {
            this.dealDamageToTarget(targetCard);
            
            BasicProcs.getInstance().Exert(this, 1, (energyExerted) => {
                if (energyExerted > 0) {
                    this.dealDamageToTarget(targetCard);
                    this.actionManager.applyBuffToCharacterOrCard(targetCard, new Weak(this.getBaseMagicNumberAfterResourceScaling()));
                }
            });
        }
    }

    override get description(): string {
        return `Deal ${this.getDisplayedDamage()} damage. Exert 1: Do it again, then apply ${this.getDisplayedMagicNumber()} Weak to the target.`;
    }
}
