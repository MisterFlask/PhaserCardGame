import Phaser from 'phaser';
import { GameState } from '../rules/GameState';
import { PlayableCardType } from '../Types';
import { TextBoxButton } from './Button';
import { DepthManager } from './DepthManager';
import { TextBox } from './TextBox';
import { UIContext, UIContextManager } from './UIContextManager';

interface CardSelectionParams {
    scene: Phaser.Scene;
    action: (selectedCards: PlayableCardType[]) => void;
    name: string;
    instructions: string;
    min: number;
    max: number;
    cancellable: boolean;
}

class CardSelectionFromHandManager {
    private scene: Phaser.Scene;
    private action: (selectedCards: PlayableCardType[]) => void;
    private name: string;
    private instructions: string;
    private min: number;
    private max: number;
    private selectedCards: Set<PlayableCardType> = new Set();
    private instructionsBox!: TextBox;
    private submitButton!: TextBoxButton;
    private overlay!: Phaser.GameObjects.Rectangle;
    private cancellable: boolean;
    private cancelButton!: TextBoxButton;

    constructor(params: CardSelectionParams) {
        this.scene = params.scene;
        this.action = params.action;
        this.name = params.name;
        this.instructions = params.instructions;
        this.min = params.min;
        this.max = params.max;
        this.cancellable = params.cancellable;
    }

    public start(): void {
        this.createOverlay();
        this.createInstructions();
        this.createSubmitButton();
        this.setupCardInteractions();
        this.disableOtherInteractions();
        if (this.cancellable) {
            this.createCancelButton();
        }
        UIContextManager.getInstance().pushContext(UIContext.CARD_SELECTION_FROM_HAND);
    }

    private createCancelButton(): void {
        this.cancelButton = new TextBoxButton({
            scene: this.scene,
            x: (this.scene.scale.width / 4) * 3,
            y: this.scene.scale.height - 100,
            width: 200,
            height: 50,
            text: 'Cancel',
            style: { fontSize: '28px', color: '#ffffff' },
            fillColor: 0x555555,
            textBoxName: 'CardSelectionCancelButton'
        });

        this.cancelButton
            .onClick(this.onCancel.bind(this))
            .setDepth(DepthManager.getInstance().OVERLAY_BASE + 100);

        this.scene.add.existing(this.cancelButton);
    }

    private createOverlay(): void {
        const depthManager = DepthManager.getInstance();
        
        this.overlay = this.scene.add.rectangle(
            this.scene.scale.width / 2,
            this.scene.scale.height / 2,
            this.scene.scale.width,
            this.scene.scale.height,
            0x000000,
            0.5
        );
        this.overlay.setDepth(depthManager.OVERLAY_BASE);
        this.overlay.setInteractive();
    }

    private createInstructions(): void {
        this.instructionsBox = new TextBox({
            scene: this.scene,
            x: this.scene.scale.width / 2,
            y: 100,
            width: this.scene.scale.width * 0.8,
            height: 100,
            text: this.instructions,
            style: { fontSize: '24px', color: '#ffffff', align: 'center' },
            fillColor: 0x000000,
            textBoxName: 'CardSelectionInstructions'
        });
        this.instructionsBox.setDepth(DepthManager.getInstance().OVERLAY_BASE + 100);
        this.scene.add.existing(this.instructionsBox);
    }

    private createSubmitButton(): void {
        this.submitButton = new TextBoxButton({
            scene: this.scene,
            x: this.scene.scale.width / 4,
            y: this.scene.scale.height - 100,
            width: 300,
            height: 50,
            text: `Select ${this.min} more card${this.min > 1 ? 's' : ''}`,
            style: { fontSize: '24px', color: '#ffffff', wordWrap: { width: 280 } },
            fillColor: 0x888888,
            textBoxName: 'CardSelectionSubmitButton'
        });

        this.submitButton
            .onClick(this.onSubmit.bind(this))
            .setDepth(DepthManager.getInstance().OVERLAY_BASE + 100);

        this.scene.add.existing(this.submitButton);

        this.updateSubmitButton();
    }

    private updateSubmitButton(): void {
        const selectedCount = this.selectedCards.size;
        const remainingCount = Math.max(this.min - selectedCount, 0);

        if (selectedCount >= this.min && selectedCount <= this.max) {
            this.submitButton.setText('Submit');
            this.submitButton.setButtonEnabled(true);
        } else {
            const buttonText = remainingCount > 0 
                ? `Select ${remainingCount} more card${remainingCount > 1 ? 's' : ''}`
                : `Too many cards selected`;
            this.submitButton.setText(buttonText);
            this.submitButton.setButtonEnabled(false);
        }
    }

    private setupCardInteractions(): void {
        const depthManager = DepthManager.getInstance();
        const handCards = GameState.getInstance().combatState.currentHand;

        handCards.forEach((card, i) => {
            if (card.physicalCard?.container) {
                card.physicalCard.container.setDepth(depthManager.OVERLAY_BASE + 100 + i);
                card.physicalCard.container.setInteractive()
                    .on('pointerdown', () => this.toggleCardSelection(card as PlayableCardType));
            }
        });
    }

    private toggleCardSelection(card: PlayableCardType): void {
        if (UIContextManager.getInstance().getContext() !== UIContext.CARD_SELECTION_FROM_HAND) {
            return;
        }
        if (this.selectedCards.has(card)) {
            this.selectedCards.delete(card);
            card.unhighlight();
        } else {
            if (this.selectedCards.size < this.max) {
                this.selectedCards.add(card);
                card.highlight();
            } else {
                // Optionally, provide feedback that the maximum selection has been reached
                console.log(`You can select up to ${this.max} cards.`);
            }
        }
        this.updateSubmitButton();
    }

    private onSubmit(): void {
        if (this.selectedCards.size >= this.min && this.selectedCards.size <= this.max) {
            this.action(Array.from(this.selectedCards));
            this.exitSelectionMode();
        }
    }

    private onCancel(): void {
        this.exitSelectionMode();
    }

    private disableOtherInteractions(): void {
        // Emit an event to disable interactions
        this.scene.events.emit('disableInteractions');
    }

    private enableOtherInteractions(): void {
        // Emit an event to enable interactions
        this.scene.events.emit('enableInteractions');
    }

    private exitSelectionMode(): void {
        this.overlay.destroy();
        this.instructionsBox.destroy();
        this.submitButton.destroy();
        if (this.cancellable) {
            this.cancelButton.destroy();
        }
        this.unhighlightAllSelectedCards();
        this.enableOtherInteractions();
        this.cleanupCardInteractions();

        // Restore original card depths
        const depthManager = DepthManager.getInstance();
        const handCards = GameState.getInstance().combatState.currentHand;
        handCards.forEach((card, i) => {
            if (card.physicalCard?.container) {
                card.physicalCard.container.setDepth(depthManager.CARD_BASE + i);
            }
        });
        UIContextManager.getInstance().popContext();
    }

    private unhighlightAllSelectedCards(): void {
        this.selectedCards.forEach(card => card.unhighlight());
        this.selectedCards.clear();
    }

    private cleanupCardInteractions(): void {
        const handCards = GameState.getInstance().combatState.currentHand;

        handCards.forEach(card => {
            card.physicalCard?.container.off('pointerdown', this.toggleCardSelection, this);
        });
    }
}

export default CardSelectionFromHandManager;
