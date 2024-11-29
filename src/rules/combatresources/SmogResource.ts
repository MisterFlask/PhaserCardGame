import { TextGlyphs } from '../../text/TextGlyphs';
import { ActionManager } from '../../utils/ActionManager';
import { PileName } from '../DeckLogicHelper';
import { GameState } from '../GameState';
import { AbstractCombatResource } from './AbstractCombatResource';

export class SmogResource extends AbstractCombatResource {
    constructor() {
        super(
            "Smog",
            "Spend 2 Smog: Return a card from your discard pile to your hand",
            'smog_icon',
            TextGlyphs.getInstance().smogIcon
        );
        this.tint = 0x8B4513;
    }

    public onClick(): void {
        const gameState = GameState.getInstance();
        if (this.value >= 2) {
            if (gameState.combatState.currentDiscardPile.length > 0) {
                ActionManager.getInstance().requireCardSelection({
                    name: "Return to Hand",
                    instructions: "Choose a card to return to your hand",
                    min: 1,
                    max: 1,
                    cancellable: true,
                    action: (selectedCards) => {
                        if (selectedCards.length > 0) {
                            ActionManager.getInstance().DoAThing("Smog Resource Click", () => {
                                const card = selectedCards[0];
                                ActionManager.getInstance().moveCardToPile(card, PileName.Hand);
                                this.value -= 2;
                            });
                        }
                    }
                });
            }
        }
    }
} 