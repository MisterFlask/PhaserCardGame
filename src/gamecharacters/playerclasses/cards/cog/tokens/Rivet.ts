// Manufactured-only token. Never draftable (excluded from CogClass.availableCards,
// matching TakeCover/EldritchSmoke). Stamped by Stamp Press, Assembly Line, and
// Production Quota.

import { AbstractCard, TargetingType } from "../../../../AbstractCard";
import { BaseCharacter } from "../../../../BaseCharacter";
import { ExhaustBuff } from "../../../../buffs/playable_card/ExhaustBuff";
import { EntityRarity } from "../../../../EntityRarity";
import { PlayableCard } from "../../../../PlayableCard";
import { CardType } from "../../../../Primitives";

export class Rivet extends PlayableCard {
    constructor() {
        super({
            name: "Rivet",
            cardType: CardType.ATTACK,
            targetingType: TargetingType.ENEMY,
            rarity: EntityRarity.TOKEN,
        });
        this.baseEnergyCost = 0;
        this.baseDamage = 3;
        this.buffs.push(new ExhaustBuff());
        this.tags.push("manufactured");
        this.flavorText = "Stamped, not forged. Good for one use and one use only.";
    }

    override InvokeCardEffects(targetCard?: AbstractCard): void {
        if (targetCard instanceof BaseCharacter) {
            this.dealDamageToTarget(targetCard);
        }
    }

    override get description(): string {
        return `Deal ${this.getDisplayedDamage()} damage. Exhaust.`;
    }
}
