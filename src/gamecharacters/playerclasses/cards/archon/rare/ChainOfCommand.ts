import { GameState } from "../../../../../rules/GameState";
import { AbstractCard, TargetingType } from "../../../../AbstractCard";
import { Intimidation } from "../../../../buffs/standard/Intimidation";
import { EntityRarity } from "../../../../EntityRarity";
import { PlayableCard } from "../../../../PlayableCard";
import { CardType } from "../../../../Primitives";

export class ChainOfCommand extends PlayableCard {
    constructor() {
        super({
            name: "Chain of Command",
            cardType: CardType.ATTACK,
            targetingType: TargetingType.NO_TARGETING,
            rarity: EntityRarity.RARE,
        });
        this.baseEnergyCost = 2;
        this.baseDamage = 18;
        
        this.resourceScalings.push({
            resource: this.mettle,
            attackScaling: 1,
        });
    }

    override InvokeCardEffects(targetCard?: AbstractCard): void {
        const gameState = GameState.getInstance();
        const combatState = gameState.combatState;

        combatState.enemies.forEach(enemy => {
            this.dealDamageToTarget(enemy);
        });

        this.actionManager.applyBuffToCharacterOrCard(this.owningCharacter!, new Intimidation(20));

    }

    override get description(): string {
        return `Deal ${this.getDisplayedDamage()} damage to ALL enemies.  Gain 20 Intimidation.`;
    }
}
