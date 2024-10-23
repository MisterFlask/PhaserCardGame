import { TargetingType } from "../../../../AbstractCard";
import { BaseCharacter } from "../../../../BaseCharacter";
import { PlayableCard } from "../../../../PlayableCard";

export class InfernaliteCache extends PlayableCard {
    constructor() {
        super({
            name: "Infernalite Cache",
            description: `_`,
            portraitName: "enrage",
            targetingType: TargetingType.NO_TARGETING,
        });
        this.baseMagicNumber = 6;
        this.energyCost = 1;
    }

    override get description(): string {
        return `Gain ${this.getDisplayedMagicNumber()} [Powder].`;
    }
    
    override InvokeCardEffects(targetCard?: BaseCharacter): void {
        if (this.owner) {
            this.actionManager.modifyPowder(this.getBaseMagicNumberAfterResourceScaling(), this.owner as BaseCharacter);

            console.log(`Gained ${this.getDisplayedMagicNumber()} [Powder]`);
        }
    }
}
