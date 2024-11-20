import { AbstractCard, TargetingType } from "../../../../AbstractCard";
import { Vulnerable } from "../../../../buffs/standard/Vulnerable";
import { EntityRarity, PlayableCard } from "../../../../PlayableCard";
import { CardType } from "../../../../Primitives";

export class InspireFear extends PlayableCard {
    constructor() {
        super({
            name: "Inspire Fear",
            cardType: CardType.ATTACK,
            targetingType: TargetingType.NO_TARGETING,
            rarity: EntityRarity.UNCOMMON,
        });
        this.baseEnergyCost = 2;
        this.baseDamage = 10;
        this.baseMagicNumber = 2; // Amount of Vulnerable applied to enemies
    }

    override InvokeCardEffects(targetCard?: AbstractCard): void {
        // Deal 10 damage to all enemies
        this.forEachEnemy(enemy => {
            this.dealDamageToTarget(enemy);
        });

        // Apply 2 Vulnerable to all enemies
        this.forEachEnemy(enemy => {
            this.actionManager.applyBuffToCharacterOrCard(enemy, new Vulnerable(this.baseMagicNumber));
        });

        // Apply 1 Vulnerable to all allies
        this.forEachAlly(ally => {
            this.actionManager.applyBuffToCharacterOrCard(ally, new Vulnerable(1));
        });

    }

    override get description(): string {
        return `Deal ${this.getDisplayedDamage()} damage to ALL enemies.  Apply ${this.getDisplayedMagicNumber()} Vulnerable to all enemies. Apply 1 Vulnerable to all allies.`;
    }
}
