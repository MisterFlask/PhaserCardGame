import { VolatileBuff } from "../../../buffs/playable_card/VolatileCardBuff";
import { CombatState } from "../../../../rules/GameState";
import { CardRarity, PlayableCard } from "../../../PlayableCard";
import { CardType } from "../../../Primitives";
import { TargetingType } from "../../../AbstractCard";
import { Smoldering } from "../../../buffs/blackhand/Smoldering";
import { Weak } from "../../../buffs/standard/Weak";
import { BaseCharacter } from "../../../BaseCharacter";

export class ToxicSpill extends PlayableCard {
    constructor() {
        super({
            name: "Toxic Spill",
            cardType: CardType.CHARACTER,
            rarity: CardRarity.COMMON,
            targetingType: TargetingType.ENEMY,
        }); 
        this.baseMagicNumber = 6;
        this.buffs.push(new VolatileBuff());
    }

    override get description(): string {
        return `Apply ${this.getDisplayedMagicNumber()} Smoldering and 1 Weak to an enemy. Volatile.`;
    }

    override InvokeCardEffects(targetCard?: BaseCharacter): void {
        if (targetCard) {
            this.actionManager.applyBuffToCharacter(targetCard, new Smoldering(this.getBaseMagicNumberAfterResourceScaling()));
            this.actionManager.applyBuffToCharacter(targetCard, new Weak(1));
        }
    }
}