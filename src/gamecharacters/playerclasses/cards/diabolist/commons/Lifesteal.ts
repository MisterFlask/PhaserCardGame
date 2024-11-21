import { AbstractCard, TargetingType } from "../../../../AbstractCard";
import { BaseCharacter } from "../../../../BaseCharacter";
import { SacrificeBuff } from "../../../../buffs/standard/SacrificeBuff";
import { EntityRarity, PlayableCard } from "../../../../PlayableCard";
import { CardType } from "../../../../Primitives";

export class Lifesteal extends PlayableCard {
    constructor() {
        super({
            name: "Lifesteal",
            cardType: CardType.ATTACK,
            targetingType: TargetingType.ENEMY,
            rarity: EntityRarity.COMMON,
        });
        this.baseDamage = 4;
        this.baseMagicNumber = 4;
        this.baseEnergyCost = 1;
        this.buffs.push(new SacrificeBuff());
        this.resourceScalings.push({
            resource: this.smog,
            magicNumberScaling: 1
        });
        this.resourceScalings.push({
            resource: this.powder,
            attackScaling: 1
        });
    }

    override get description(): string {
        return `Deal ${this.getDisplayedDamage()} damage. Restore ${this.getDisplayedMagicNumber()} health.`;
    }

    override InvokeCardEffects(targetCard?: AbstractCard): void {
        if (targetCard && this.owner) {
            this.dealDamageToTarget(targetCard as BaseCharacter);
            this.actionManager.heal(this.owner, this.getBaseMagicNumberAfterResourceScaling());
        }
    }
}
