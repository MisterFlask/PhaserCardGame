//  Deal 10 damage to an enemy.  Manufacture a Charge to your hand for each 2 Ashes you have.

import { AbstractCard, TargetingType } from "../../../../AbstractCard";
import { BaseCharacter } from "../../../../BaseCharacter";
import { EntityRarity } from "../../../../EntityRarity";
import { PlayableCard } from "../../../../PlayableCard";
import { CardType } from "../../../../Primitives";
import { Charge } from "../commons/Charge";

export class ForgeBlast extends PlayableCard {
    constructor() {
        super({
            name: "Forge Blast",
            cardType: CardType.ATTACK,
            targetingType: TargetingType.ENEMY,
            rarity: EntityRarity.UNCOMMON,
        });
        this.baseDamage = 10;
    }

    override InvokeCardEffects(targetCard?: AbstractCard): void {
        if (!this.owningCharacter || !targetCard || !(targetCard instanceof BaseCharacter)) {
            console.error("ForgeBlast was invoked without an owning character or valid target.");
            return;
        }

        // Deal damage
        this.dealDamageToTarget(targetCard);

        // Calculate number of Charges to manufacture based on Ashes
        const ashesAmount = this.ashes.value;
        const chargesToManufacture = Math.floor(ashesAmount / 2);

        // Manufacture Charges
        for (let i = 0; i < chargesToManufacture; i++) {
            this.actionManager.createCardToHand(new Charge());
        }
    }

    override get description(): string {
        return `Deal ${this.getDisplayedDamage()} damage. Manufacture a Charge to your hand for each 2 Ashes you have.`;
    }
}