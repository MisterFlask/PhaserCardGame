// grant 5 block to the targeted character

import { ActionManager } from "../../../../utils/ActionManager";
import { AbstractCard, PlayableCard, TargetingType } from "../../../AbstractCard";
import { BaseCharacter } from "../../../BaseCharacter";

export class Defend extends PlayableCard {
    constructor() {
        super({
            name: "Defend",
            description: `_`,
            portraitName: "shield",
            targetingType: TargetingType.ENEMY,
        });
        this.baseBlock = 5
    }

    override get description(): string {
        return `Grant ${this.getDisplayedBlock(this.hoveredCharacter)} Block to the targeted character.`;
    }
    
    override InvokeCardEffects(targetCard?: AbstractCard): void {
        if (targetCard && targetCard instanceof BaseCharacter) {
            ActionManager.getInstance().applyBlock({ blockTargetCharacter: targetCard!, baseBlockValue: this.baseBlock, appliedViaPlayableCard: this ,  blockSourceCharacter: this.owner!});
            console.log(`Granted ${this.getDisplayedBlock(this.hoveredCharacter)} Block to ${targetCard.name}`);
        }
    }
}
