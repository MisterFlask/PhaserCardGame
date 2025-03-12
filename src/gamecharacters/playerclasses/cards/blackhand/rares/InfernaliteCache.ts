import { TextGlyphs } from "../../../../../text/TextGlyphs";
import { TargetingType } from "../../../../AbstractCard";
import { BaseCharacter } from "../../../../BaseCharacter";
import { VolatileBuff } from "../../../../buffs/playable_card/VolatileCardBuff";
import { PlayableCard } from "../../../../PlayableCard";
import { CardType } from "../../../../Primitives";

export class InfernaliteCache extends PlayableCard {
    constructor() {
        super({
            name: "Infernalite Cache",
            description: `_`,
            portraitName: "enrage-test",
            targetingType: TargetingType.NO_TARGETING,
            cardType: CardType.SKILL,
        });
        this.baseMagicNumber = 4;
        this.baseEnergyCost = 2;
        this.buffs.push(new VolatileBuff());
    }

    override get description(): string {
        return `Gain ${this.getDisplayedMagicNumber()} ${TextGlyphs.getInstance().smogIcon}.`;
    }
    
    override InvokeCardEffects(targetCard?: BaseCharacter): void {
        if (this.owningCharacter) {
            this.actionManager.modifySmog(this.getBaseMagicNumberAfterResourceScaling(), this.owningCharacter as BaseCharacter);
        }
    }
}
