import { AbstractCard, TargetingType } from "../../../../AbstractCard";
import { BaseCharacter } from "../../../../BaseCharacter";
import { Weak } from "../../../../buffs/standard/Weak";
import { EntityRarity, PlayableCard } from "../../../../PlayableCard";
import { CardType } from "../../../../Primitives";

export class TheLash extends PlayableCard {
    constructor() {
        super({
            name: "The Lash",
            cardType: CardType.ATTACK,
            targetingType: TargetingType.ENEMY,
            rarity: EntityRarity.COMMON,
        });
        this.baseDamage = 8;
        this.baseEnergyCost = 1;
        this.baseMagicNumber = 1; // Amount of Weak applied
    }

    override InvokeCardEffects(targetCard?: AbstractCard): void {
        if (targetCard instanceof BaseCharacter) {
            this.dealDamageToTarget(targetCard);
            this.actionManager.applyBuffToCharacterOrCard(targetCard, new Weak(this.getBaseMagicNumberAfterResourceScaling()));
        }
    }

    override get description(): string {
        return `Deal ${this.getDisplayedDamage()} damage. Apply ${this.getDisplayedMagicNumber()} Weak to the target.`;
    }
}
