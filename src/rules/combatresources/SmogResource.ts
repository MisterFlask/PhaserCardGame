import { TextGlyphs } from '../../text/TextGlyphs';
import { ActionManager } from '../../utils/ActionManager';
import { PileName } from '../DeckLogicHelper';
import { GameState } from '../GameState';
import { AbstractCombatResource } from './AbstractCombatResource';

export class SmogResource extends AbstractCombatResource {
    private static readonly RETURN_CARD_COST: number = 2;

    constructor() {
        super(
            "Smog",
            `Spend ${SmogResource.RETURN_CARD_COST} Smog: Return a card from your discard pile to your hand`,
            'smog_icon',
            TextGlyphs.getInstance().smogIcon
        );
        this.tint = 0x8B4513;
    }

    public onClick(): boolean {
        const gameState = GameState.getInstance();
        if (this.value >= SmogResource.RETURN_CARD_COST) {
            if (gameState.combatState.currentDiscardPile.length > 0) {
                // Deduct the cost upfront
                this.value -= SmogResource.RETURN_CARD_COST;
                
                ActionManager.getInstance().selectFromCardPool({
                    name: "Return to Hand",
                    instructions: "Choose a card to return to your hand",
                    min: 1,
                    max: 1,
                    cancellable: true,
                    cardPool: gameState.combatState.currentDiscardPile,
                    action: (selectedCards) => {
                        if (selectedCards.length > 0) {
                            ActionManager.getInstance().DoAThing("Smog Resource Click", () => {
                                const card = selectedCards[0];
                                ActionManager.getInstance().moveCardToPile(card, PileName.Hand);
                            });
                        }
                    },
                    onCancelAction: () => {
                        // Refund the cost if cancelled
                        this.value += SmogResource.RETURN_CARD_COST;
                    }
                });
            }
            return true;
        }
        return false;
    }
} 