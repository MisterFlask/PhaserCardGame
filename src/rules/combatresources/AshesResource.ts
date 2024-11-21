import { TextGlyphs } from '../../text/TextGlyphs';
import { ActionManager } from '../../utils/ActionManager';
import { GameState } from '../GameState';
import { AbstractCombatResource } from './AbstractCombatResource';

export class Ashes extends AbstractCombatResource {
    constructor() {
        super(
            "Ashes",
            `Passive: If you win combat with at least 4 Ashes, gain an additional card reward option. At 10, get 2 instead.  Active: pay 2 Ashes to upgrade a random block or damage card in hand.`,
            'ashes_icon',
            TextGlyphs.getInstance().pagesIcon
        );
        this.tint = 0xF5F5DC;
    }

    public onClick(): void {
        const gameState = GameState.getInstance();
        if (this.value >= 2) {
            ActionManager.getInstance().DoAThing("Ashes Resource Click", () => {
                // Filter hand for cards with damage or block
                const eligibleCards = gameState.combatState.currentHand.filter(card => 
                    card.baseDamage > 0 || card.baseBlock > 0
                );

                if (eligibleCards.length > 0) {
                    // Select random eligible card
                    const targetCard = eligibleCards[Math.floor(Math.random() * eligibleCards.length)];

                    // Increase damage and block by 50% if they exist
                    if (targetCard.baseDamage > 0) {
                        targetCard.baseDamage = Math.floor(targetCard.baseDamage * 1.5);
                    }
                    if (targetCard.baseBlock > 0) {
                        targetCard.baseBlock = Math.floor(targetCard.baseBlock * 1.5);
                    }

                    this.value -= 2;
                }
            });
        }

    } 
} 