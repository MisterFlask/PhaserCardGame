import { TextGlyphs } from '../../text/TextGlyphs';
import { ActionManager } from '../../utils/ActionManager';
import { PileName } from '../DeckLogicHelper';
import { GameState } from '../GameState';
import { AbstractCombatResource } from './AbstractCombatResource';

export class AshesResource extends AbstractCombatResource {
    private static readonly RETURN_CARD_COST: number = 2;

    constructor() {
        super(
            "Ashes",
            `Spend ${AshesResource.RETURN_CARD_COST} Ashes: Return a card from your exhaust pile to your hand`,
            'ashes_icon',
            TextGlyphs.getInstance().ashesIcon
        );
        this.tint = 0xF5F5DC;
    }

    public onClick(): boolean {
        const gameState = GameState.getInstance();
        if (this.value >= AshesResource.RETURN_CARD_COST) {
            if (gameState.combatState.currentExhaustPile.length > 0) {
                // Deduct the cost upfront
                this.value -= AshesResource.RETURN_CARD_COST;

                ActionManager.getInstance().selectFromCardPool({
                    name: "Retrieve from the Pyre",
                    instructions: "Choose a card to return to your hand",
                    min: 1,
                    max: 1,
                    cancellable: true,
                    cardPool: gameState.combatState.currentExhaustPile,
                    action: (selectedCards) => {
                        if (selectedCards.length > 0) {
                            ActionManager.getInstance().DoAThing("Ashes Resource Click", () => {
                                const card = selectedCards[0];
                                ActionManager.getInstance().moveCardToPile(card, PileName.Hand);
                                this.broadcastResourceUsed();
                            });
                        }
                    },
                    onCancelAction: () => {
                        // Refund the cost if cancelled
                        this.value += AshesResource.RETURN_CARD_COST;
                    }
                });
            }
            return true;
        }
        return false;
    }
}
