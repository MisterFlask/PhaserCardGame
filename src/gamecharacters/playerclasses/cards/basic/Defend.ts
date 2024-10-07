// grant 5 block to the targeted character

import { ActionManager } from "../../../../utils/ActionManager";
import { AbstractCard, TargetingType } from "../../../AbstractCard";
import { BaseCharacter } from "../../../BaseCharacter";
import { PlayableCard } from "../../../PlayableCard";

export class Defend extends PlayableCard {
    constructor() {
        super({
            name: "Defend",
            description: `_`,
            portraitName: "shield",
            targetingType: TargetingType.ENEMY,
        });
        this.baseBlock = 5
        this.energyCost = 2;
    }

    override get description(): string {
        return `Grant ${this.getDisplayedBlock()} Block to the targeted character.`;
    }
    
    override InvokeCardEffects(targetCard?: AbstractCard): void {
        if (targetCard && targetCard instanceof BaseCharacter) {
            this.applyBlockToTarget(targetCard);
        }
    }
}
