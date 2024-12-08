import { Scene } from 'phaser';
import { AbstractCard } from '../../gamecharacters/AbstractCard';
import { PlayerCharacter } from '../../gamecharacters/BaseCharacterClass';
import { PlayableCard } from '../../gamecharacters/PlayableCard';
import { GameState } from '../../rules/GameState';
import { TextBoxButton } from '../../ui/Button';
import { PhysicalCard } from '../../ui/PhysicalCard';
import { UIContext, UIContextManager } from '../../ui/UIContextManager';
import { CardGuiUtils } from '../../utils/CardGuiUtils';

export class CharacterDeckOverlay extends Phaser.GameObjects.Container {
    protected staticContainer: Phaser.GameObjects.Container;
    protected background: Phaser.GameObjects.Rectangle;
    protected cards: PhysicalCard[] = [];
    protected closeButton: TextBoxButton;
    protected submitButton: TextBoxButton | null = null;
    protected scrollableArea: Phaser.GameObjects.Container;
    protected maskGraphics: Phaser.GameObjects.Graphics;

    protected readonly CARDS_PER_ROW = 8;
    protected readonly CARD_SPACING = 220;
    protected readonly CARD_SCALE = 1.2;

    // New fields for selection mode
    protected selectionMode: boolean = false;
    protected selectedCard: PhysicalCard | null = null;
    protected selectionCallback: ((card: PlayableCard) => void) | null = null;

    constructor(scene: Scene) {
        super(scene, scene.scale.width / 2, scene.scale.height / 2);
        scene.add.existing(this);

        this.setDepth(1000);

        // Create a static container for non-scrolling elements
        this.staticContainer = scene.add.container(0, 0);
        this.add(this.staticContainer);

        // Create semi-transparent background
        this.background = scene.add.rectangle(
            0, 0,
            scene.scale.width,
            scene.scale.height,
            0x000000,
            0.8
        );
        this.background.setOrigin(0.5);
        this.staticContainer.add(this.background);

        // Create scrollable area container
        this.scrollableArea = scene.add.container(0, 0);
        this.add(this.scrollableArea);

        // Create mask for scrollable area
        this.maskGraphics = scene.add.graphics();
        this.updateMask();
        this.maskGraphics.setVisible(false);
        this.staticContainer.add(this.maskGraphics);

        // Create close button
        this.closeButton = new TextBoxButton({
            scene: scene,
            x: (this.background.width / 2) - 100,
            y: -(this.background.height / 2) + 50,
            width: 80,
            height: 40,
            text: 'Close',
            style: { fontSize: '20px' },
            textBoxName: 'closeCharacterDeck',
            fillColor: 0x555555
        });
        this.closeButton.onClick(() => this.handleClose());
        this.staticContainer.add(this.closeButton);

        // Hide by default
        this.hide();

        // Add scroll wheel listener
        this.scene.input.on('wheel', (pointer: Phaser.Input.Pointer, gameObjects: any, deltaX: number, deltaY: number) => {
            if (this.visible) {
                pointer.event.preventDefault();
                pointer.event.stopPropagation();
                this.scrollableArea.y -= deltaY;
                this.clampScroll();
            }
        });
    }

    private updateMask(): void {
        this.maskGraphics.clear();
        this.maskGraphics.fillStyle(0xffffff);
        this.maskGraphics.fillRect(
            100,
            100,
            this.scene.scale.width - 200,
            this.scene.scale.height - 200
        );

        const mask = new Phaser.Display.Masks.GeometryMask(this.scene, this.maskGraphics);
        this.scrollableArea.setMask(mask);
    }

    private clampScroll(): void {
        const maxScroll = Math.max(0, this.scrollableArea.height - (this.scene.scale.height - 200));
        this.scrollableArea.y = Phaser.Math.Clamp(
            this.scrollableArea.y,
            -maxScroll,
            0
        );
    }

    /**
     * Show the deck overlay with standard viewing mode.
     */
    public show(character: PlayerCharacter): void {
        this.selectionMode = false;
        this.hideSubmitButton();
        const characterCards = GameState.getInstance().getCardsOwnedByCharacter(character);
        this.showCards(characterCards);
    }

    public showCardInDrawPile(): void {
        this.selectionMode = false;
        this.hideSubmitButton();
        this.showCards(GameState.getInstance().combatState.drawPile);
    }

    public showCardInDiscardPile(): void {
        this.selectionMode = false;
        this.hideSubmitButton();
        this.showCards(GameState.getInstance().combatState.currentDiscardPile);
    }

    public showCardInExhaustPile(): void {
        this.selectionMode = false;
        this.hideSubmitButton();
        this.showCards(GameState.getInstance().combatState.currentExhaustPile);
    }

    /**
     * Show the overlay in selection mode. The user must select a card and then submit.
     * @param cards The cards to display
     * @param callback A callback that receives the selected card once the user submits
     */
    public showCardsWithSelection(cards: readonly PlayableCard[], callback: (card: PlayableCard) => void): void {
        this.selectionMode = true;
        this.selectionCallback = callback;
        this.showCards(cards.slice());
        this.showSubmitButton();
    }

    public showCards(cards: PlayableCard[]): void {
        UIContextManager.getInstance().setContext(UIContext.CHARACTER_DECK_SHOWN);
        this.cards.forEach(card => card.obliterate());
        this.cards = [];

        // Reset scroll position
        this.scrollableArea.setPosition(0, 0);

        // Define margins to start grid near the upper-left
        const marginX = -this.background.width / 2 + 50;
        const marginY = -this.background.height / 2 + 150;

        cards.forEach((card: AbstractCard, index: number) => {
            const row = Math.floor(index / this.CARDS_PER_ROW);
            const col = index % this.CARDS_PER_ROW;

            const x = marginX + col * this.CARD_SPACING + this.CARD_SPACING / 2;
            const y = marginY + row * this.CARD_SPACING + this.CARD_SPACING / 2;

            const physicalCard = CardGuiUtils.getInstance().createCard({
                scene: this.scene,
                x: x,
                y: y,
                data: card,
                onCardCreatedEventCallback: (createdCard: PhysicalCard) => {
                    createdCard.container.scale = this.CARD_SCALE;
                    this.scrollableArea.add(createdCard.container);

                    // If in selection mode, add a click listener to allow selection
                    if (this.selectionMode) {
                        createdCard.container.setInteractive({ useHandCursor: true });
                        createdCard.container.on('pointerdown', () => {
                            this.handleCardSelection(createdCard);
                        });
                    }
                }
            });

            this.cards.push(physicalCard);
        });

        this.setVisible(true);
    }

    public hide(): void {
        UIContextManager.getInstance().setContext(UIContext.COMBAT);
        this.setVisible(false);
    }

    public resize(): void {
        // Update container position
        this.setPosition(this.scene.scale.width / 2, this.scene.scale.height / 2);

        // Update background size
        this.background.setSize(this.scene.scale.width, this.scene.scale.height);

        // Update close button position
        this.closeButton.setPosition(
            (this.background.width / 2) - 100,
            -(this.background.height / 2) + 50
        );

        // If submitButton exists, reposition it as well
        if (this.submitButton) {
            this.submitButton.setPosition(
                (this.background.width / 2) - 200,
                -(this.background.height / 2) + 50
            );
        }

        // Reset scroll position
        this.scrollableArea.setPosition(0, 0);

        // Update mask dimensions
        this.updateMask();
    }

    protected handleClose(): void {
        // If in selection mode, user might be canceling the selection
        // We could optionally call the callback with null or do nothing.
        // For now, just close normally.
        this.selectionMode = false;
        this.selectedCard = null;
        this.selectionCallback = null;
        this.hideSubmitButton();
        this.hide();
    }

    protected showSubmitButton(): void {
        if (!this.submitButton) {
            this.submitButton = new TextBoxButton({
                scene: this.scene,
                x: (this.background.width / 2) - 200,
                y: -(this.background.height / 2) + 50,
                width: 80,
                height: 40,
                text: 'Submit',
                style: { fontSize: '20px' },
                textBoxName: 'submitSelection',
                fillColor: 0x555555
            });
            this.submitButton.onClick(() => this.handleSubmit());
            this.staticContainer.add(this.submitButton);
        }

        this.submitButton.setVisible(true);
    }

    protected hideSubmitButton(): void {
        if (this.submitButton) {
            this.submitButton.setVisible(false);
        }
    }

    protected handleCardSelection(card: PhysicalCard): void {
        // If another card was selected, remove its highlight
        if (this.selectedCard && this.selectedCard !== card) {
            this.unhighlightCard(this.selectedCard);
        }

        this.selectedCard = card;
        this.highlightCard(card);
    }

    protected highlightCard(card: PhysicalCard): void {
        // Assume we have a method to highlight a card (e.g., apply a tint or glow)
        // For example:
        card.setGlow(true)
    }

    protected unhighlightCard(card: PhysicalCard): void {
        // Remove highlight
        card.setGlow(false);
    }

    protected handleSubmit(): void {
        if (this.selectionMode && this.selectedCard && this.selectionCallback) {
            // Invoke the callback with the selected card data
            this.selectionCallback(this.selectedCard.data as PlayableCard);
            this.selectionMode = false;
            this.hideSubmitButton();
            this.hide();
        } else {
            // If no card is selected, you could give feedback or do nothing.
        }
    }
}
