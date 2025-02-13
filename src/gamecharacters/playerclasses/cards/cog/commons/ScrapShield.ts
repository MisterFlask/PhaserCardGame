// apply 12 block to a target. Scales with Venture.

import { AbstractCard, TargetingType } from "../../../../AbstractCard";
import { BaseCharacter } from "../../../../BaseCharacter";
import { EntityRarity } from "../../../../EntityRarity";
import { PlayableCard } from "../../../../PlayableCard";
import { CardType } from "../../../../Primitives";

export class ScrapShield extends PlayableCard {
    constructor() {
        super({
            name: "Scrap Shield",
            cardType: CardType.SKILL,
            targetingType: TargetingType.ALLY,
            rarity: EntityRarity.COMMON,
        });
        this.baseBlock = 12;
        this.baseEnergyCost = 1;
        
        this.resourceScalings.push({
            resource: this.venture,
            blockScaling: 1,
        });
    }

    override get description(): string {
        return `Apply ${this.getDisplayedBlock()} Block.`;
    }

    override InvokeCardEffects(targetCard?: AbstractCard): void {
        if (targetCard instanceof BaseCharacter) {
            this.applyBlockToTarget(targetCard);
        }
    }
}
