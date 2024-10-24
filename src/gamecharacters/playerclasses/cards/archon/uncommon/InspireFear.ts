import { AbstractCard, TargetingType } from "../../../../AbstractCard";
import { Vulnerable } from "../../../../buffs/standard/Vulnerable";
import { CardRarity, PlayableCard } from "../../../../PlayableCard";
import { CardType } from "../../../../Primitives";

export class InspireFear extends PlayableCard {
    constructor() {
        super({
            name: "Inspire Fear",
            cardType: CardType.ATTACK,
            targetingType: TargetingType.NO_TARGETING,
            rarity: CardRarity.UNCOMMON,
        });
        this.energyCost = 2;
        this.baseDamage = 10;
        this.baseMagicNumber = 2; // Amount of Vulnerable applied to enemies
        this.baseBlock = 1; // Amount of Vulnerable applied to allies
    }

    override InvokeCardEffects(targetCard?: AbstractCard): void {
        // Apply 2 Vulnerable to all enemies
        this.forEachEnemy(enemy => {
            this.actionManager.applyBuffToCharacter(enemy, new Vulnerable(this.baseMagicNumber));
        });

        // Apply 1 Vulnerable to all allies
        this.forEachAlly(ally => {
            this.actionManager.applyBuffToCharacter(ally, new Vulnerable(this.baseBlock));
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
