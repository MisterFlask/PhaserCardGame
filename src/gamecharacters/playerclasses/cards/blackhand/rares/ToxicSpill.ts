import { TargetingType } from "../../../../AbstractCard";
import { BaseCharacter } from "../../../../BaseCharacter";
import { VolatileBuff } from "../../../../buffs/playable_card/VolatileCardBuff";
import { Burning } from "../../../../buffs/standard/Burning";
import { Poisoned } from "../../../../buffs/standard/Poisoned";
import { Weak } from "../../../../buffs/standard/Weak";
import { EntityRarity, PlayableCard } from "../../../../PlayableCard";
import { CardType } from "../../../../Primitives";

export class ToxicSpill extends PlayableCard {
    constructor() {
        super({
            name: "Toxic Spill",
            cardType: CardType.SKILL,
            rarity: EntityRarity.RARE,
            targetingType: TargetingType.ENEMY,
        }); 
        this.baseEnergyCost = 2;
        this.baseMagicNumber = 6;
        this.buffs.push(new VolatileBuff());
    }

    override get description(): string {
        return `Apply 4 Burning, ${this.getDisplayedMagicNumber()} Poison, and 1 Weak to an enemy. Volatile.`;
    }

    override InvokeCardEffects(targetCard?: BaseCharacter): void {
        if (targetCard) {
            this.actionManager.applyBuffToCharacterOrCard(targetCard, new Burning(4));
            this.actionManager.applyBuffToCharacterOrCard(targetCard, new Poisoned(this.getBaseMagicNumberAfterResourceScaling()));
            this.actionManager.applyBuffToCharacterOrCard(targetCard, new Weak(1));
        }
    }
}
