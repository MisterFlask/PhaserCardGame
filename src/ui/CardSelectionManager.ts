import Phaser from 'phaser';
import CombatUiManager from '../screens/subcomponents/CombatUiManager';
import { PlayableCard } from '../gamecharacters/PlayableCard';
import { TextBox } from './TextBox';
import Menu from './Menu';

interface CardSelectionParams {
    scene: Phaser.Scene;
    action: (selectedCards: PlayableCard[]) => void;
    name: string;
    instructions: string;
    min: number;
    max: number;
}

class CardSelectionManager {
    private scene: Phaser.Scene;
    private action: (selectedCards: PlayableCard[]) => void;
    private name: string;
    private instructions: string;
    private min: number;
    private max: number;
    private selectedCards: Set<PlayableCard> = new Set();
    private instructionsBox!: TextBox;
    private submitButton!: TextBox;
    private overlay!: Phaser.GameObjects.Rectangle;

    constructor(params: CardSelectionParams) {
        this.scene = params.scene;
        this.action = params.action;
        this.name = params.name;
        this.instructions = params.instructions;
        this.min = params.min;
        this.max = params.max;
    }

    public start(): void {
        this.createOverlay();
        this.createInstructions();
        this.createSubmitButton();
        this.setupCardInteractions();
        this.disableOtherInteractions();
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
            x: this.scene.scale.width / 2,
            y: this.scene.scale.height - 100,
            width: 200,
            height: 50,
            text: 'Submit',
            style: { fontSize: '28px', color: '#ffffff' },
            fillColor: 0x555555,
            textBoxName: 'CardSelectionSubmitButton'
        });

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
        const combatUiManager = CombatUiManager.getInstance();
        const handCards = combatUiManager.getPlayerHandCards(); // Assumes a method to get player's hand cards

        handCards.forEach(card => {
            card.physicalCard?.container.setInteractive()
                .on('pointerdown', () => this.toggleCardSelection(card as PlayableCard));
        });
    }

    private toggleCardSelection(card: PlayableCard): void {
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

    private disableOtherInteractions(): void {
        const combatUiManager = CombatUiManager.getInstance();
        combatUiManager.disableInteractions();
    }

    private enableOtherInteractions(): void {
        const combatUiManager = CombatUiManager.getInstance();
        combatUiManager.enableInteractions();
    }

    private exitSelectionMode(): void {
        this.overlay.destroy();
        this.instructionsBox.destroy();
        this.submitButton.destroy();
        this.unhighlightAllSelectedCards();
        this.enableOtherInteractions();
        this.cleanupCardInteractions();
    }

    private unhighlightAllSelectedCards(): void {
        this.selectedCards.forEach(card => card.unhighlight());
        this.selectedCards.clear();
    }

    private cleanupCardInteractions(): void {
        const combatUiManager = CombatUiManager.getInstance();
        const handCards = combatUiManager.getPlayerHandCards();

        handCards.forEach(card => {
            card.physicalCard?.container.off('pointerdown', this.toggleCardSelection, this);
        });
    }
}

export default CardSelectionManager;