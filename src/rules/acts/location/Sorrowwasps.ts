import { AbstractBuff } from '../../../gamecharacters/buffs/AbstractBuff';
import { EggsBuff } from '../../../gamecharacters/buffs/enemy_buffs/MothGod';

export class SorrowwaspsModifier extends AbstractBuff {
    getDisplayName(): string {
        return "Sorrowwasps";
    }

    getDescription(): string {
        return `At the start of the act, add Eggs to ${this.getStacksDisplayText()} random card(s) in your master deck.`;
    }

    onActStart(): void {
        const characters = this.gameState.currentRunCharacters;
        
        for (let i = 0; i < this.stacks; i++) {
            const allCards = characters.flatMap(char => char.cardsInMasterDeck);
            if (allCards.length > 0) {
                const randomIndex = Math.floor(Math.random() * allCards.length);
                const randomCard = allCards[randomIndex];
                this.actionManager.applyBuffToCard(randomCard, new EggsBuff());
            }
        }
    }
}
