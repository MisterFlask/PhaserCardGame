//  block 9 damage.  Cost 2.  Sacrifice.
//Use BasicProcs.Sacrifice to do this

import { TargetingType } from "../../../../AbstractCard";
import { BaseCharacter } from "../../../../BaseCharacter";
import { CardRarity, PlayableCard } from "../../../../PlayableCard";
import { BasicProcs } from "../../../../procs/BasicProcs";

export class BloodShield extends PlayableCard {
    constructor() {
        super({
            name: "Blood Shield",
            portraitName: "blood-shield",
            targetingType: TargetingType.NO_TARGETING,
        });
        this.baseBlock = 13;
        this.energyCost = 2;
        this.rarity = CardRarity.COMMON;
    }

    override get description(): string {
        return `Block ${this.getDisplayedBlock()} damage. Sacrifice.`;
    }

    override InvokeCardEffects(targetCard?: BaseCharacter): void {
        this.applyBlockToTarget(this.owner);
        BasicProcs.getInstance().SacrificeACardOtherThan(this);
    }
}


