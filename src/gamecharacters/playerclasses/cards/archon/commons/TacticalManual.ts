import { AbstractCard, TargetingType } from "../../../../AbstractCard";
import { BaseCharacter } from "../../../../BaseCharacter";
import { CardRarity, PlayableCard } from "../../../../PlayableCard";
import { CardType } from "../../../../Primitives";
import { Strong } from "../../../../buffs/standard/Strong";

export class TacticalManual extends PlayableCard {
    constructor() {
        super({
            name: "Tactical Manual",
            cardType: CardType.SKILL,
            targetingType: TargetingType.ALLY,
            rarity: CardRarity.COMMON,
        });
        this.energyCost = 1;
        this.baseMagicNumber = 1; // Base strength gain
        this.resourceScalings.push({
            resource: this.pages,
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
            const strengthGain = this.getBaseMagicNumberAfterResourceScaling() + this.pages.value;
            this.actionManager.applyBuffToCharacterOrCard(targetCard, new Strong(strengthGain));
        }
    }

    override get description(): string {
        return `Draw 2 cards. Discard a card. Target ally gains ${this.getDisplayedMagicNumber()} + [Pages] Strength.`;
    }
}
