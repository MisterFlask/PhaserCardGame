import Phaser from 'phaser';
import { PhysicalCard, CardLocation } from '../gamecharacters/PhysicalCard';
import { BaseCharacter, BaseCharacterClass, BlackhandClass, DiabolistClass } from '../gamecharacters/CharacterClasses';
import { CardGuiUtils } from '../utils/CardGuiUtils';
import { AbstractCard } from '../gamecharacters/PhysicalCard';
import GameImageLoader from '../utils/ImageUtils';

interface CardSlot {
    container: Phaser.GameObjects.Container;
    card: PhysicalCard | null;
    type: 'roster' | 'selected';
}

export default class CampaignScene extends Phaser.Scene {
    private cardSlots: CardSlot[] = [];
    private draggedCard: PhysicalCard | null = null;
    private deckDisplayCards: Phaser.GameObjects.Container[] = [];
    private deckDisplayY: number = 0;
    private rosterY: number = 0;
    private selectedY: number = 0;
    private embarkButton!: Phaser.GameObjects.Text;
    private debugGraphics!: Phaser.GameObjects.Graphics;

    constructor() {
        super('Campaign');
    }

    create() {
        this.createLayout();
        this.createCardSlots();
        this.createCharacterRoster();
        this.setupDragAndDrop();
        this.createEmbarkButton();
        this.createDeckDisplay();

        // Listen for resize events
        this.scale.on('resize', this.resize, this);
        this.createDebugGraphics();
        this.updateDebugGraphics();
        this.resize();
    }
    
    preload(): void {
        this.load.setBaseURL('https://raw.githubusercontent.com/');
        new GameImageLoader().loadAllImages(this.load);
    }

    createLayout() {
        const { width, height } = this.scale;
        this.rosterY = height * 0.1;
        this.deckDisplayY = height * 0.3;
        this.selectedY = height * 0.55;
    }

    resize() {
        const { width, height } = this.scale;

        // Update layout
        this.rosterY = height * 0.1;
        this.deckDisplayY = height * 0.3;
        this.selectedY = height * 0.55;

        // Reposition card slots
        this.cardSlots.forEach((slot, index) => {
            if (slot.type === 'roster') {
                slot.container.setPosition(width * (0.1 + index * 0.18), this.rosterY);
            } else if (slot.type === 'selected') {
                slot.container.setPosition(width * (0.1 + index * 0.1) + 40, this.selectedY);
            }

            console.log(`Slot ${index} (${slot.type}): x=${slot.container.x}, y=${slot.container.y}`);
        });

        // Reposition embark button
        this.embarkButton.setPosition(width * 0.95, height * 0.5);

        // Update deck display
        if (this.draggedCard && this.draggedCard.data instanceof BaseCharacter) {
            this.updateDeckDisplay(this.draggedCard.data.cardsInDeck);
        }
        this.updateDebugGraphics();

    }

    createCardSlots() {
        const { width } = this.scale;

        // Create roster slots
        for (let i = 0; i < 5; i++) {
            this.createSlot(width * (0.1 + i * 0.18), this.rosterY, 'roster');
        }

        // Create selected character slots
        for (let i = 0; i < 3; i++) {
            this.createSlot(width * (0.25 + i * 0.25), this.selectedY, 'selected');
        }
    }

    createSlot(x: number, y: number, type: 'roster' | 'selected') {
        const container = this.add.container(x, y);
        const background = this.add.image(0, 0, 'card_background').setOrigin(0.5);
        container.add(background);

        const slot: CardSlot = { container, card: null, type };
        this.cardSlots.push(slot);
    }

    createCharacterRoster() {
        const classes: BaseCharacterClass[] = [new DiabolistClass(), new BlackhandClass()];
        const rosterSlots = this.cardSlots.filter(slot => slot.type === 'roster');

        rosterSlots.forEach((slot, index) => {
            const randomClass = classes[Math.floor(Math.random() * classes.length)];
            const character = new BaseCharacter({ name: `Character ${index + 1} (${randomClass.name})`, portraitName: 'flamer1', characterClass: randomClass });
            character.cardsInDeck.push(...randomClass.availableCards);
            
            const card = new CardGuiUtils().createCard(this, 0, 0, character, CardLocation.BATTLEFIELD, () => {});
            this.addCardToSlot(card, slot);
            this.setupCardHover(card);
        });
    }

    addCardToSlot(card: PhysicalCard, slot: CardSlot) {
        slot.card = card;
        slot.container.add(card.container);
        card.container.setPosition(0, 0);
        this.input.setDraggable(card.container);
        (card.container as any).physicalCard = card;  // For easy reference during drag
    }

    setupDragAndDrop() {
        this.input.on('dragstart', this.onDragStart, this);
        this.input.on('drag', this.onDrag, this);
        this.input.on('dragend', this.onDragEnd, this);
    }

    onDragStart(pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.Container) {
        this.draggedCard = (gameObject as any).physicalCard;
        this.children.bringToTop(gameObject);
    }

    onDrag(pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.Container, dragX: number, dragY: number) {
        gameObject.x = dragX;
        gameObject.y = dragY;
    }

    setupPlayingCardEvents(card: PhysicalCard): void {
        card.container.on('pointerover', () => {
            card.descText.setVisible(true);
            card.descBackground.setVisible(true);
            card.tooltipText.setVisible(true);
            card.tooltipBackground.setVisible(true);
            card.container.setDepth(1000);
        });
        card.container.on('pointerout', () => {
            card.descText.setVisible(false);
            card.descBackground.setVisible(false);
            card.tooltipText.setVisible(false);
            card.tooltipBackground.setVisible(false);
            card.container.setDepth((card.container as any).originalDepth);
        });
    }

    onDragEnd(pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.Container) {
        const sourceSlot = this.findSlotWithCard(this.draggedCard!);
        const targetSlot = this.findNearestEmptySlot(gameObject);

        if (targetSlot && this.canMoveCardToSlot(sourceSlot, targetSlot)) {
            this.moveCardToSlot(this.draggedCard!, sourceSlot, targetSlot);
        } else {
            this.returnCardToSlot(this.draggedCard!, sourceSlot);
        }

        this.draggedCard = null;
    }

    findSlotWithCard(card: PhysicalCard): CardSlot | undefined {
        return this.cardSlots.find(slot => slot.card === card);
    }

    findNearestEmptySlot(gameObject: Phaser.GameObjects.Container): CardSlot | undefined {
        return this.cardSlots
            .filter(slot => !slot.card || slot.card === this.draggedCard)
            .sort((a, b) => {
                const distA = Phaser.Math.Distance.Between(gameObject.x, gameObject.y, a.container.x, a.container.y);
                const distB = Phaser.Math.Distance.Between(gameObject.x, gameObject.y, b.container.x, b.container.y);
                return distA - distB;
            })[0];
    }

    canMoveCardToSlot(sourceSlot: CardSlot | undefined, targetSlot: CardSlot): boolean {
        if (!sourceSlot || !targetSlot) return false;
        if (sourceSlot === targetSlot) return false;
        if (targetSlot.type === 'selected' && this.getSelectedCards().length >= 3) return false;
        return true;
    }

    moveCardToSlot(card: PhysicalCard, sourceSlot: CardSlot | undefined, targetSlot: CardSlot) {
        if (sourceSlot) sourceSlot.card = null;
        this.addCardToSlot(card, targetSlot);
    }
    
    returnCardToSlot(card: PhysicalCard, slot: CardSlot | undefined) {
        if (slot) {
            this.addCardToSlot(card, slot);
        }
    }

    getSelectedCards(): PhysicalCard[] {
        return this.cardSlots
            .filter(slot => slot.type === 'selected' && slot.card)
            .map(slot => slot.card!);
    }

    createEmbarkButton() {
        this.embarkButton = this.add.text(this.scale.width * 0.95, this.scale.height * 0.5, 'Embark!', {
            fontSize: '24px',
            color: '#ffffff',
            backgroundColor: '#4a4a4a',
            padding: { x: 10, y: 5 }
        })
        .setOrigin(0.5)
        .setAngle(-90)
        .setInteractive()
        .on('pointerdown', this.onEmbarkClicked, this);
    }

    onEmbarkClicked() {
        const selectedCards = this.getSelectedCards();
        if (selectedCards.length === 3) {
            console.log('Embarking on adventure with:', selectedCards.map(card => card.data.name));
            // Transition to the next scene or start the game
        } else {
            console.log('Please select 3 characters before embarking:', selectedCards.map(card => card.data.name));
        }
    }

    createDeckDisplay() {
        // Initially create an empty deck display
        this.updateDeckDisplay([]);
    }

    updateDeckDisplay(cards: AbstractCard[]) {
        // Clear existing deck display
        this.deckDisplayCards.forEach(card => card.destroy());
        this.deckDisplayCards = [];

        // Create new deck display
        const { width } = this.scale;
        const cardWidth = width * 0.1;
        const cardSpacing = width * 0.01;
        const startX = (width - (cards.length * (cardWidth + cardSpacing))) / 2;

        cards.forEach((card, index) => {
            const x = startX + index * (cardWidth + cardSpacing);
            const physicalCard = new CardGuiUtils().createCard(
                this, x, this.deckDisplayY, card, CardLocation.BATTLEFIELD, this.setupPlayingCardEvents);
            this.deckDisplayCards.push(physicalCard.container);
        });
    }

    setupCardHover(card: PhysicalCard) {
        card.container.setInteractive()
            .on('pointerover', () => {
                if (card.data instanceof BaseCharacter) {
                    this.updateDeckDisplay(card.data.cardsInDeck);
                }
            });
    }

    createDebugGraphics() {
        this.debugGraphics = this.add.graphics();
    }

    updateDebugGraphics() {
        this.debugGraphics.clear();
        this.debugGraphics.lineStyle(2, 0xff0000);
        
        this.cardSlots.forEach(slot => {
            this.debugGraphics.strokeRect(
                slot.container.x - 50, 
                slot.container.y - 70, 
                100, 
                140
            );
        });
    }
}
