import { DamageInfo } from "../../../rules/DamageInfo";
import { GameState } from "../../../rules/GameState";
import { BaseCharacter } from "../../BaseCharacter";
import { PlayableCard } from "../../PlayableCard";
import { AbstractBuff } from "../AbstractBuff";

export class RustMonster extends AbstractBuff {
    constructor(stacks: number = 1) {
        super();
        this.stacks = stacks;
        this.isDebuff = false;
    }

    override getDisplayName(): string {
        return "Rust Monster";
    }

    override getDescription(): string {
        return `When the owner hits a character, a random card in the Draw pile with >0 block has this value decreased by -${this.getStacksDisplayText()}.`;
    }

    override onOwnerStriking_CannotModifyDamage(targetCharacter: BaseCharacter, cardPlayedIfAny: PlayableCard | null, damageInfo: DamageInfo): void {
        const gameState = GameState.getInstance();
        const combatState = gameState.combatState;

        // Get all non-exhausted cards of the target character
        const nonExhaustedCards = [
            ...combatState.drawPile,
            ...combatState.currentDiscardPile
        ]
        .filter(card => card instanceof PlayableCard)
        .filter(card => card.owningCharacter === targetCharacter && (card as PlayableCard).baseBlock > 0);

        if (nonExhaustedCards.length > 0) {
            // Select a random card with >0 defense
            const randomCard = nonExhaustedCards[Math.floor(Math.random() * nonExhaustedCards.length)];

            // Reduce the card's defense
            randomCard.baseBlock = Math.max(0, randomCard.baseBlock - this.stacks);

            console.log(`Rust Monster reduced ${randomCard.name}'s defense by ${this.stacks}`);
        }
    }
}
