import Phaser from 'phaser';
import GameImageLoader from '../utils/ImageUtils';
import {  PlayerCharacter, } from '../gamecharacters/CharacterClasses';
import { AbstractCard,  PhysicalCard, TextBox } from '../gamecharacters/PhysicalCard';
import { CardGuiUtils } from '../utils/CardGuiUtils';
import CampaignScene from './campaign';
import MapScene from './map';
import { EncounterData } from '../encounters/encounters';
import { BattleCardLocation, GameState } from './gamestate';
import { DeckLogic } from '../rules/decklogic';
import { CardScreenLocation, CardType } from '../gamecharacters/Primitives';
import { ActionManager } from '../utils/ActionManager';
import { PlayableCard } from '../gamecharacters/AbstractCard';


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
    private hoveredCard: PhysicalCard | null = null;
    private maxDepth: number = 1000;

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
            this.drawPile.data.name = (`Draw Pile (${drawPileCount})`);
            this.drawPile.nameBox.setText(`Draw Pile (${drawPileCount})`);
        }
    }

    updateDiscardPileCount(): void {
        if (this.discardPile) {
            const gameState = GameState.getInstance();
            const discardPileCount = gameState.combatState.currentDiscardPile.length;
            this.discardPile.data.name = (`Discard Pile (${discardPileCount})`);
            this.discardPile.nameBox.setText(`Discard Pile (${discardPileCount})`);
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
            if (this.hoveredCard === card) {
                card.container.depth = this.maxDepth + index;
            } else {
                card.container.depth = index;
            }
            
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
        this.input.on('gameobjectout', this.handleGameObjectOut, this);  // Add this line

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

    getCardUnderPointer = (pointer: Phaser.Input.Pointer): PhysicalCard | null => {
        const allCards = [...this.playerHand, ...this.enemyUnits, ...this.playerUnits];
        for (let i = allCards.length - 1; i >= 0; i--) {
            const card = allCards[i];
            if (card !== this.draggedCard && card.cardBackground.getBounds().contains(pointer.x, pointer.y)) {
                return card;
            }
        }
        return null;
    }

    handleDragEnd(pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.Container): void {
        const physicalCard = (gameObject as any).physicalCard as PhysicalCard;
        if (physicalCard?.data !instanceof PlayableCard) return;

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
        if (usedCard.data !instanceof PlayableCard) {
            console.log("Used card is not a PlayableCard");
            return;
        }
        const usedPlayableCard = usedCard.data as PlayableCard;

        if (usedPlayableCard.IsPerformableOn(targetCard.data)) {
            usedPlayableCard.InvokeCardEffects(targetCard.data);
            
            console.log("Card effects invoked: ", usedCard.data.name);
        } else {
            console.log(`Action not performable on ${targetCard.data.name} by ${usedCard.data.name}`);
        }
    }

    private updateCardVisuals(card: PhysicalCard): void {
        // Implement logic to update card visuals
        // For example, updating health, status effects, etc.
        // This method should be implemented based on your game's specific requirements
    }

    handleGameObjectOver(pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.GameObject): void {
        if (gameObject instanceof Phaser.GameObjects.Container && (gameObject as any).physicalCard instanceof PhysicalCard) {
            const physicalCard = (gameObject as any).physicalCard as PhysicalCard;
            this.bringCardToFront(gameObject);
            this.hoveredCard = physicalCard;
        }
    }

    handleGameObjectOut(pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.GameObject): void {
        if (gameObject instanceof Phaser.GameObjects.Container && (gameObject as any).physicalCard instanceof PhysicalCard) {
            const physicalCard = (gameObject as any).physicalCard as PhysicalCard;
            this.resetCardDepth(gameObject);
            if (this.hoveredCard === physicalCard) {
                this.hoveredCard = null;
            }
        }
    }

    bringCardToFront(container: Phaser.GameObjects.Container): void {
        this.maxDepth++;
        container.setDepth(this.maxDepth);
    }

    resetCardDepth(container: Phaser.GameObjects.Container): void {
        const originalDepth = (container as any).originalDepth || 0;
        container.setDepth(originalDepth);
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
    
        // Create a map of existing PhysicalCards by their AbstractCard's id
        const existingCards = new Map(this.playerHand.map(card => [card.data.id, card]));
    

        // Remove any PhysicalCards that are no longer in the hand
        existingCards.forEach((physicalCard, id) => {
            if (!combatState.currentHand.some(c => c.id === id)) {
                this.discardCard(physicalCard);
            }
        });

        // Update the hand based on the current game state
        this.playerHand = combatState.currentHand.map(abstractCard => {
            if (existingCards.has(abstractCard.id)) {
                // If a PhysicalCard already exists for this AbstractCard, use it
                return existingCards.get(abstractCard.id)!;
            } else {
                return this.animateCardDraw(abstractCard);
            }
        });
    
        // Arrange the cards in the hand
        this.arrangeCards(this.playerHand, config.handY);
    }

    animateCardDraw(data: AbstractCard): PhysicalCard {
    // If not, create a new PhysicalCard and animate it
        const card = CardGuiUtils.getInstance().createCard({
            scene: this,
            x: this.drawPile!.container.x,
            y: this.drawPile!.container.y,
            data: data,
            location: CardScreenLocation.HAND,
            eventCallback: ()=>{}
        });
        // Start the card at the draw pile position
        card.container.setPosition(this.drawPile!.container.x, this.drawPile!.container.y);
        card.container.setScale(0.5);
        card.container.setAlpha(0);

        // Animate the card to its position in the hand
        this.tweens.add({
            targets: card.container,
            x: card.container.x,
            y: config.handY,
            scaleX: 1,
            scaleY: 1,
            alpha: 1,
            duration: 500,
            ease: 'Power2'
        });

        return card;
    }

    discardCard(card: PhysicalCard): void {
        this.playerHand = this.playerHand.filter(c => c !== card);
        // Log initial positions for debugging
        console.log('Card initial position:', card.container.x, card.container.y);
        console.log('Discard pile position:', this.discardPile!.container.x, this.discardPile!.container.y);

        // Create a discard animation
        this.tweens.add({
            targets: card.container,
            x: this.discardPile!.container.x,
            y: this.discardPile!.container.y,
            scaleX: 0.5,
            scaleY: 0.5,
            alpha: 0,
            duration: 500,
            ease: 'Power2',
            onComplete: () => {
                card.obliterate(); // Obliterate the physical card after animation
            }
        });
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
