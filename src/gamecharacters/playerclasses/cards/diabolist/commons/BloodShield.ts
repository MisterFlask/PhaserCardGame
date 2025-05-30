//  block 9 damage.  Cost 2.  Sacrifice.
//Use BasicProcs.Sacrifice to do this

import { TargetingType } from "../../../../AbstractCard";
import { BaseCharacter } from "../../../../BaseCharacter";
import { BloodPriceBuff } from "../../../../buffs/standard/Bloodprice";
import { EntityRarity } from "../../../../EntityRarity";
import { PlayableCard } from "../../../../PlayableCard";
import { BasicProcs } from "../../../../procs/BasicProcs";

export class BloodShield extends PlayableCard {
    constructor() {
        super({
            name: "Blood Shield",
            portraitName: "blood-shield",
            targetingType: TargetingType.ALLY,
        });
        this.baseBlock = 13;
        this.baseEnergyCost = 2;
        this.rarity = EntityRarity.COMMON;
        this.resourceScalings.push({
            resource: this.blood,
            blockScaling: 2
        });
        this.buffs.push(new BloodPriceBuff(2));
    }

    override get description(): string {
        return `Block ${this.getDisplayedBlock()} damage.  Sacrifice.`;
    }

    override InvokeCardEffects(targetCard?: BaseCharacter): void {
        this.applyBlockToTarget(targetCard);
        BasicProcs.getInstance().SacrificeACardOtherThan(this);
    }
}


