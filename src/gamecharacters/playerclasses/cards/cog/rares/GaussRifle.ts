// deal 20 damage to an enemy.  Buster.  Precision.  Cost 2.  If this card was Manufactured, do it again.

import { AbstractCard, TargetingType } from "../../../../AbstractCard";
import { BaseCharacter } from "../../../../BaseCharacter";
import { Buster } from "../../../../buffs/playable_card/Buster";
import { EntityRarity } from "../../../../EntityRarity";
import { PlayableCard } from "../../../../PlayableCard";
import { CardType } from "../../../../Primitives";

export class GaussRifle extends PlayableCard {
    constructor() {
        super({
            name: "Gauss Rifle",
            cardType: CardType.ATTACK,
            targetingType: TargetingType.ENEMY,
            rarity: EntityRarity.RARE,
            portraitName: "tesla-turret",
        });
        this.baseEnergyCost = 2;
        this.baseDamage = 20;
        this.buffs.push(new Buster(1));
        this.flavorText = "Coils charged with more current than the manual recommends.";
    }

    override get description(): string {
        return `Deal ${this.getDisplayedDamage()} damage. Buster. Precision. If this card was Manufactured, do it again.`;
    }

    override InvokeCardEffects(targetCard?: AbstractCard): void {
        if (!targetCard || !(targetCard instanceof BaseCharacter)) return;

        // Deal damage once
        this.dealDamageToTarget(targetCard);

        // If the card was Manufactured, deal damage again
        if (this.wasManufactured()) {
            this.dealDamageToTarget(targetCard);
        }
    }
}