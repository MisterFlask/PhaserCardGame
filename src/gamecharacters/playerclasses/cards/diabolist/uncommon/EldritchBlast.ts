//cost 5. deal 15 damage. add an "eldritch smoke" to your hand. bloodprice 3

import { AbstractCard, TargetingType } from "../../../../AbstractCard";
import { BaseCharacter } from "../../../../BaseCharacter";
import { BloodPriceBuff } from "../../../../buffs/standard/Bloodprice";
import { CardRarity, PlayableCard } from "../../../../PlayableCard";
import { CardType } from "../../../../Primitives";
import { BasicProcs } from "../../../../procs/BasicProcs";
import { EldritchSmoke } from "../tokens/EldritchSmoke";

export class EldritchBlast extends PlayableCard {
    constructor() {
        super({
            name: "Pocket Vial",
            cardType: CardType.ATTACK,
            targetingType: TargetingType.ENEMY,
            rarity: CardRarity.COMMON,
        });
        this.baseDamage = 15;
        this.baseBlock = 0; // Assuming no block is needed
        this.baseMagicNumber = 3; // Bloodprice value
        this.buffs.push(new BloodPriceBuff(3));
    }

    override InvokeCardEffects(targetCard?: AbstractCard): void {

        this.dealDamageToTarget(targetCard as BaseCharacter);


        BasicProcs.getInstance().ManufactureCardToHand(new EldritchSmoke());        
    }

    override get description(): string {
        return `Deal ${this.getDisplayedDamage()} damage. Add an "Eldritch Smoke" to your hand. Bloodprice ${this.getDisplayedMagicNumber()}.`;
    }
}