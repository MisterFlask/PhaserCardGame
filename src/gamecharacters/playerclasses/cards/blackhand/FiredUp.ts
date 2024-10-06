import { TargetingType } from "../../../AbstractCard";
import { BaseCharacter } from "../../../BaseCharacter";
import { PlayableCard } from "../../../PlayableCard";

export class FiredUp extends PlayableCard {
    constructor() {
        super({
            name: "Fired Up",
            description: `_`,
            portraitName: "enrage",
            targetingType: TargetingType.NO_TARGETING,
        });
        this.magicNumber = 6;
        this.energyCost = 3;
    }

    override get description(): string {
        return `Gain ${this.magicNumber} [Fire].`;
    }
    
    override InvokeCardEffects(targetCard?: BaseCharacter): void {
        if (this.owner) {
            this.actionManager.modifyFire(this.magicNumber, this.owner as BaseCharacter);

            console.log(`Gained ${this.magicNumber} [Fire]`);
        }
    }
}
