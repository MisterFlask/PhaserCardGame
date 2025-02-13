// Apply 12 block.  Scales with 2x Ashes and 2x Mettle.  gain 1 Venture.  Cost 1.

import { AbstractCard, TargetingType } from "../../../../AbstractCard";
import { EntityRarity } from "../../../../EntityRarity";
import { PlayableCard } from "../../../../PlayableCard";
import { CardType } from "../../../../Primitives";

export class ForceShield extends PlayableCard {
    constructor() {
        super({
            name: "Force Shield",
            cardType: CardType.SKILL,
            targetingType: TargetingType.NO_TARGETING,
            rarity: EntityRarity.RARE,
        });
        this.baseBlock = 12;
        this.baseEnergyCost = 1;

        // Add 2x scaling for both Ashes and Mettle
        this.resourceScalings.push({
            resource: this.ashes,
            blockScaling: 2,
        });
        this.resourceScalings.push({
            resource: this.mettle,
            blockScaling: 2,
        });
    }

    override InvokeCardEffects(targetCard?: AbstractCard): void {
        // Apply block to all allies
        this.forEachAlly(ally => {
            this.applyBlockToTarget(ally);
        });

        // Gain 1 Venture
        this.actionManager.modifyVenture(1);
    }

    override get description(): string {
        return `Apply ${this.getDisplayedBlock()} Block. Gain 1 Venture.`;
    }
}
