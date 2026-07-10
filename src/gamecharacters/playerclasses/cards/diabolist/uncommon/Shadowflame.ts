import { TargetingType } from "../../../../AbstractCard";
import { BaseCharacter } from "../../../../BaseCharacter";
import { Burning } from "../../../../buffs/standard/Burning";
import { EntityRarity } from "../../../../EntityRarity";
import { PlayableCard } from "../../../../PlayableCard";
import { CardType } from "../../../../Primitives";
import { BasicProcs } from "../../../../procs/BasicProcs";

export class Shadowflame extends PlayableCard {
    constructor() {
        super({
            name: "Soul Trap",
            portraitName: "burning-skull",
            cardType: CardType.ATTACK,
            targetingType: TargetingType.ENEMY,
            rarity: EntityRarity.UNCOMMON,
        });
        this.baseDamage = 15;
        this.baseEnergyCost = 2;
        this.flavorText = "One good spell, spent entirely. Diabolism runs on consumables.";
    }

    override get description(): string {
        return `Deal ${this.getDisplayedDamage()} damage.  Apply 2 Burning.  Sacrifice.`;
    }

    override InvokeCardEffects(targetCard?: BaseCharacter): void {
        this.dealDamageToTarget(targetCard as BaseCharacter);

        if (!targetCard) {
            return;
        }

        this.actionManager.applyBuffToCharacter(targetCard as BaseCharacter, new Burning(2), this.owningCharacter);
        BasicProcs.getInstance().SacrificeACardOtherThan(this);
    }
}
