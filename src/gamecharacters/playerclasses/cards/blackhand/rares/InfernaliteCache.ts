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
        this.baseMagicNumber = 6;
        this.baseEnergyCost = 1;
    }

    override get description(): string {
        return `Gain ${this.getDisplayedMagicNumber()} ${TextGlyphs.getInstance().PAGES_ICON_RAW}.`;
    }
    
    override InvokeCardEffects(targetCard?: BaseCharacter): void {
        if (this.owner) {
            this.actionManager.modifyAshes(this.getBaseMagicNumberAfterResourceScaling(), this.owner as BaseCharacter);
        }
    }
}
