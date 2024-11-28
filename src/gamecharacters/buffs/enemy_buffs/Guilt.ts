import { GameState } from "../../../rules/GameState";
import { BaseCharacter } from "../../BaseCharacter";
import { PlayableCard } from "../../PlayableCard";
import { AbstractBuff } from "../AbstractBuff";

export class Guilt extends AbstractBuff {
    constructor(stacks: number = 1) {
        super();
        this.stacks = stacks;
        this.isDebuff = true;
    }

    override getDisplayName(): string {
        return "Guilt";
    }

    override getDescription(): string {
        return `Whenever a card with cost >2 is played, exhaust ${this.getStacksDisplayText()} card(s) from your discard pile.`;
    }

    override onAnyCardPlayedByAnyone(playedCard: PlayableCard, target?: BaseCharacter): void {
        if (playedCard.baseEnergyCost > 2) {
            const gameState = GameState.getInstance();
            const discardPile = gameState.combatState.currentDiscardPile;
            
            for (let i = 0; i < this.stacks; i++) {
                if (discardPile.length > 0) {
                    const randomIndex = Math.floor(Math.random() * discardPile.length);
                    const cardToExhaust = discardPile[randomIndex];
                    if (cardToExhaust instanceof PlayableCard) {
                        this.actionManager.exhaustCard(cardToExhaust);
                    }
                }
            }
        }
    }
}

