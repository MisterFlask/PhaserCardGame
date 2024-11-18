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
        this.baseBlock = 1; // Amount of Vulnerable applied to allies
    }

    override InvokeCardEffects(targetCard?: AbstractCard): void {
        // Apply 2 Vulnerable to all enemies
        this.forEachEnemy(enemy => {
            this.actionManager.applyBuffToCharacterOrCard(enemy, new Vulnerable(this.baseMagicNumber));
        });

        // Apply 1 Vulnerable to all allies
        this.forEachAlly(ally => {
            this.actionManager.applyBuffToCharacterOrCard(ally, new Vulnerable(this.baseBlock));
        });

        // Deal 10 damage to all enemies
        this.forEachEnemy(enemy => {
            this.dealDamageToTarget(enemy);
        });
    }

    override get description(): string {
        return `Apply ${this.baseMagicNumber} Vulnerable to all enemies. Apply ${this.baseBlock} Vulnerable to all allies. Deal ${this.getDisplayedDamage()} damage to ALL enemies.`;
    }
}
