/// Power.  Gain 3 Smog.  Cost 0.

import { AbstractCard, TargetingType } from "../../../../AbstractCard";
import { EntityRarity } from "../../../../EntityRarity";
import { PlayableCard } from "../../../../PlayableCard";
import { CardType } from "../../../../Primitives";

export class Phlogistonist extends PlayableCard {
    constructor() {
        super({
            name: "Phlogistonist",
            cardType: CardType.POWER,
            targetingType: TargetingType.NO_TARGETING,
            rarity: EntityRarity.UNCOMMON,
        });
        this.baseMagicNumber = 3;
        this.baseEnergyCost = 0;
    }

    override get description(): string {
        return `Gain ${this.getDisplayedMagicNumber()} Smog.`;
    }

    override InvokeCardEffects(targetCard?: AbstractCard): void {
        this.actionManager.modifySmog(this.getBaseMagicNumberAfterResourceScaling());
    }
}


