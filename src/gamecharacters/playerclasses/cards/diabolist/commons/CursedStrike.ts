// apply 1 Cursed.  Deal 8 damage.  Cost 1.

import { AbstractCard, TargetingType } from "../../../../AbstractCard";
import type { BaseCharacter } from "../../../../BaseCharacter";
import { Cursed } from "../../../../buffs/standard/Cursed";
import { CardRarity, PlayableCard } from "../../../../PlayableCard";
import { CardType } from "../../../../Primitives";

export class CursedStrike extends PlayableCard {
    constructor() {
        super({
            name: "Cursed Strike",
            cardType: CardType.ATTACK,
            targetingType: TargetingType.ENEMY,
            rarity: CardRarity.COMMON,
        });
        this.baseDamage = 7;
        this.energyCost = 1;
        this.baseMagicNumber = 2; // Apply 2 Cursed instead of 1
    }

    override get description(): string {
        return `Deal ${this.getDisplayedDamage()} damage. Apply 1 Cursed.`;
    }

    override InvokeCardEffects(targetCard?: AbstractCard): void {
        if (targetCard) {
            this.dealDamageToTarget(targetCard as BaseCharacter);
            this.actionManager.applyBuffToCharacter(targetCard as BaseCharacter, new Cursed(1)); // Assuming Cursed takes a number of stacks
        }
    }
}
