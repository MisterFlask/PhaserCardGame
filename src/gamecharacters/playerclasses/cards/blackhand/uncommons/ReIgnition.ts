import { TargetingType } from "../../../../AbstractCard";
import { BaseCharacter } from "../../../../BaseCharacter";
import { Burning } from "../../../../buffs/standard/Burning";
import { PlayableCard } from "../../../../PlayableCard";

export class ReIgnition extends PlayableCard {
    constructor() {
        super({
            name: "Re-ignition",
            description: `_`,
            portraitName: "fire-silhouette",
            targetingType: TargetingType.ALLY,
        });
        this.baseBlock = 5;
        this.baseMagicNumber = 4;
        this.baseEnergyCost = 1;
    }

    override get description(): string {
        return `Target ally gains ${this.getDisplayedBlock()} block.  Apply ${this.getDisplayedMagicNumber()} Burning to all enemies.`;
    }
    
    override InvokeCardEffects(targetCard?: BaseCharacter): void {
        if (targetCard && targetCard instanceof BaseCharacter) {
            this.applyBlockToTarget(targetCard);
            
            this.forEachEnemy(enemy => {
                this.actionManager.applyBuffToCharacterOrCard(enemy as BaseCharacter, new Burning(this.getBaseMagicNumberAfterResourceScaling()), this.owningCharacter as BaseCharacter);
            });
        }
    }
}
