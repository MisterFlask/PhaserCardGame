// cost 4.  Targeted enemy takes 10 damage 3 times.  Giantkiller. Bloodprice.  Decreases max HP of owner by 3.  If this kills something, gain 3 mx HP. exhaust.

import { AbstractCard, TargetingType } from "../../../../AbstractCard";
import { BaseCharacter } from "../../../../BaseCharacter";
import { ExhaustBuff } from "../../../../buffs/playable_card/ExhaustBuff";
import { BloodPriceBuff } from "../../../../buffs/standard/Bloodprice";
import { DamageIncreaseOnKill } from "../../../../buffs/standard/DamageIncreaseOnKill";
import { GiantKiller } from "../../../../buffs/standard/GiantKiller";
import { EntityRarity, PlayableCard } from "../../../../PlayableCard";
import { CardType } from "../../../../Primitives";

export class Balefire extends PlayableCard {
    constructor() {
        super({
            name: "Balefire",
            cardType: CardType.ATTACK,
            targetingType: TargetingType.ENEMY,
            rarity: EntityRarity.RARE,
        });
        this.baseEnergyCost = 3;
        this.baseDamage = 12;
        this.buffs.push(new BloodPriceBuff(3));
        this.buffs.push(new GiantKiller(1));
        this.buffs.push(new ExhaustBuff())
        this.buffs.push(new DamageIncreaseOnKill(5));
        this.resourceScalings.push({
            resource: this.powder,
            attackScaling: 1,
        });
    }

    override get description(): string {
        return `Deal ${this.getDisplayedDamage()} damage 2 times. Giant Killer. Bloodprice 3. Decrease your max HP by 3. Exhaust.`;
    }

    override InvokeCardEffects(targetCard?: AbstractCard): void {
        const target = targetCard as BaseCharacter;
        if (!target) return;

        for (let i = 0; i < this.getBaseMagicNumberAfterResourceScaling(); i++) {
            this.dealDamageToTarget(target);
        }

        const owner = this.owner as BaseCharacter;
        if (owner) {
            owner.maxHitpoints -= 3;
            owner.hitpoints = Math.min(owner.hitpoints, owner.maxHitpoints);
        }
    }

}



