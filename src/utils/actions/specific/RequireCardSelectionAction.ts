import { getActiveHeadlessPolicy } from "../../../combat/sim/HeadlessPolicyRegistry";
import { GameState } from "../../../rules/GameState";
import CombatUiManager from "../../../screens/subcomponents/CombatUiManager";
import { PlayableCardType } from "../../../Types";
import CardSelectionFromHandManager from "../../../ui/CardSelectionFromHandManager";
import { GameAction } from "../GameAction";

export class RequireCardSelectionFromHandAction extends GameAction {
    constructor(
        private params: {
            name: string;
            instructions: string;
            min: number;
            max: number;
            cancellable: boolean;
            action: (selectedCards: PlayableCardType[]) => void;
        }
    ) {
        super();
        this.neverTimeout = true;
    }

    async playAction(): Promise<GameAction[]> {
        const gameState = GameState.getInstance();
        const currentHand = gameState.combatState.currentHand;

        // If the min number of cards is greater than the current hand size,
        // just perform the action on the set of cards that are in the player's hand.
        if (this.params.min > currentHand.length) {
            this.params.action(currentHand as PlayableCardType[]);
            return [];
        }

        // Headless combat (src/combat/sim/HeadlessCombat.ts) has no scene to
        // put a CardSelectionFromHandManager overlay on; resolve via the
        // active IPlayPolicy instead of touching CombatUiManager at all.
        const headlessPolicy = getActiveHeadlessPolicy();
        if (headlessPolicy) {
            const selected = headlessPolicy.chooseCardsFromHand({
                name: this.params.name,
                instructions: this.params.instructions,
                min: this.params.min,
                max: this.params.max,
                candidates: currentHand as PlayableCardType[]
            });
            this.params.action(selected);
            return [];
        }

        const combatUiManager = CombatUiManager.getInstance();
        const scene = combatUiManager.scene;

        const selectionManager = new CardSelectionFromHandManager({
            scene: scene,
            action: this.params.action,
            name: this.params.name,
            instructions: this.params.instructions,
            min: this.params.min,
            max: this.params.max,
            cancellable: this.params.cancellable
        });

        selectionManager.start();

        return [];
    }
}