import { TextGlyphs } from '../../text/TextGlyphs';
import { PlayableCardType } from '../../Types';
import { ActionManager } from '../../utils/ActionManager';
import { GameState } from '../GameState';
import { AbstractCombatResource } from './AbstractCombatResource';

export class Ashes extends AbstractCombatResource {
    constructor() {
        super(
            "Ashes",
            `Pay 2 Ashes: Increase damage and block of a random card in your hand by 50%.`,
            'ashes_icon',
            TextGlyphs.getInstance().ashesIcon
        );
        this.tint = 0xF5F5DC;
    }

    public onClick(): boolean {
        const gameState = GameState.getInstance();
        if (this.value >= 2) {
            // Filter hand for cards with damage or block
            const eligibleCards = gameState.combatState.currentHand.filter(card => 
                card.baseDamage > 0 || card.baseBlock > 0
            );

            if (eligibleCards.length === 0) {
                // Display a message if no eligible card is available.
                ActionManager.getInstance().displaySubtitle("No eligible cards for Ashes boost", 1000);
                return false;
            }

            // Use requireCardSelection instead of randomly selecting a card.
            ActionManager.getInstance().requireCardSelectionFromHand({
                name: "Ashes Ability",
                instructions: "Select a card to empower (damage and block increased by 50%)",
                min: 1,
                max: 1,
                cancellable: false,
                action: (selectedCards: PlayableCardType[]) => {
                    const targetCard = selectedCards[0];
                    if (targetCard.baseDamage > 0) {
                        targetCard.baseDamage = Math.floor(targetCard.baseDamage * 1.5);
                    }
                    if (targetCard.baseBlock > 0) {
                        targetCard.baseBlock = Math.floor(targetCard.baseBlock * 1.5);
                    }
                    targetCard.name += "⚡";
                    this.value -= 2;
                }
            });
            return true;
        }
        return false;
    } 
} 