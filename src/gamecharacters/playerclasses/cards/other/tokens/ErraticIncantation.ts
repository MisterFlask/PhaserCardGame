import { TargetingType } from "../../../../AbstractCard";
import { BaseCharacter } from "../../../../BaseCharacter";
import { EntityRarity, PlayableCard } from "../../../../PlayableCard";
import { CardType } from "../../../../Primitives";

export class ErraticIncantation extends PlayableCard {
    constructor() {
        super({
            name: "Erratic Incantation",
            cardType: CardType.ATTACK,
            targetingType: TargetingType.ENEMY,
            rarity: EntityRarity.COMMON,
        });
        this.baseDamage = 5;
        this.baseEnergyCost = 1;
    }

    override get description(): string {
        return `Deal ${this.getDisplayedDamage()} damage to a random enemy.`;
    }

    override InvokeCardEffects(target?: BaseCharacter): void {
        this.performActionOnRandomEnemy(enemy => {
            this.dealDamageToTarget(enemy);
        });
    }
}
