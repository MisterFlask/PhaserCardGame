// grant 5 block to the targeted character

import { BaseCharacterType } from "../../../../Types";
import { AbstractCard, TargetingType } from "../../../AbstractCard";
import { PlayableCardWithHelpers } from "../../../PlayableCardWithHelpers";

export class Defend extends PlayableCardWithHelpers {
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
        if (targetCard && targetCard.isBaseCharacter()) {
            this.applyBlockToTarget(targetCard as BaseCharacterType);
        }
    }
}
