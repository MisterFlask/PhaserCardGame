// Cost 1.  Skill.  Manufacture 2 Rivets into the draw pile.

import { AbstractCard, TargetingType } from "../../../../AbstractCard";
import { EntityRarity } from "../../../../EntityRarity";
import { PlayableCard } from "../../../../PlayableCard";
import { CardType } from "../../../../Primitives";
import { Rivet } from "../tokens/Rivet";

export class StampPress extends PlayableCard {
    constructor() {
        super({
            name: "Stamp Press",
            cardType: CardType.SKILL,
            targetingType: TargetingType.NO_TARGETING,
            rarity: EntityRarity.COMMON,
            portraitName: "stamp-press-card-art",
        });
        this.baseEnergyCost = 1;
        this.baseMagicNumber = 2; // Number of Rivets to manufacture
        this.flavorText = "Two hundred strokes a minute. The die never asks for a rest.";
    }

    override InvokeCardEffects(targetCard?: AbstractCard): void {
        if (!this.owningCharacter) return;

        for (let i = 0; i < this.getBaseMagicNumberAfterResourceScaling(); i++) {
            this.actionManager.createCardToDrawPile(new Rivet().withOwner(this.owningCharacter));
        }
    }

    override get description(): string {
        return `Manufacture ${this.getDisplayedMagicNumber()} Rivets into your draw pile.`;
    }
}
