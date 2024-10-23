import { TargetingType } from "../../../../AbstractCard";
import { BaseCharacter } from "../../../../BaseCharacter";
import { CardRarity, PlayableCard } from "../../../../PlayableCard";
import { CardType } from "../../../../Primitives";

export class SoulTrap extends PlayableCard {
    constructor() {
        super({
            name: "Soul Trap",
            cardType: CardType.ATTACK,
            targetingType: TargetingType.ENEMY,
            rarity: CardRarity.UNCOMMON,
        });
        this.baseDamage = 9;
        this.energyCost = 2;
    }

    override get description(): string {
        return `Deal ${this.getDisplayedDamage()} damage. Fatal: gain 2 max HP and exhaust.`;
    }

    override InvokeCardEffects(targetCard?: BaseCharacter): void {
        this.dealDamageToTarget(targetCard as BaseCharacter);

        if (!this.owner) {
            return;
        }

        if (targetCard && targetCard.hitpoints <= 0) {
            this.owner.maxHitpoints += 2; // Gain 2 max HP
            this.owner.hitpoints += 2;
        }

        this.actionManager.exhaustCard(this);
    }
}
