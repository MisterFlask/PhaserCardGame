import { TextGlyphs } from '../../text/TextGlyphs';
import { ActionManager } from '../../utils/ActionManager';
import { GameState } from '../GameState';
import { AbstractCombatResource } from './AbstractCombatResource';

export class Ashes extends AbstractCombatResource {
    constructor() {
        super(
            "Ashes",
            `Passive: If you win combat with at least 4 Ashes, gain an additional card reward option.  Pay 2 Ashes: Increase damage and block of a random card in your hand by 50%.`,
            'ashes_icon',
            TextGlyphs.getInstance().ashesIcon
        );
        this.tint = 0xF5F5DC;
    }

    public onClick(): boolean {
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

                    targetCard.name += "⚡"

                    this.value -= 2;
                }
            });
            return true;
        }
        return false;
    } 
} 