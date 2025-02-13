import { TextGlyphs } from "../../../../../text/TextGlyphs";
import { TargetingType } from "../../../../AbstractCard";
import { BaseCharacter } from "../../../../BaseCharacter";
import { PlayableCard } from "../../../../PlayableCard";

export class InfernaliteCache extends PlayableCard {
    constructor() {
        super({
            name: "Infernalite Cache",
            description: `_`,
            portraitName: "enrage-test",
            targetingType: TargetingType.NO_TARGETING,
        });
        this.baseMagicNumber = 4;
        this.baseEnergyCost = 1;
    }

    override get description(): string {
        return `Gain ${this.getDisplayedMagicNumber()} ${TextGlyphs.getInstance().smogIcon}.  Volatile.`;
    }
    
    override InvokeCardEffects(targetCard?: BaseCharacter): void {
        if (this.owningCharacter) {
            this.actionManager.modifySmog(this.getBaseMagicNumberAfterResourceScaling(), this.owningCharacter as BaseCharacter);
        }
    }
}
