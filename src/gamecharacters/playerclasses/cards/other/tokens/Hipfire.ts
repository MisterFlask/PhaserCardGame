import { TargetingType } from "../../../../AbstractCard";
import { BaseCharacter } from "../../../../BaseCharacter";
import { ExhaustBuff } from "../../../../buffs/playable_card/ExhaustBuff";
import { EntityRarity, PlayableCard } from "../../../../PlayableCard";
import { CardType } from "../../../../Primitives";

export class Hipfire extends PlayableCard {
    constructor() {
        super({
            name: "Hipfire",
            cardType: CardType.ATTACK,
            targetingType: TargetingType.ENEMY,
            rarity: EntityRarity.COMMON,
        });
        this.baseDamage = 3;
        this.baseEnergyCost = 0;
        this.buffs.push(new ExhaustBuff());
    }

    override get description(): string {
        return `Deal ${this.getDisplayedDamage()} damage.`;
    }

    override InvokeCardEffects(target: BaseCharacter): void {
        if (!target) {
            return;
        }
        this.dealDamageToTarget(target);
    }
}
