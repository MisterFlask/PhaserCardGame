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

    constructor() {
        super('Campaign');
    }

    create() {
        this.createCardSlots();
        this.createCharacterRoster();
        this.setupDragAndDrop();
        this.createEmbarkButton();
        this.createDeckDisplay();
    }
    
    preload(): void {
        this.load.setBaseURL('https://raw.githubusercontent.com/');
        new GameImageLoader().loadAllImages(this.load);
    }

    createCardSlots() {
        const rosterY = 120;
        this.deckDisplayY = this.scale.height / 2;
        const selectedY = this.scale.height - 80;

        // Create roster slots
        for (let i = 0; i < 5; i++) {
            this.createSlot(100 + i * 150, rosterY, 'roster');
        }

        // Create selected character slots
        for (let i = 0; i < 3; i++) {
            this.createSlot(100 + i * 250, selectedY, 'selected');
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
        const embarkButton = this.add.text(this.scale.width - 100, this.scale.height / 2, 'Embark!', {
            fontSize: '24px',
            color: '#ffffff',
            backgroundColor: '#4a4a4a',
            padding: { x: 10, y: 5 }
        })
        .setOrigin(0.5)
        .setAngle(90)
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
        const cardWidth = 100;
        const cardSpacing = 10;
        const startX = (this.scale.width - (cards.length * (cardWidth + cardSpacing))) / 2;

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
}
