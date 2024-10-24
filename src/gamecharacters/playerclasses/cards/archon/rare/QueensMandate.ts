import { GameState } from "../../../../../rules/GameState";
import { AbstractCard, TargetingType } from "../../../../AbstractCard";
import { CardRarity, PlayableCard } from "../../../../PlayableCard";
import { CardType } from "../../../../Primitives";

export class QueensMandate extends PlayableCard {
    constructor() {
        super({
            name: "Queen's Mandate",
            cardType: CardType.SKILL,
            targetingType: TargetingType.NO_TARGETING,
            rarity: CardRarity.RARE,
        });
        this.energyCost = 1;
    }

    override InvokeCardEffects(targetCard?: AbstractCard): void {
        const gameState = GameState.getInstance();
        const combatState = gameState.combatState;

        // Increase Venture and Pages by 2
        combatState.combatResources.modifyVenture(2);
        combatState.combatResources.modifyPages(2);

        // Increase defense and offense scaling of all cards in hand by 1 Page
        combatState.currentHand.forEach(card => {
            if (card.baseBlock > 0) {
                card.resourceScalings.push({
                    resource: gameState.combatState.combatResources.pages,
                    blockScaling: 1
                });
            }
            if (card.baseDamage > 0) {
                card.resourceScalings.push({
                    resource: gameState.combatState.combatResources.venture,
                    attackScaling: 1
                });            
            }
        });
    }

    override get description(): string {
        return `Increase Venture and Pages by 2. All cards in your hand have defense scaling increased by 1 Page and offense scaling increased by 1 Venture.`;
    }
}
