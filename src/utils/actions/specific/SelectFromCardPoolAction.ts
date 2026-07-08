import { Scene } from 'phaser';
import { getActiveHeadlessPolicy } from "../../../combat/sim/HeadlessPolicyRegistry";
import { PlayableCard } from "../../../gamecharacters/PlayableCard";
import { SceneChanger } from "../../../screens/SceneChanger";
import { CardSelectionFromCustomPoolOverlay } from "../../../ui/CardSelectionFromCustomPoolOverlay";
import { GameAction } from "../GameAction";

export class SelectFromCardPoolAction extends GameAction {
    constructor(
        private params: {
            name: string;
            instructions: string;
            min: number;
            max: number;
            cancellable: boolean;
            cardPool: PlayableCard[];
            action: (selectedCards: PlayableCard[]) => void;
            onCancelAction?: () => void;
        }
    ) {
        super();
        this.neverTimeout = true;
    }

    async playAction(): Promise<GameAction[]> {
        // If the min number of cards is greater than the available cards,
        // just perform the action on all available cards
        if (this.params.min > this.params.cardPool.length) {
            this.params.action(this.params.cardPool);
            return [];
        }

        // Headless combat (src/combat/sim/HeadlessCombat.ts) has no scene to
        // put a CardSelectionFromCustomPoolOverlay on; resolve via the
        // active IPlayPolicy instead of touching SceneChanger at all.
        const headlessPolicy = getActiveHeadlessPolicy();
        if (headlessPolicy) {
            const selected = headlessPolicy.chooseCardsFromPool({
                name: this.params.name,
                instructions: this.params.instructions,
                min: this.params.min,
                max: this.params.max,
                cancellable: this.params.cancellable,
                cardPool: this.params.cardPool
            });
            if (selected) {
                this.params.action(selected);
            } else if (this.params.onCancelAction) {
                this.params.onCancelAction();
            }
            return [];
        }

        const scene = SceneChanger.getCurrentScene();
        if (!scene) {
            console.error("No scene available for SelectFromCardPoolAction");
            return [];
        }

        return new Promise<GameAction[]>((resolve) => {
            const overlay = new CardSelectionFromCustomPoolOverlay(scene as Scene);
            overlay.showCardsWithSelection(
                this.params.cardPool,
                this.params.instructions,
                this.params.min,
                this.params.max,
                (selectedCards: PlayableCard[] | null) => {
                    if (selectedCards) {
                        this.params.action(selectedCards);
                    } else if (this.params.onCancelAction) {
                        this.params.onCancelAction();
                    }
                    resolve([]);
                },
                this.params.cancellable
            );
        });
    }
} 