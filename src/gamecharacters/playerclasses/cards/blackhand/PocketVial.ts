import { CombatState } from "../../../../rules/GameState";
import { AbstractCard, TargetingType } from "../../../AbstractCard";
import { BaseCharacter } from "../../../BaseCharacter";
import { Smoldering } from "../../../buffs/blackhand/Smoldering";
import { VolatileBuff } from "../../../buffs/playable_card/VolatileCardBuff";
import { Weak } from "../../../buffs/standard/Weak";
import { IBaseCharacter } from "../../../IBaseCharacter";
import { PlayableCard, CardRarity } from "../../../PlayableCard";
import { CardType } from "../../../Primitives";


export class PocketVial extends PlayableCard {
    constructor() {
        super({
            name: "Pocket Vial",
            cardType: CardType.ATTACK,
            targetingType: TargetingType.ENEMY,
            rarity: CardRarity.COMMON,
        });
        this.baseDamage = 3;
        this.baseMagicNumber = 1;
        this.buffs.push(new VolatileBuff());
    }

    override get description(): string {
        return `Deal ${this.getDisplayedDamage()} damage and apply ${this.getDisplayedMagicNumber()} Weak to an enemy. Increase damage by 1 for each Smoldering they have. Volatile.`;
    }

    override InvokeCardEffects(targetCard?: AbstractCard): void {
        if (targetCard) {
            const smolderingCount = targetCard.getBuffStacks(new Smoldering(1).getName());
            const totalDamage = this.getBaseDamageAfterResourceScaling() + smolderingCount;
            
            this.dealDamageToTarget(targetCard as BaseCharacter);
            targetCard.addBuff(new Weak(this.getBaseMagicNumberAfterResourceScaling()));
        }
    }
}