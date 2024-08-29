import Phaser from 'phaser';
import GameImageLoader from '../utils/ImageUtils';
import { ArcaneRitualCard,  FireballCard, GoblinCharacter, PlayerCharacter, SummonDemonCard, ToxicCloudCard } from '../gamecharacters/CharacterClasses';
import { AbstractCard, CardType, PhysicalCard, CardScreenLocation, TextBox } from '../gamecharacters/PhysicalCard';
import { CardGuiUtils } from '../utils/CardGuiUtils';
import CampaignScene from './campaign';
import MapScene from './map';
import { EncounterData } from '../encounters/encounters';
import { BattleCardLocation, GameState } from './gamestate';
import { DeckLogic } from '../rules/decklogic';


const config = {
    battlefieldY: 200,
    handY: 500,
    dividerY: 350,
    gameWidth: 800,
    gameHeight: 600,
    pileY: 550  // Increased to be below the hand
};

class CombatScene extends Phaser.Scene {
    private playerHand: PhysicalCard[];
    private enemyUnits: PhysicalCard[];
    private playerUnits: PhysicalCard[];
    private backgroundImage!: Phaser.GameObjects.Image;
    private battlefieldArea!: Phaser.GameObjects.Rectangle;
    private handArea!: Phaser.GameObjects.Rectangle;
    private highlightedCard: PhysicalCard | null;
    private draggedCard: PhysicalCard | null;
    private menuButton!: Phaser.GameObjects.Text;
    private menuPanel!: Phaser.GameObjects.Container;
    private drawPile: PhysicalCard | null;
    private discardPile: PhysicalCard | null;
    private encounter!: EncounterData;
    private combatStatusText!: TextBox;
    private lastPerformanceLog: number = 0;
    private frameCount: number = 0;
    private endTurnButton!: TextBox;
    
    constructor() {
        super('CombatScene');
        this.playerHand = [];
        this.enemyUnits = [];
        this.playerUnits = [];
        this.highlightedCard = null;
        this.draggedCard = null;
        this.drawPile = null;
        this.discardPile = null;
    }

    init(data: { encounter: EncounterData }) {
        this.encounter = data.encounter;
        game.events.on('debug', console.log);

        GameState.getInstance().combatState.currentHand = []
        GameState.getInstance().combatState.currentDrawPile = DeckLogic.getInstance().generateInitialCombatDeck();
        GameState.getInstance().combatState.currentDiscardPile = []

        DeckLogic.getInstance().drawHandForNewTurn();
    }
    
    createPlayerUnits(): void {
        
        GameState.getInstance().currentRunCharacters.forEach((data, index) => {
            const x = config.gameWidth - 100;
            const y = 100 + index * 180;
            const unit = CardGuiUtils.getInstance().createCard({
                scene: this,
                x: x,
                y: y,
                data: data,
                location: CardScreenLocation.CHARACTER_ROSTER,
                eventCallback: ()=>{}
            });
            (unit as any).isPlayerUnit = true;
            this.playerUnits.push(unit);
        });
    }

    preload(): void {
        this.load.setBaseURL('https://raw.githubusercontent.com/');
        new GameImageLoader().loadAllImages(this.load);
    }
    create(): void {
        this.createOrUpdateGameAreas();
        this.createPlayerHand();
        this.createEnemyCards();
        this.setupEventListeners();
        this.createPlayerUnits();
        this.createMenu();
        this.createDrawAndDiscardPiles();
        this.createCombatStatusText();

        this.scale.on('resize', this.resize, this);
        // Force an initial resize after a short delay
        this.time.delayedCall(100, () => {
            this.resize();
        });    

        // Set up performance monitoring
        this.lastPerformanceLog = 0;
        this.frameCount = 0;

        this.events.on('update', this.update);
    }



    private handleEndTurn(): void {
        DeckLogic.getInstance().endTurn();
        console.log('End turn button clicked');
    }


    update = (time: number, delta: number) => {
        this.frameCount++;
        
        if (time - this.lastPerformanceLog >= 1000) {
            const fps = Math.round(this.frameCount / ((time - this.lastPerformanceLog) / 1000));
            const memory = (performance as any).memory ? 
                Math.round((performance as any).memory.usedJSHeapSize / (1024 * 1024)) : 
                'N/A';
            
            console.debug(`Performance: FPS: ${fps}, Memory: ${memory} MB`);
            
            this.lastPerformanceLog = time;
            this.frameCount = 0;
        }

        // Check and sync hand with game state every frame
        this.syncHandWithGameState();
        this.updateDrawPileCount();
        this.updateDiscardPileCount();
    };

    updateDrawPileCount(): void {
        if (this.drawPile) {
            const gameState = GameState.getInstance();
            const drawPileCount = gameState.combatState.currentDrawPile.length;
            this.drawPile.data.description = (`Draw Pile (${drawPileCount})`);
        }
    }

    updateDiscardPileCount(): void {
        if (this.discardPile) {
            const gameState = GameState.getInstance();
            const discardPileCount = gameState.combatState.currentDiscardPile.length;
            this.discardPile.data.description=(`Discard Pile (${discardPileCount})`);
        }
    }
    
    arrangeCards(cardArray: PhysicalCard[], yPosition: number): void {
        const totalWidth = config.gameWidth;
        const cardSpacing = Math.min(CardGuiUtils.getInstance().cardConfig.cardWidth, totalWidth / (cardArray.length + 1));
        const totalCardsWidth = cardArray.length * cardSpacing;
        const startX = (totalWidth - totalCardsWidth) / 2;

        cardArray.forEach((card, index) => {
            card.container.x = startX + index * cardSpacing;
            card.container.y = yPosition;
            (card.container as any).originalDepth = index;
            card.container.depth = index;
        });
    }

    resize(): void {
        if (!this.scene.isActive('CombatScene')) {
            return;
        }

        const { width, height } = this.scale;
        this.cameras.main.setViewport(0, 0, width, height);

        this.updateLayout(width, height);

        this.updateBackgroundSize(width, height);
    }

    updateLayout(width: number, height: number): void {
        config.gameWidth = width;
        config.gameHeight = height;
        config.battlefieldY = height * 0.33;
        config.handY = height * 0.75;  // Moved up slightly to make room for piles
        config.dividerY = height * 0.58;
        config.pileY = height * 0.9;  // Moved down to be below the hand

        this.createOrUpdateGameAreas();

        this.arrangeCards(this.playerHand, config.handY);
        this.arrangeCards(this.enemyUnits, config.battlefieldY);
        this.playerUnits.forEach((unit, index) => {
            unit.container.x = config.gameWidth - 100;
            unit.container.y = 100 + index * 180;
        });

        // Position draw and discard piles
        if (this.drawPile) {
            this.drawPile.container.setPosition(width * 0.1, config.pileY);
            this.drawPile.container.removeInteractive(); // Make it not draggable
        }
        if (this.discardPile) {
            this.discardPile.container.setPosition(width * 0.2, config.pileY);
            this.discardPile.container.removeInteractive(); // Make it not draggable
        }

        // Position combat status text
        if (this.combatStatusText) {
            this.combatStatusText.setPosition(width * 0.5, config.pileY);
        }

        // Position end turn button
        if (this.endTurnButton) {
            this.endTurnButton.setPosition(width * 0.7, config.pileY);
        } else {
            this.endTurnButton = new TextBox({
                scene: this,
                x: width * 0.7,
                y: config.pileY,
                width: 120,
                height: 40,
                text: 'End Turn',
                style: {
                    fontSize: '24px',
                    color: '#ffffff'
                },
                backgroundImage: 'button_background'
            });
            this.endTurnButton.background!!.setInteractive({ useHandCursor: true })
                .on('pointerdown', this.handleEndTurn, this);
            this.add.existing(this.endTurnButton.background!!);
            this.add.existing(this.endTurnButton.text);
        }
    }

    updateBackgroundSize(width: number, height: number): void {
        if (this.backgroundImage) {
            this.backgroundImage.setDisplaySize(width, height);
            this.backgroundImage.setPosition(width / 2, height / 2);
        }
    }
    createOrUpdateGameAreas(): void {
        const { gameWidth, gameHeight, battlefieldY, handY } = config;

        if (!this.backgroundImage) {
            this.backgroundImage = this.add.image(gameWidth / 2, gameHeight / 2, 'battleback1').setOrigin(0.5);
            this.backgroundImage.setDepth(-1);
        }
        this.backgroundImage.setDisplaySize(gameWidth, gameHeight);
        this.backgroundImage.setPosition(gameWidth / 2, gameHeight / 2);

        if (!this.battlefieldArea) {
            this.battlefieldArea = this.add.rectangle(gameWidth / 2, battlefieldY, gameWidth - 100, 300).setStrokeStyle(4, 0xffff00);
            this.battlefieldArea.setVisible(false);
        } else {
            this.battlefieldArea.setPosition(gameWidth / 2, battlefieldY);
            this.battlefieldArea.setSize(gameWidth - 100, 300);
        }

        if (!this.handArea) {
            this.handArea = this.add.rectangle(gameWidth / 2, handY, gameWidth - 100, 300).setStrokeStyle(4, 0x00ff00);
            this.handArea.setVisible(false);
        } else {
            this.handArea.setPosition(gameWidth / 2, handY);
            this.handArea.setSize(gameWidth - 100, 300);
        }
    }

    createPlayerHand(): void {
        GameState.getInstance().combatState.currentHand.forEach((data, index) => {
            const card = CardGuiUtils.getInstance().createCard({
                scene: this,
                x: 0,
                y: config.handY,
                data: data,
                location: CardScreenLocation.HAND,
                eventCallback: ()=>{}
            });
            this.playerHand.push(card);
        });
        this.arrangeCards(this.playerHand, config.handY);
    }

    createDrawAndDiscardPiles(): void {
        const pileY = config.gameHeight - 100;
        
        // Create Draw Pile
        this.drawPile = CardGuiUtils.getInstance().createCard({
            scene: this,
            x: 100,
            y: pileY,
            data: new AbstractCard({ name: 'Draw Pile (' + 0 + ')', description: 'Cards to draw', portraitName: "drawpile" }),
            location: CardScreenLocation.DRAW_PILE,
            eventCallback: ()=>{}
        });

        // Create Discard Pile
        this.discardPile = CardGuiUtils.getInstance().createCard({
            scene: this,
            x: 0,
            y: 0,
            data: new AbstractCard({ name: 'Discard Pile (' + 0 + ')', description: 'Discarded cards', portraitName: "discardpile" }),
            location: CardScreenLocation.DISCARD_PILE,
            eventCallback: ()=>{}
        });
    }
    createCombatStatusText(): void {
        const x = 400;
        const y = config.gameHeight - 100;
        this.combatStatusText = new TextBox({
            scene: this,
            x: x,
            y: y,
            width: 300, // Adjust width as needed
            height: 50,  // Adjust height as needed
            text: 'CURRENT COMBAT STATUS',
            style: { fontSize: '24px', color: '#000', align: 'center' }
        });
    }

    createEnemyCards(): void {
        if (this.encounter && this.encounter.enemies) {
            this.encounter.enemies.forEach((enemy, index) => {
                const enemyCard = CardGuiUtils.getInstance().createCard({
                    scene: this,
                    x: 400 + index * 150,
                    y: config.battlefieldY,
                    data: enemy,
                    location: CardScreenLocation.BATTLEFIELD,
                    eventCallback: ()=>{}
                });
                enemyCard.container.setDepth(1);
                this.enemyUnits.push(enemyCard);
            });
        }
    }


    setupEventListeners(): void {
        this.input.on('dragstart', this.handleDragStart, this);
        this.input.on('drag', this.handleDrag, this);
        this.input.on('dragend', this.handleDragEnd, this);
        this.input.on('gameobjectover', this.handleGameObjectOver, this);
    }

    createMenu(): void {
        this.menuButton = this.add.text(10, 10, 'Menu', { fontSize: '24px', color: '#fff' })
            .setInteractive()
            .on('pointerdown', this.toggleMenu, this);

        this.menuPanel = this.add.container(0, -200);
        const panelBg = this.add.rectangle(0, 0, 200, 200, 0x000000, 0.8);
        const newGameButton = this.add.text(0, -60, 'Start New Game', { fontSize: '20px', color: '#fff' })
            .setInteractive()
            .on('pointerdown', this.startNewGame, this);
        const newCampaignButton = this.add.text(0, 0, 'New Campaign', { fontSize: '20px', color: '#fff' })
            .setInteractive()
            .on('pointerdown', this.startNewCampaign, this);
        const quitButton = this.add.text(0, 60, 'Quit', { fontSize: '20px', color: '#fff' })
            .setInteractive()
            .on('pointerdown', this.quitGame, this);

        this.menuPanel.add([panelBg, newGameButton, newCampaignButton, quitButton]);
        this.menuPanel.setPosition(100, 100);
        this.menuPanel.setVisible(false);
    }

    toggleMenu(): void {
        this.menuPanel.setVisible(!this.menuPanel.visible);
    }

    startNewGame(): void {
        console.log('Starting new game');
        this.scene.restart();
    }

    startNewCampaign(): void {
        console.log('Starting new campaign');
        this.scene.start('Campaign');
    }

    quitGame(): void {
        console.log('Quitting game');
        this.game.destroy(true);
    }

    handleDragStart(pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.Container): void {
        if ('physicalCard' in gameObject) {
            this.draggedCard = (gameObject as any).physicalCard as PhysicalCard;
        } else {
            console.warn('Dragged object is not a PhysicalCard');
            this.draggedCard = null;
        }
    }

    handleDrag(pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.Container, dragX: number, dragY: number): void {
        gameObject.x = dragX;
        gameObject.y = dragY;

        const inBattlefield = dragY < config.dividerY;
        this.battlefieldArea.setVisible(inBattlefield);
        this.handArea.setVisible(!inBattlefield);

        this.checkCardUnderPointer(pointer);
    }
    checkCardUnderPointer(pointer: Phaser.Input.Pointer): void {
        const cardUnderPointer = this.getCardUnderPointer(pointer);

        if (cardUnderPointer && cardUnderPointer !== this.draggedCard) {
            if (this.highlightedCard !== cardUnderPointer) {
                if (this.highlightedCard instanceof PhysicalCard) {
                    this.unhighlightCard(this.highlightedCard);
                }
                this.highlightedCard = cardUnderPointer;
                this.highlightCard(cardUnderPointer);
            }
        } else if (this.highlightedCard instanceof PhysicalCard) {
            this.unhighlightCard(this.highlightedCard);
            this.highlightedCard = null;
        }
    }

    getCardUnderPointer(pointer: Phaser.Input.Pointer): PhysicalCard | null {
        const allCards = [...this.playerHand, ...this.enemyUnits, ...this.playerUnits];
        for (let i = allCards.length - 1; i >= 0; i--) {
            const card = allCards[i];
            if (card !== this.draggedCard && card.container.getBounds().contains(pointer.x, pointer.y)) {
                return card;
            }
        }
        return null;
    }

    handleDragEnd(pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.Container): void {
        const physicalCard = (gameObject as any).physicalCard as PhysicalCard;
        if (physicalCard?.data?.cardType === CardType.CHARACTER) return;

        const inHand = gameObject.y > config.dividerY;
        if (inHand) {
            this.moveCardToHand(physicalCard.data.id);
        } else {
            this.moveCardToBattlefield(physicalCard);
        }

        this.battlefieldArea.setVisible(false);
        this.handArea.setVisible(false);

        if (this.highlightedCard) {
            this.handleCardInteraction(physicalCard, this.highlightedCard);
            this.unhighlightCard(this.highlightedCard);
            this.highlightedCard = null;
        }

        this.draggedCard = null;
    }
    handleCardInteraction(usedCard: PhysicalCard, targetCard: PhysicalCard): void {
        if (usedCard && usedCard.data && targetCard && targetCard.data) {
            if (usedCard.data.IsPerformableOn && usedCard.data.Action) {
                if (usedCard.data.IsPerformableOn(targetCard)) {
                    usedCard.data.Action(targetCard);
                    
                    // Update visual representation of the cards
                    this.updateCardVisuals(usedCard);
                    this.updateCardVisuals(targetCard);
                } else {
                    console.log(`Action not performable on ${targetCard.data.name} by ${usedCard.data.name}`);
                }
            } else {
                console.log("Card data is missing required methods");
            }
        } else {
            console.log("Invalid card data");
        }
    }

    private updateCardVisuals(card: PhysicalCard): void {
        // Implement logic to update card visuals
        // For example, updating health, status effects, etc.
        // This method should be implemented based on your game's specific requirements
    }

    handleGameObjectOver(pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.GameObject): void {
        if (gameObject.type === 'Container') {
            this.children.bringToTop(gameObject);
        }
    }

    highlightCard(card: PhysicalCard): void {
        const highlightBorder = card.container.getByName('highlightBorder') as Phaser.GameObjects.Rectangle;
        if (highlightBorder) {
            highlightBorder.setVisible(true);
        }
    }

    unhighlightCard(card: PhysicalCard): void {
        const highlightBorder = card.container.getByName('highlightBorder') as Phaser.GameObjects.Rectangle;
        if (highlightBorder) {
            highlightBorder.setVisible(false);
        }
    }

    moveCardToHand(cardId: string): void {
        const card = this.findCardById(cardId);
        if (card && !this.playerHand.includes(card)) {
            this.playerHand.push(card);
            this.enemyUnits = this.enemyUnits.filter(c => c !== card);
            card.cardLocation = CardScreenLocation.HAND;
            this.arrangeCards(this.playerHand, config.handY);
        }
    }

    moveCardToBattlefield(card: PhysicalCard): void {
        if (!this.enemyUnits.includes(card)) {
            this.enemyUnits.push(card);
            this.playerHand = this.playerHand.filter(c => c !== card);
        }
        this.arrangeCards(this.enemyUnits, config.battlefieldY);
    }

    syncHandWithGameState(): void {
        const gameState = GameState.getInstance();
        const combatState = gameState.combatState;

        // Create a map of card IDs in the current hand
        const currentHandIds = new Set(this.playerHand.map(card => card.data.id));

        // Check for cards that need to be added to the hand
        combatState.currentHand.forEach(card => {
            if (!currentHandIds.has(card.id)) {
                console.log("Adding card to hand: " + card.id);
                // Find the card in draw pile or discard pile
                const newCard = CardGuiUtils.getInstance().createCard({
                    scene: this,
                    x: 0,
                    y: 0,
                    data: card,
                    location: CardScreenLocation.HAND,
                    eventCallback: ()=>{}
                });
                this.playerHand.push(newCard);
                this.arrangeCards(this.playerHand, config.handY);
            }
        });

        // Check for cards that need to be removed from the hand
        this.playerHand.forEach(card => {
            const cardData = card.data;
            if (!combatState.currentHand.some(c => c.id === cardData.id)) {
                console.log("Removing card from hand: " + cardData.id);
                this.discardCardById(cardData.id);
            }
        });
    }

    discardCard(card: PhysicalCard): void {
        this.playerHand = this.playerHand.filter(c => c !== card);
        card.obliterate(); // Obliterate the physical card

    }

    discardCardById(cardId: string): void {
        const card = this.playerHand.find(c => c.data.id === cardId);
        if (card) {
            this.playerHand = this.playerHand.filter(c => c !== card);
            card.container.destroy(); // Obliterate the physical card
        }
    }

    // Add these methods to resolve compilation errors
    findCardById(cardId: string): PhysicalCard | undefined {
        return [...this.playerHand, ...this.enemyUnits, ...this.playerUnits].find(card => card.data.id === cardId);
    }
}

const gameconfig: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    scale: {
        mode: Phaser.Scale.RESIZE,
        parent: 'phaser-example',
        width: '100%',
        height: '100%',
        resizeInterval: 1000,
    },
    render: {
        antialias: true,
        roundPixels:false,
        pixelArt: false
    },
    scene: [CampaignScene, CombatScene, MapScene]
};

const game = new Phaser.Game(gameconfig);
