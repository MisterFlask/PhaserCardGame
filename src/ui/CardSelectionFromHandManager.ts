import Phaser from 'phaser';
import { GameState } from '../rules/GameState';
import { PlayableCardType } from '../Types';
import { TextBox } from './TextBox';

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
    private submitButton!: TextBox;
    private overlay!: Phaser.GameObjects.Rectangle;
    private cancellable: boolean;
    private cancelButton!: TextBox;

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
    }

    private createCancelButton(): void {
        this.cancelButton = new TextBox({
            scene: this.scene,
            x: (this.scene.scale.width / 4) * 3, // Positioning the cancel button on the right
            y: this.scene.scale.height - 100,
            width: 200,
            height: 50,
            text: 'Cancel',
            style: { fontSize: '28px', color: '#ffffff' },
            fillColor: 0x555555,
            textBoxName: 'CardSelectionCancelButton'
        });

        this.cancelButton.background!!.setInteractive({ useHandCursor: true })
            .on('pointerdown', this.onCancel, this)
            .on('pointerover', () => {
                this.cancelButton.background?.setFillStyle(0x777777);
            })
            .on('pointerout', () => {
                this.cancelButton.background?.setFillStyle(0x555555);
            });

        this.cancelButton.setDepth(2);

        this.scene.add.existing(this.cancelButton.background!!);
        this.scene.add.existing(this.cancelButton.text);
    }

    private createOverlay(): void {
        this.overlay = this.scene.add.rectangle(
            this.scene.scale.width / 2,
            this.scene.scale.height / 2,
            this.scene.scale.width,
            this.scene.scale.height,
            0x000000,
            0.5
        );
        this.overlay.setDepth(1);
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
        this.scene.add.existing(this.instructionsBox.background!!);
        this.scene.add.existing(this.instructionsBox.text);
    }

    private createSubmitButton(): void {
        this.submitButton = new TextBox({
            scene: this.scene,
            x: this.scene.scale.width / 4, // Positioning the submit button on the left
            y: this.scene.scale.height - 100,
            width: 200,
            height: 50,
            text: 'Submit',
            style: { fontSize: '28px', color: '#ffffff' },
            fillColor: 0x555555,
            textBoxName: 'CardSelectionSubmitButton'
        });

        this.submitButton.setDepth(2);

        this.submitButton.background!!.setInteractive({ useHandCursor: true })
            .on('pointerdown', this.onSubmit, this)
            .on('pointerover', () => {
                this.submitButton.background?.setFillStyle(0x777777);
            })
            .on('pointerout', () => {
                this.submitButton.background?.setFillStyle(0x555555);
            });

        this.scene.add.existing(this.submitButton.background!!);
        this.scene.add.existing(this.submitButton.text);
    }

    private setupCardInteractions(): void {
        const handCards = GameState.getInstance().combatState.currentHand; // Assumes a method to get player's hand cards

        handCards.forEach((card, i) => {
            card.physicalCard?.container.setDepth(4 + i);
            card.physicalCard?.container.setInteractive()
                .on('pointerdown', () => this.toggleCardSelection(card as PlayableCardType));
        });
    }

    private toggleCardSelection(card: PlayableCardType): void {
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
    }

    private onSubmit(): void {
        if (this.selectedCards.size >= this.min && this.selectedCards.size <= this.max) {
            this.action(Array.from(this.selectedCards));
            this.exitSelectionMode();
        } else {
            // Optionally, provide feedback to the player
            console.log(`Please select between ${this.min} and ${this.max} cards.`);
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
        this.cancelButton.destroy();
        this.unhighlightAllSelectedCards();
        this.enableOtherInteractions();
        this.cleanupCardInteractions();
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