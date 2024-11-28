import { GameState } from "../../../rules/GameState";
import { CardType } from "../../Primitives";
import { AbstractBuff } from "../AbstractBuff";
import { Lightweight } from "../playable_card/Lightweight";

export class StrongBack extends AbstractBuff {
    constructor(stacks: number = 1) {
        super();
        this.stacks = stacks;
        this.isDebuff = false;
        this.isPersistentBetweenCombats = true;
        this.isPersonaTrait = true;
    }

    override getDisplayName(): string {
        return "Strong Back";
    }

    override getDescription(): string {
        return `At the start of combat, apply ${this.getStacksDisplayText()} Light to a random piece of cargo in your draw pile.`;
    }

    override onCombatStart(): void {
        const gameState = GameState.getInstance();
        const drawPile = gameState.combatState.drawPile;
        
        // Filter for cargo cards
        const cargoCards = drawPile.filter(card => card.cardType === CardType.ITEM);
        
        if (cargoCards.length > 0) {
            // Select a random cargo card
            const randomCargoCard = cargoCards[Math.floor(Math.random() * cargoCards.length)];
            // Apply Light buff
            this.actionManager.applyBuffToCard(randomCargoCard, new Lightweight(this.stacks));
        }
    }
}
