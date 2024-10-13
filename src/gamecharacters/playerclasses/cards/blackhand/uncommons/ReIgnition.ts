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
        this.baseBlock = 10;
        this.baseMagicNumber = 2;
        this.energyCost = 1;
    }

    override get description(): string {
        return `Target ally gains ${this.getDisplayedBlock()} block.  Apply ${this.getDisplayedMagicNumber()} Burning to all enemies.`;
    }
    
    override InvokeCardEffects(targetCard?: BaseCharacter): void {
        if (targetCard && targetCard instanceof BaseCharacter) {
            this.applyBlockToTarget(targetCard);
            
            this.forEachEnemy(enemy => {
                this.actionManager.applyBuffToCharacter(enemy as BaseCharacter, new Burning(this.getBaseMagicNumberAfterResourceScaling()), this.owner as BaseCharacter);
            });
        }
    }
}