import { Scene } from 'phaser';
import { PlayerCharacter } from '../../gamecharacters/BaseCharacterClass';
import { PlayableCard } from '../../gamecharacters/PlayableCard';
import { GameState } from '../../rules/GameState';
import { TextBoxButton } from '../../ui/Button';
import { PhysicalCard } from '../../ui/PhysicalCard';
import { UIContext, UIContextManager } from '../../ui/UIContextManager';
import { CardGuiUtils } from '../../utils/CardGuiUtils';

export class CharacterDeckOverlay extends Phaser.GameObjects.Container {
    private background: Phaser.GameObjects.Rectangle;
    private cards: PhysicalCard[] = [];
    private closeButton: TextBoxButton;
    private scrollableArea: Phaser.GameObjects.Container;
    private maskGraphics: Phaser.GameObjects.Graphics;
    
    private readonly CARDS_PER_ROW = 8;
    private readonly CARD_SPACING = 220;
    private readonly CARD_SCALE = 1.2;

    constructor(scene: Scene) {
        super(scene, scene.scale.width / 2, scene.scale.height / 2);
        scene.add.existing(this);
        
        this.setDepth(1000);
        
        // Create semi-transparent background
        this.background = scene.add.rectangle(
            0, 0,
            scene.scale.width,
            scene.scale.height,
            0x000000,
            0.8
        );
        this.background.setOrigin(0.5);
        this.add(this.background);
        
        // Create scrollable area container
        this.scrollableArea = scene.add.container(0, 0);
        this.add(this.scrollableArea);
        
        // Create mask for scrollable area
        this.maskGraphics = scene.add.graphics();
        this.updateMask();
        this.maskGraphics.setVisible(false); // Hide the mask graphics
        this.add(this.maskGraphics); // Ensure maskGraphics is part of the container
        
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
        this.closeButton.onClick(() => this.hide());
        this.add(this.closeButton);
        
        // Hide by default
        this.hide();
        
        // Add scroll wheel listener
        this.scene.input.on('wheel', (pointer: Phaser.Input.Pointer, gameObjects: any, deltaX: number, deltaY: number) => {
            if (this.visible) {
                // Prevent default scrolling
                pointer.event.preventDefault();
                
                // Stop event propagation
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
        // No need to set visibility here since it's handled in the constructor
    }

    private clampScroll(): void {
        const maxScroll = Math.max(0, this.scrollableArea.height - (this.scene.scale.height - 200));
        this.scrollableArea.y = Phaser.Math.Clamp(
            this.scrollableArea.y,
            -maxScroll,
            0
        );
    }

    public show(character: PlayerCharacter): void {
        // Clear existing cards
        UIContextManager.getInstance().setContext(UIContext.CHARACTER_DECK_SHOWN);
        this.cards.forEach(card => card.obliterate());
        this.cards = [];
        
        // Get all cards owned by this character
        const characterCards = GameState.getInstance().getCardsOwnedByCharacter(character)
        
        // Define margins to start grid near the upper-left
        const marginX = -this.background.width / 2 + 50;
        const marginY = -this.background.height / 2 + 150;
        
        // Create physical cards and arrange them in a grid
        characterCards.forEach((card: PlayableCard, index: number) => {
            const row = Math.floor(index / this.CARDS_PER_ROW);
            const col = index % this.CARDS_PER_ROW;
            
            const x = marginX + col * this.CARD_SPACING + this.CARD_SPACING / 2;
            const y = marginY + row * this.CARD_SPACING + this.CARD_SPACING / 2;

            const physicalCard = CardGuiUtils.getInstance().createCard({
                scene: this.scene,
                x: x,
                y: y,
                data: card,
                onCardCreatedEventCallback: (card: PhysicalCard) => {
                    card.container.scale = this.CARD_SCALE;
                    this.scrollableArea.add(card.container);
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

        // Update mask dimensions
        this.updateMask();
    }
} 