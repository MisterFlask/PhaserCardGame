import { AbstractCard, TargetingType } from "../../../../AbstractCard";
import { BaseCharacter } from "../../../../BaseCharacter";
import { Intimidation } from "../../../../buffs/standard/Intimidation";
import { EntityRarity } from "../../../../EntityRarity";
import { PlayableCard } from "../../../../PlayableCard";
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
        this.baseMagicNumber = 8; // Amount of intimidation gained
    }

    override InvokeCardEffects(targetCard?: AbstractCard): void {
        if (targetCard instanceof BaseCharacter) {
            this.dealDamageToTarget(targetCard);
            this.actionManager.applyBuffToCharacterOrCard(this.owningCharacter!, new Intimidation(this.getBaseMagicNumberAfterResourceScaling()));
        }
    }

    override get description(): string {
        return `Deal ${this.getDisplayedDamage()} damage.  Gain ${this.getDisplayedMagicNumber()} Intimidation.`;
    }
}
