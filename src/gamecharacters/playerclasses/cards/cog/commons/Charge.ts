// Gain 2 Lethality.  Cost 0.  Power.

import { AbstractCard, TargetingType } from "../../../../AbstractCard";
import { EntityRarity } from "../../../../EntityRarity";
import { PlayableCard } from "../../../../PlayableCard";
import { CardType } from "../../../../Primitives";
import { Lethality } from "../../../../buffs/standard/Lethality";

export class GenerateCharge extends PlayableCard {
    constructor() {
        super({
            name: "Generate Charge",
            cardType: CardType.POWER,
            targetingType: TargetingType.NO_TARGETING,
            rarity: EntityRarity.COMMON,
            portraitName: "battery-pack-alt",
        });
        this.baseEnergyCost = 0;
        this.baseMagicNumber = 2; // Amount of Strength to grant
        this.flavorText = "Wind the spring. The spring does not ask why.";
    }

    override InvokeCardEffects(targetCard?: AbstractCard): void {
        if (!this.owningCharacter) {
            console.error("Charge was invoked without an owning character.");
            return;
        }
        this.actionManager.applyBuffToCharacterOrCard(this.owningCharacter, new Lethality(this.getBaseMagicNumberAfterResourceScaling()));
    }

    override get description(): string {
        return `Gain ${this.getDisplayedMagicNumber()} Lethality.`;
    }
}

