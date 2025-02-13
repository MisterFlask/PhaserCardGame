import { AbstractCard, TargetingType } from "../../../../AbstractCard";
import { EntityRarity } from "../../../../EntityRarity";
import { PlayableCard } from "../../../../PlayableCard";
import { CardType } from "../../../../Primitives";
import { Intimidation } from "../../../../buffs/standard/Intimidation";
import { Vulnerable } from "../../../../buffs/standard/Vulnerable";

export class Glower extends PlayableCard {
    constructor() {
        super({
            name: "Glower",
            cardType: CardType.SKILL,
            targetingType: TargetingType.ENEMY,
            rarity: EntityRarity.UNCOMMON,
        });
        this.baseEnergyCost = 0;
        this.baseMagicNumber = 8; // Amount of Intimidation gained
    }

    override InvokeCardEffects(targetCard?: AbstractCard): void {
        // Draw a card
        this.actionManager.applyBuffToCharacterOrCard(targetCard!, new Vulnerable(1));
        // Apply Intimidation to self
        this.actionManager.applyBuffToCharacterOrCard(this.owningCharacter!, new Intimidation(this.getBaseMagicNumberAfterResourceScaling()));
    }

    override get description(): string {
        return `Apply 1 Vulnerable. Gain ${this.getDisplayedMagicNumber()} Intimidation.`;
    }
}
