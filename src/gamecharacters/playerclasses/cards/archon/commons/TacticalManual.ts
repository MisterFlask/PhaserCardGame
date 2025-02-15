import { AbstractCard, TargetingType } from "../../../../AbstractCard";
import { BaseCharacter } from "../../../../BaseCharacter";
import { EntityRarity } from "../../../../EntityRarity";
import { PlayableCard } from "../../../../PlayableCard";
import { CardType } from "../../../../Primitives";
import { Lethality } from "../../../../buffs/standard/Lethality";

export class TacticalManual extends PlayableCard {
    constructor() {
        super({
            name: "Tactical Manual",
            cardType: CardType.SKILL,
            targetingType: TargetingType.ALLY,
            rarity: EntityRarity.COMMON,
        });
        this.baseEnergyCost = 1;
        this.baseMagicNumber = 1; // Base strength gain
        this.resourceScalings.push({
            resource: this.ashes,
            magicNumberScaling: 1,
        });
        this.resourceScalings.push({
            resource: this.pluck,
            magicNumberScaling: 1,
        });
    }

    override InvokeCardEffects(targetCard?: AbstractCard): void {
        // Draw 2 cards
        this.actionManager.drawCards(2);

        // Discard a card
        this.actionManager.chooseCardToDiscard();

        // Apply strength to targeted ally
        if (targetCard instanceof BaseCharacter) {
            const strengthGain = this.getBaseMagicNumberAfterResourceScaling();
            this.actionManager.applyBuffToCharacterOrCard(targetCard, new Lethality(strengthGain));
        }
    }

    override get description(): string {
        return `Draw 2 cards. Discard a card. Target ally gains ${this.getDisplayedMagicNumber()} Strength.`;
    }
}
