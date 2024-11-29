import { TargetingType } from "../../../../AbstractCard";
import { BaseCharacter } from "../../../../BaseCharacter";
import { EntityRarity, PlayableCard } from "../../../../PlayableCard";
import { CardType } from "../../../../Primitives";

export class SoulTrap extends PlayableCard {
    constructor() {
        super({
            name: "Soul Trap",
            cardType: CardType.ATTACK,
            targetingType: TargetingType.ENEMY,
            rarity: EntityRarity.UNCOMMON,
        });
        this.baseDamage = 9;
        this.baseEnergyCost = 2;
    }

    override get description(): string {
        return `Deal ${this.getDisplayedDamage()} damage. Fatal: gain 2 max HP and exhaust.`;
    }

    override InvokeCardEffects(targetCard?: BaseCharacter): void {
        this.dealDamageToTarget(targetCard as BaseCharacter);

        if (!this.owningCharacter) {
            return;
        }

        if (targetCard && targetCard.hitpoints <= 0) {
            this.owningCharacter.maxHitpoints += 2; // Gain 2 max HP
            this.owningCharacter.hitpoints += 2;
        }

        this.actionManager.exhaustCard(this);
    }
}
