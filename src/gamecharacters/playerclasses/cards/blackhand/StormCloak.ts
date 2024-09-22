// grant 5 block to the targeted character

import { PlayableCard, TargetingType } from "../../../AbstractCard";
import { BaseCharacter } from "../../../BaseCharacter";


export class StormCloak extends PlayableCard {
    constructor() {
        super({
            name: "Storm Cloak",
            description: `_`,
            portraitName: "firewall",
            targetingType: TargetingType.ENEMY,
        });
        this.baseBlock = 5
        this.magicNumber = 1
        this.energyCost = 2;
    }

    override scaleBlock(inputBlock: number): number {
        return inputBlock + this.magicNumber * this.ice
    }

    override get description(): string {
        return `Grant ${this.getDisplayedBlock(this.hoveredCharacter)} Block to the targeted character, plus ${this.magicNumber} * [Ice].`;
    }
    
    override InvokeCardEffects(targetCard?: BaseCharacter): void {
        if (targetCard && targetCard instanceof BaseCharacter) {
            this.applyBlockToTarget(targetCard);
        }
    }
}
