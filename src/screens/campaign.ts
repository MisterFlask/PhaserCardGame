import Phaser from 'phaser';
import { PhysicalCard, CardScreenLocation, CardType } from '../gamecharacters/PhysicalCard';
import { BaseCharacter, BaseCharacterClass, BlackhandClass, DiabolistClass, PlayerCharacter } from '../gamecharacters/CharacterClasses';
import { CardGuiUtils } from '../utils/CardGuiUtils';
import { AbstractCard } from '../gamecharacters/PhysicalCard';
import GameImageLoader from '../utils/ImageUtils';
import { GameAction } from '../utils/ActionQueue';
import { GameState } from './gamestate';

export class StoreCard extends AbstractCard {
    price: number;

    constructor({ name, description, portraitName, tooltip, price }: { name: string; description: string; portraitName?: string, tooltip?: string, price: number}) {
        super(
            {
                name: name,
                description: description,
                portraitName: portraitName,
                cardType: CardType.STORE,
                tooltip: tooltip
            }
        );
        this.price = price;
    }
    
    OnPurchase(): void {
        console.log('Item purchased');
    }

    OnCombatStart(): GameAction[] {
        console.log('Combat started');
        return [];
    }
}

interface CardSlot {
    container: Phaser.GameObjects.Container;
    card: PhysicalCard | null;
    type: 'roster' | 'selected' | 'deck' | 'shop';
}

export default class CampaignScene extends Phaser.Scene {
    private cardSlots: CardSlot[] = [];
    private draggedCard: PhysicalCard | null = null;
    private deckDisplayCards: PhysicalCard[] = [];
    private shopCards: PhysicalCard[] = [];
    private deckDisplayY: number = 0;
    private shopY: number = 0;
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
        this.createShop();

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
        this.shopY = height * 0.5;
        this.selectedY = height * 0.85;
    }

    resize() {
        const { width, height } = this.scale;

        // Update layout
        this.rosterY = height * 0.1;
        this.deckDisplayY = height * 0.3;
        this.shopY = height * 0.5;
        this.selectedY = height * 0.85;

        // Reposition card slots
        this.cardSlots.forEach((slot, index) => {
            if (slot.type === 'roster') {
                slot.container.setPosition(width * (0.1 + index * 0.18), this.rosterY);
            } else if (slot.type === 'selected') {
                slot.container.setPosition(width * (0.1 + index * 0.1), this.selectedY);
            } else if (slot.type === 'deck') {
                const cardWidth = width * 0.1;
                const cardSpacing = width * 0.01;
                const startX = (width - (this.deckDisplayCards.length * (cardWidth + cardSpacing))) / 2;
                slot.container.setPosition(startX + index * (cardWidth + cardSpacing), this.deckDisplayY);
            } else if (slot.type === 'shop') {
                const cardWidth = width * 0.1;
                const cardSpacing = width * 0.01;
                const startX = (width - (this.shopCards.length * (cardWidth + cardSpacing))) / 2;
                slot.container.setPosition(startX + index * (cardWidth + cardSpacing), this.shopY);
            }

            console.log(`Slot ${index} (${slot.type}): x=${slot.container.x}, y=${slot.container.y}`);
        });

        // Reposition embark button
        this.embarkButton.setPosition(width * 0.95, height * 0.5);

        // Update deck display
        if (this.draggedCard && this.draggedCard.data instanceof PlayerCharacter) {
            this.updateDeckDisplay(this.draggedCard.data.cardsInDeck);
        }

        // Update shop cards
        this.positionShopCards(this.shopCards.map(card => card.data as StoreCard));

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

    createSlot(x: number, y: number, type: 'roster' | 'selected' | 'deck' | 'shop') {
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
            const character = new PlayerCharacter({ name: `Character ${index + 1} (${randomClass.name})`, portraitName: 'flamer1', characterClass: randomClass });
            character.cardsInDeck.push(...randomClass.availableCards);
            
            const card = new CardGuiUtils().createCard({
                scene: this,
                x: 0,
                y: 0,
                data: character,
                location: CardScreenLocation.BATTLEFIELD,
                eventCallback: () => {}
            });
            this.addCardToSlot(card, slot);
            this.setupCardHover(card);
        });
    }

    addCardToSlot(card: PhysicalCard, slot: CardSlot) {
        slot.card = card;
        slot.container.add(card.container);
        card.container.setPosition(0, 0);
        var draggableCard = (slot.type === 'roster' || slot.type === 'selected')

        
        this.input.setDraggable(card.container, draggableCard);
    
        (card.container as any).physicalCard = card;  // For easy reference during drag
        this.setupCardEvents(card);
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

    setupCardEvents(card: PhysicalCard): void {
        card.container.setInteractive()
            .on('pointerover', () => {
                card.container.setScale(1.1);
            })
            .on('pointerout', () => {
                card.container.setScale(1);
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
            .filter(slot => (!slot.card || slot.card === this.draggedCard) && (slot.type === 'roster' || slot.type === 'selected'))
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
        return (targetSlot.type === 'roster' || targetSlot.type === 'selected');
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
        const selectedShopCards = this.shopCards.filter(card => card.container.getData('isSelected'));
        if (selectedCards.length === 3) {
            console.log('Embarking on adventure with:', selectedCards.map(card => card.data.name));
            console.log('Purchased items:', selectedShopCards.map(card => card.data.name));
            // Update the GameState with selected characters and purchased items
            const gameState = GameState.getInstance();
            
            // Clear current run characters and add selected characters
            gameState.currentRunCharacters = [];
            selectedCards.forEach(card => {
                if (card.data instanceof BaseCharacter) {
                    gameState.addToCurrentRun(card.data);
                }
            });

            // Add purchased items to inventory
            selectedShopCards.forEach(card => {
                if (card.data instanceof StoreCard) {
                    gameState.addToInventory(card.data);
                }
            });

            // Remove purchased items from shop
            gameState.setShopItems(gameState.getShopItems().filter(item => !selectedShopCards.some(card => card.data === item)));

            console.log('Updated GameState:', gameState);
            // Transition to the next scene or start the game

            // Switch to the "map" scene
            this.scene.start('MapScene');
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

        // Remove existing deck slots
        this.cardSlots = this.cardSlots.filter(slot => slot.type !== 'deck');

        // Create new deck display
        const { width } = this.scale;
        const cardWidth = width * 0.1;
        const cardSpacing = width * 0.01;
        const startX = (width - (cards.length * (cardWidth + cardSpacing))) / 2;

        cards.forEach((card, index) => {
            const x = startX + index * (cardWidth + cardSpacing);
            const physicalCard = new CardGuiUtils().createCard({
                scene: this,
                x: x,
                y: this.deckDisplayY,
                data: card,
                location: CardScreenLocation.BATTLEFIELD,
                eventCallback: this.setupCardEvents
            });
            this.deckDisplayCards.push(physicalCard);
            
            // Create a new slot for this deck card
            this.createSlot(x, this.deckDisplayY, 'deck');
            const slot = this.cardSlots[this.cardSlots.length - 1];
            this.addCardToSlot(physicalCard, slot);
        });
    }

    setupCardHover(card: PhysicalCard) {
        card.container.setInteractive()
            .on('pointerover', () => {
                if (card.data instanceof PlayerCharacter) {
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

    createShop() {
        const shopItems = [
            new StoreCard({ name: 'Cargo', description: 'Increases carrying capacity', portraitName: '', tooltip: 'Carry more items', price: 100 }),
            new StoreCard({ name: 'Medkit', description: 'Restores health', portraitName: '', tooltip: 'Heal your character', price: 50 }),
            new StoreCard({ name: 'Ammo Pack', description: 'Replenishes ammunition', portraitName: '', tooltip: 'Refill your ammo', price: 75 })
        ];

        this.positionShopCards(shopItems);
    }

    positionShopCards(shopItems: StoreCard[]) {
        // Clear existing shop cards and slots
        this.shopCards.forEach(card => card.destroy());
        this.shopCards = [];
        this.cardSlots = this.cardSlots.filter(slot => slot.type !== 'shop');

        const { width } = this.scale;
        const cardWidth = width * 0.1;
        const cardSpacing = width * 0.01;
        const startX = (width - (shopItems.length * (cardWidth + cardSpacing))) / 2;
        shopItems.forEach((item, index) => {
            const x = startX + index * (cardWidth + cardSpacing);
            const physicalCard = new CardGuiUtils().createCard({
                scene: this,
                x: x,
                y: this.shopY,
                data: item,
                location: CardScreenLocation.SHOP,
                eventCallback: (card) => this.setupShopCardEvents(card)
            });
            this.shopCards.push(physicalCard);
            // Create a new slot for this shop card
            this.createSlot(x, this.shopY, 'shop');
            const slot = this.cardSlots[this.cardSlots.length - 1];
            this.addCardToSlot(physicalCard, slot);
        });
    }
    
    setupShopCardEvents(card: PhysicalCard): void {
        card.container.setInteractive()
            .on('pointerover', () => {
                card.container.setScale(1.1);
            })
            .on('pointerout', () => {
                card.container.setScale(1);
            })
            .on('pointerdown', () => {
                this.toggleCardSelection(card);
            });
    }

 toggleCardSelection(card: PhysicalCard): void {
        const isAlreadySelected = card.container.getData('isSelected');
        card.container.setData('isSelected', !isAlreadySelected);
        
        if (!isAlreadySelected) {
            // Create a selection border if it doesn't exist
            if (!card.container.getData('selectionBorder')) {
                const border = this.add.graphics();
                border.lineStyle(2, 0xffff00);
                border.strokeRect(-card.container.width / 2, -card.container.height / 2, card.container.width, card.container.height);
                card.container.add(border);
                card.container.setData('selectionBorder', border);
            } else {
                // Show existing border
                card.container.getData('selectionBorder').setVisible(true);
            }
        } else {
            // Hide the selection border
            const border = card.container.getData('selectionBorder');
            if (border) {
                border.setVisible(false);
            }
        }
    }
}
