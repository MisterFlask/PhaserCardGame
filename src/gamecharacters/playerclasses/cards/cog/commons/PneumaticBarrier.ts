// gain 7 block.  Exhaust.  Manufacture a copy of this card into your hand.

import { AbstractCard, TargetingType } from "../../../../AbstractCard";
import { EntityRarity } from "../../../../EntityRarity";
import { PlayableCard } from "../../../../PlayableCard";
import { CardType } from "../../../../Primitives";
import { ExhaustBuff } from "../../../../buffs/playable_card/ExhaustBuff";
import { BasicProcs } from "../../../../procs/BasicProcs";

export class PneumaticBarrier extends PlayableCard {
    constructor() {
        super({
            name: "Pneumatic Barrier",
            cardType: CardType.SKILL,
            targetingType: TargetingType.ALLY,
            rarity: EntityRarity.COMMON,
        });
        this.baseEnergyCost = 1;
        this.baseBlock = 7;
        this.buffs.push(new ExhaustBuff());
    }

    override InvokeCardEffects(targetCard?: AbstractCard): void {
        // Apply block to the owner
        this.applyBlockToTarget(targetCard?.asBaseCharacter());

        // Manufacture a copy into hand
        BasicProcs.getInstance().ManufactureCardToHand(this.Copy().withOwner(this.owningCharacter!));
    }

    override get description(): string {
        return `Apply ${this.getDisplayedBlock()} block. Manufacture a copy of this card into your hand.`;
    }
}
