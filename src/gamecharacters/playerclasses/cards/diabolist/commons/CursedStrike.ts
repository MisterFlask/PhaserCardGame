// apply 1 Cursed.  Deal 8 damage.  Cost 1.

import { AbstractCard, TargetingType } from "../../../../AbstractCard";
import type { BaseCharacter } from "../../../../BaseCharacter";
import { Cursed } from "../../../../buffs/standard/Cursed";
import { Lethality } from "../../../../buffs/standard/Lethality";
import { EntityRarity } from "../../../../EntityRarity";
import { PlayableCard } from "../../../../PlayableCard";
import { CardType } from "../../../../Primitives";

export class CursedStrike extends PlayableCard {
    constructor() {
        super({
            name: "Cursed Strike",
            cardType: CardType.ATTACK,
            targetingType: TargetingType.ENEMY,
            rarity: EntityRarity.COMMON,
        });
        this.baseDamage = 7;
        this.baseEnergyCost = 1;
        this.baseMagicNumber = 1; 
        this.rarity = EntityRarity.COMMON;
    }

    override get description(): string {
        return `Deal ${this.getDisplayedDamage()} damage. Apply ${this.getDisplayedMagicNumber()} Cursed.  If you have at least 3 Mettle: gain 2 Lethality.`;
    }

    override InvokeCardEffects(targetCard?: AbstractCard): void {
        if (targetCard) {
            this.dealDamageToTarget(targetCard as BaseCharacter);
            this.actionManager.applyBuffToCharacterOrCard(targetCard as BaseCharacter, new Cursed(this.getBaseMagicNumberAfterResourceScaling()));
            if (this.mettle.value >= 3) {
                this.actionManager.applyBuffToCharacterOrCard(this.owningCharacter as BaseCharacter, new Lethality(2));
            }
        }
    }
}
