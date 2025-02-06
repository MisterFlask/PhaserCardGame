import { AbstractCard, TargetingType } from "../../../../AbstractCard";
import { BaseCharacter } from "../../../../BaseCharacter";
import { EntityRarity } from "../../../../EntityRarity";
import { PlayableCard } from "../../../../PlayableCard";
import { CardType } from "../../../../Primitives";
import { AbstractBuff } from "../../../../buffs/AbstractBuff";
import { ExhaustBuff } from "../../../../buffs/playable_card/ExhaustBuff";

class SoulsuckBuff extends AbstractBuff {
    constructor() {
        super();
        this.isDebuff = false;
    }

    override getDisplayName(): string {
        return "Soul Collector";
    }

    override getDescription(): string {
        return "When this card kills an enemy, gain 15 Denarians.";
    }

    override onFatal(killedUnit: BaseCharacter): void {
        this.actionManager.modifyDenarians(15);
    }
}

export class Soulsuck extends PlayableCard {
    constructor() {
        super({
            name: "Soulsuck",
            cardType: CardType.ATTACK,
            targetingType: TargetingType.ENEMY,
            rarity: EntityRarity.RARE,
        });
        this.baseEnergyCost = 1;
        this.baseDamage = 15;
        this.buffs.push(new ExhaustBuff());
        this.buffs.push(new SoulsuckBuff());
    }

    override InvokeCardEffects(targetCard?: AbstractCard): void {
        if (targetCard instanceof BaseCharacter) {
            this.dealDamageToTarget(targetCard);
        }
    }

    override get description(): string {
        return `Deal ${this.getDisplayedDamage()} damage. If this kills an enemy, gain 15 denarians. Exhaust.`;
    }
}
