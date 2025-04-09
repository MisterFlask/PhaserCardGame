import { Scene } from 'phaser';
import { PlayableCard } from '../gamecharacters/PlayableCard';
import { CardGuiUtils } from '../utils/CardGuiUtils';
import { TextBoxButton } from './Button';
import { PhysicalCard } from './PhysicalCard';
import { UIContext, UIContextManager } from './UIContextManager';

export class CardSelectionFromCustomPoolOverlay extends Phaser.GameObjects.Container {
    protected staticContainer!: Phaser.GameObjects.Container;
    protected background!: Phaser.GameObjects.Rectangle;
    protected cards: PhysicalCard[] = [];
    protected closeButton!: TextBoxButton;
    protected submitButton!: TextBoxButton;
    protected scrollableArea!: Phaser.GameObjects.Container;
    protected maskGraphics!: Phaser.GameObjects.Graphics;
    protected instructionsText!: Phaser.GameObjects.Text;
    protected selectionCountText!: Phaser.GameObjects.Text;

    protected readonly CARDS_PER_ROW = 8;
    protected readonly CARD_SPACING = 220;
    protected readonly CARD_SCALE = 1.2;

    protected selectedCards: Set<PhysicalCard> = new Set();
    protected minSelection: number = 1;
    protected maxSelection: number = 1;
    protected callback: ((cards: PlayableCard[]) => void) | null = null;

    constructor(scene: Scene) {
        super(scene, scene.scale.width / 2, scene.scale.height / 2);
        scene.add.existing(this);
        this.setDepth(1000);

        // Create containers and background
        this.initializeContainers();
        this.createBackground();
        this.createScrollableArea();
        this.createButtons();
        
        // Add scroll wheel listener
        this.setupScrolling();
        
        this.hide();
    }

    private initializeContainers(): void {
        this.staticContainer = this.scene.add.container(0, 0);
        this.add(this.staticContainer);
        
        this.scrollableArea = this.scene.add.container(0, 0);
        this.add(this.scrollableArea);
    }

    private createBackground(): void {
        this.background = this.scene.add.rectangle(
            0, 0,
            this.scene.scale.width,
            this.scene.scale.height,
            0x000000,
            0.8
        );
        this.background.setOrigin(0.5);
        this.staticContainer.add(this.background);
    }

    private createScrollableArea(): void {
        this.maskGraphics = this.scene.add.graphics();
        this.updateMask();
        this.maskGraphics.setVisible(false);
        this.staticContainer.add(this.maskGraphics);
    }

    private createButtons(): void {
        // Create close button
        this.closeButton = new TextBoxButton({
            scene: this.scene,
            x: (this.background.width / 2) - 100,
            y: -(this.background.height / 2) + 50,
            width: 80,
            height: 40,
            text: 'Cancel',
            style: { fontSize: '20px' },
            textBoxName: 'closeSelection',
            fillColor: 0x555555
        });
        this.closeButton.onClick(() => this.handleClose());
        this.staticContainer.add(this.closeButton);

        // Create submit button
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
        this.submitButton.setVisible(false); // Hide initially until valid selection
    }

    public showCardsWithSelection(
        cards: PlayableCard[],
        instructions: string,
        min: number,
        max: number,
        callback: (cards: PlayableCard[]) => void,
        cancellable: boolean = true
    ): void {
        UIContextManager.getInstance().pushContext(UIContext.CARD_SELECTION_FROM_CUSTOM_POOL);
        this.minSelection = min;
        this.maxSelection = max;
        this.callback = callback;
        this.selectedCards.clear();
        
        // Create or update instructions text
        if (this.instructionsText) {
            this.instructionsText.destroy();
        }
        this.instructionsText = this.scene.add.text(
            0, -this.background.height / 2 + 100,
            instructions,
            { fontSize: '24px', color: '#ffffff', align: 'center' }
        );
        this.instructionsText.setOrigin(0.5);
        this.staticContainer.add(this.instructionsText);

        // Create or update selection count text
        if (this.selectionCountText) {
            this.selectionCountText.destroy();
        }
        this.selectionCountText = this.scene.add.text(
            0, -this.background.height / 2 + 150,
            `Select ${min} to ${max} cards (0 selected)`,
            { fontSize: '20px', color: '#ffffff', align: 'center' }
        );
        this.selectionCountText.setOrigin(0.5);
        this.staticContainer.add(this.selectionCountText);

        this.closeButton.setVisible(cancellable);
        this.showCards(cards);
        this.setVisible(true);
    }

    private showCards(cards: PlayableCard[]): void {
        this.cards.forEach(card => card.obliterate());
        this.cards = [];

        // Reset scroll position
        this.scrollableArea.setPosition(0, 0);

        const marginX = -this.background.width / 2 + 50;
        const marginY = -this.background.height / 2 + 200;

        cards.forEach((card: PlayableCard, index: number) => {
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
                    createdCard.container.setInteractive({ useHandCursor: true });
                    createdCard.container.on('pointerdown', () => {
                        this.handleCardSelection(createdCard);
                    });
                }
            });

            this.cards.push(physicalCard);
        });
    }

    private handleCardSelection(card: PhysicalCard): void {
        if (this.selectedCards.has(card)) {
            // Deselect the card
            this.selectedCards.delete(card);
            card.setGlow(false);
            card.isSelected = false;
        } else if (this.selectedCards.size < this.maxSelection) {
            // Select the card
            this.selectedCards.add(card);
            card.setGlow(true);
            card.glowColor = 0x00ff00; // Green glow for selected cards
            card.isSelected = true;
        }

        this.updateSelectionCountText();
        this.updateSubmitButtonState();
    }

    private updateSelectionCountText(): void {
        this.selectionCountText.setText(
            `Select ${this.minSelection} to ${this.maxSelection} cards (${this.selectedCards.size} selected)`
        );
    }

    private updateSubmitButtonState(): void {
        const isValidSelection = this.selectedCards.size >= this.minSelection && 
                               this.selectedCards.size <= this.maxSelection;
        this.submitButton.setVisible(isValidSelection);
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

    private setupScrolling(): void {
        this.scene.input.on('wheel', (pointer: Phaser.Input.Pointer, gameObjects: any, deltaX: number, deltaY: number) => {
            if (this.visible) {
                pointer.event.preventDefault();
                this.scrollableArea.y -= deltaY;
                this.clampScroll();
            }
        });
    }

    private clampScroll(): void {
        const maxScroll = Math.max(0, this.scrollableArea.height - (this.scene.scale.height - 200));
        this.scrollableArea.y = Phaser.Math.Clamp(
            this.scrollableArea.y,
            -maxScroll,
            0
        );
    }

    private handleSubmit(): void {
        if (this.callback && this.selectedCards.size >= this.minSelection) {
            const selectedCards = Array.from(this.selectedCards).map(pc => pc.data as PlayableCard);
            this.callback(selectedCards);
        }
        this.hide();
    }

    private handleClose(): void {
        if (this.callback) {
            this.callback([]);
        }
        
        this.hide();
    }

    public hide(): void {
        UIContextManager.getInstance().popContext();
        this.setVisible(false);
        // Clean up selections
        this.selectedCards.forEach(card => {
            card.setGlow(false);
            card.isSelected = false;
        });
        this.selectedCards.clear();
    }

    public resize(): void {
        // Update container position
        this.setPosition(this.scene.scale.width / 2, this.scene.scale.height / 2);

        // Update background size
        this.background.setSize(this.scene.scale.width, this.scene.scale.height);

        // Update button positions
        this.closeButton.setPosition(
            (this.background.width / 2) - 100,
            -(this.background.height / 2) + 50
        );
        this.submitButton.setPosition(
            (this.background.width / 2) - 200,
            -(this.background.height / 2) + 50
        );

        // Update text positions
        if (this.instructionsText) {
            this.instructionsText.setPosition(0, -this.background.height / 2 + 100);
        }
        if (this.selectionCountText) {
            this.selectionCountText.setPosition(0, -this.background.height / 2 + 150);
        }

        // Reset scroll position and update mask
        this.scrollableArea.setPosition(0, 0);
        this.updateMask();
    }
} 