import { AbstractBuff } from '../../../gamecharacters/buffs/AbstractBuff';
import { EggsBuff } from '../../../gamecharacters/buffs/enemy_buffs/MothGod';

export class SorrowMothsModifier extends AbstractBuff {
    getDisplayName(): string {
        return "Sorrow Moths";
    }

    getDescription(): string {
        return `At the start of each combat, add Eggs to ${this.getStacksDisplayText()} random cards in your draw pile.`;
    }

    onCombatStart(): void {
        const characters = this.gameState.currentRunCharacters;
        
        for (let i = 0; i < this.stacks; i++) {
            const allCards = this.gameState.combatState.allCardsInAllPilesExceptExhaust
            if (allCards.length > 0) {
                const randomIndex = Math.floor(Math.random() * allCards.length);
                const randomCard = allCards[randomIndex];
                this.actionManager.applyBuffToCard(randomCard, new EggsBuff());
            }else{
                console.warn("No cards in draw pile to add Eggs to");
            }
        }
    }
}
