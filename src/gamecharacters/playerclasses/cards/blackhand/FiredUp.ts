import { PlayableCard, TargetingType } from "../../../AbstractCard";
import { BaseCharacter } from "../../../BaseCharacter";

export class FiredUp extends PlayableCard {
    constructor() {
        super({
            name: "Fired Up",
            description: `_`,
            portraitName: "fired-up",
            targetingType: TargetingType.NO_TARGETING,
        });
        this.magicNumber = 6;
    }

    override get description(): string {
        return `Gain ${this.magicNumber} Fire.`;
    }
    
    override InvokeCardEffects(targetCard?: BaseCharacter): void {
        if (this.owner) {
            this.actionManager.modifyFire(this.magicNumber, this.owner);

            console.log(`Gained ${this.magicNumber} Fire`);
        }
    }
}
