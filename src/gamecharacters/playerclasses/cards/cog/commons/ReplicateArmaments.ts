import { PileName } from "../../../../../rules/DeckLogicHelper";
import { AbstractCard, TargetingType } from "../../../../AbstractCard";
import { EntityRarity } from "../../../../EntityRarity";
import { PlayableCard } from "../../../../PlayableCard";
import { CardType } from "../../../../Primitives";
import { Lethality } from "../../../../buffs/standard/Lethality";

export class ReplicateArmaments extends PlayableCard {
    constructor() {
        super({
            name: "Replicate Armaments",
            cardType: CardType.SKILL,
            targetingType: TargetingType.NO_TARGETING,
            rarity: EntityRarity.COMMON,
        });
        this.baseEnergyCost = 1;
        this.baseMagicNumber = 2; // Amount of Lethality to grant
    }

    override InvokeCardEffects(targetCard?: AbstractCard): void {
        if (!this.owningCharacter) {
            console.error("ReplicateArmaments was invoked without an owning character.");
            return;
        }

        // Apply Lethality
        this.actionManager.applyBuffToCharacterOrCard(
            this.owningCharacter,
            new Lethality(this.getBaseMagicNumberAfterResourceScaling())
        );

        // Choose a card to copy
        this.actionManager.requireCardSelection({
            name: "copy_card",
            instructions: "Choose a card to copy into your draw pile",
            min: 1,
            max: 1,
            cancellable: true,
            action: (selectedCards: AbstractCard[]) => {
                if (selectedCards.length > 0 && selectedCards[0] instanceof PlayableCard) {
                    // Create a copy of the selected card and add it to the draw pile
                    const cardCopy = selectedCards[0].Copy();
                    this.actionManager.moveCardToPile(cardCopy, PileName.Draw);
                }
            }
        });
    }

    override get description(): string {
        return `Gain ${this.getDisplayedMagicNumber()} Lethality. Choose a card to copy into your draw pile.`;
    }
}