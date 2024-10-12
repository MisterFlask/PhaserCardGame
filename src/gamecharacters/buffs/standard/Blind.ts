import { GameState } from "../../../rules/GameState";
import { BaseCharacter } from "../../BaseCharacter";
import { PlayableCard } from "../../PlayableCard";
import { AbstractBuff } from "../AbstractBuff";

export class Blind extends AbstractBuff {
    constructor(stacks: number = 1) {
        super();
        this.stacks = stacks;
        this.isDebuff = true;
        this.imageName = "blind"; // Replace with actual icon name if available
    }

    override getName(): string {
        return "Blind";
    }

    override getDescription(): string {
        return `The next ${this.getStacksDisplayText()} card[s] played discard[s] a card at random from your hand.`;
    }

    override onAnyCardPlayed(playedCard: PlayableCard, target?: BaseCharacter): void {
        if (this.stacks > 0) {
            const gameState = GameState.getInstance();
            const hand = gameState.combatState.currentHand;

            if (hand.length > 0) {
                const randomIndex = Math.floor(Math.random() * hand.length);
                const cardToDiscard = hand[randomIndex];
                
                this.actionManager.activeDiscardCard(cardToDiscard as PlayableCard);
            }

            this.stacks--;
        }
    }
}
