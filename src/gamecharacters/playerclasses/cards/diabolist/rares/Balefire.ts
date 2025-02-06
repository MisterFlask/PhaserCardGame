// cost 4.  Targeted enemy takes 10 damage 3 times.  Giantkiller. Bloodprice.  Decreases max HP of owner by 3.  If this kills something, gain 3 mx HP. exhaust.

import { AbstractCard, TargetingType } from "../../../../AbstractCard";
import { BaseCharacter } from "../../../../BaseCharacter";
import { Buster } from "../../../../buffs/playable_card/Buster";
import { ExhaustBuff } from "../../../../buffs/playable_card/ExhaustBuff";
import { BloodPriceBuff } from "../../../../buffs/standard/Bloodprice";
import { Cursed } from "../../../../buffs/standard/Cursed";
import { DamageIncreaseOnKill } from "../../../../buffs/standard/DamageIncreaseOnKill";
import { EntityRarity } from "../../../../EntityRarity";
import { PlayableCard } from "../../../../PlayableCard";
import { CardType } from "../../../../Primitives";

export class Balefire extends PlayableCard {
    constructor() {
        super({
            name: "Balefire",
            cardType: CardType.ATTACK,
            targetingType: TargetingType.ENEMY,
            rarity: EntityRarity.RARE,
        });
        this.baseEnergyCost = 4;
        this.baseDamage = 12;
        this.buffs.push(new BloodPriceBuff(3));
        this.buffs.push(new Buster(1));
        this.buffs.push(new ExhaustBuff())
        this.buffs.push(new DamageIncreaseOnKill(5));
        this.resourceScalings.push({
            resource: this.blood,
            attackScaling: 1,
        });
    }

    override get description(): string {
        return `Deal ${this.getDisplayedDamage()} damage 2 times, plus 1 time for each Cursed the target has.`;
    }

    override InvokeCardEffects(targetCard?: AbstractCard): void {
        const target = targetCard as BaseCharacter;
        if (!target) return;

        var timesApplied = this.getBaseMagicNumberAfterResourceScaling() + target.getBuffStacks(
            new Cursed().getBuffCanonicalName());

        for (let i = 0; i < timesApplied; i++) {
            this.dealDamageToTarget(target);
        }
    }

}



