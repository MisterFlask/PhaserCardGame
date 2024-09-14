// src/scenes/CombatScene.ts

import Phaser from 'phaser';
import { EncounterData } from '../encounters/Encounters';
import { AbstractCard, PlayableCard, UiCard } from '../gamecharacters/AbstractCard';
import { AutomatedCharacter } from '../gamecharacters/AutomatedCharacter';
import { BaseCharacter } from '../gamecharacters/BaseCharacter';
import { CombatRules } from '../rules/CombatRules';
import { DeckLogic } from '../rules/DeckLogic';
import { GameState } from '../rules/GameState';
import Menu from '../ui/Menu'; // Import the Menu class
import { PhysicalCard } from '../ui/PhysicalCard';
import { PhysicalIntent } from '../ui/PhysicalIntent';
import { TextBox } from '../ui/TextBox';
import { CardGuiUtils } from '../utils/CardGuiUtils';
import GameImageLoader from '../utils/ImageUtils';
import CampaignScene from './campaign';
import MapScene from './map';

/**
 * Configuration constants for the CombatScene.
 */
const config = {
    battlefieldY: 200,
    handY: 500,
    dividerY: 350,
    gameWidth: 800,
    gameHeight: 600,
    pileY: 550  // Positioned below the hand
};

/**
 * Interface for initializing CombatScene with necessary data.
 */
interface CombatSceneData {
    encounter: EncounterData;
}

/**
 * CombatScene class handles the combat mechanics, UI, and interactions.
 */
class CombatScene extends Phaser.Scene {
    // Player and Enemy Units
    private playerHand: PhysicalCard[] = [];
    private enemyUnits: PhysicalCard[] = [];
    private playerUnits: PhysicalCard[] = [];

    // UI Elements
    private backgroundImage!: Phaser.GameObjects.Image;
    private battlefieldArea!: Phaser.GameObjects.Rectangle;
    private handArea!: Phaser.GameObjects.Rectangle;
    private menu!: Menu; // Menu instance
    private drawPile!: PhysicalCard;
    private discardPile!: PhysicalCard;
    private combatStatusText!: TextBox;
    private endTurnButton!: TextBox;

    // Interaction States
    private highlightedCard: PhysicalCard | null = null;
    private draggedCard: PhysicalCard | null = null;
    private hoveredCard: PhysicalCard | null = null;

    // Performance Monitoring
    private lastPerformanceLog: number = 0;
    private frameCount: number = 0;

    // Other Properties
    private encounter!: EncounterData;
    private maxDepth: number = 1000;
    private physicalIntents: PhysicalIntent[] = [];
    private glowEffects: Map<BaseCharacter, Phaser.GameObjects.GameObject> = new Map();
    private needsSync: boolean = false;

    /**
     * Constructor initializes the CombatScene with a unique key.
     */
    constructor() {
        super('CombatScene');
    }

    /**
     * Preloads all necessary assets for the CombatScene.
     */
    preload(): void {
        this.load.setBaseURL('https://raw.githubusercontent.com/');
        new GameImageLoader().loadAllImages(this.load);
    }

    /**
     * Initializes the CombatScene with data from the previous scene.
     * @param data - Data containing the encounter details.
     */
    init(data: CombatSceneData): void {
        this.encounter = data.encounter;
        GameState.getInstance().combatState.currentHand = [];
        GameState.getInstance().combatState.currentDrawPile = DeckLogic.getInstance().generateInitialCombatDeck();
        GameState.getInstance().combatState.currentDiscardPile = [];

        DeckLogic.getInstance().drawHandForNewTurn();
    }

    /**
     * Creates all game objects and UI elements for the CombatScene.
     */
    create(): void {
        this.createBackground();
        this.createGameAreas();
        this.createPlayerHand();
        this.createPlayerUnits();
        this.createEnemyCards();
        this.createDrawAndDiscardPiles();
        this.createCombatStatusText();
        this.createEndTurnButton();
        this.createMenu();

        this.setupEventListeners();
        this.setupPhysicalIntents();
        this.setupResizeHandler();

        // Initial synchronization
        this.needsSync = true;
    }

    /**
     * Sets up event listeners and ensures they are removed on shutdown.
     */
    private setupEventListeners(): void {
        this.input.on('dragstart', this.handleDragStart, this);
        this.input.on('drag', this.handleDrag, this);
        this.input.on('dragend', this.handleDragEnd, this);
        this.input.on('gameobjectover', this.handleGameObjectOver, this);
        this.input.on('gameobjectout', this.handleGameObjectOut, this);

        // Remove listeners on shutdown to prevent memory leaks
        this.events.on('shutdown', this.removeEventListeners, this);
    }

    /**
     * Removes all event listeners to clean up the scene.
     */
    private removeEventListeners(): void {
        this.input.off('dragstart', this.handleDragStart, this);
        this.input.off('drag', this.handleDrag, this);
        this.input.off('dragend', this.handleDragEnd, this);
        this.input.off('gameobjectover', this.handleGameObjectOver, this);
        this.input.off('gameobjectout', this.handleGameObjectOut, this);
    }

    /**
     * Sets up physical intents and their interactions.
     */
    private setupPhysicalIntents(): void {
        this.physicalIntents.forEach(intent => {
            const container = intent.getContainer();
            container.setInteractive();

            container.on('pointerover', () => this.updateHighlights(intent));
            container.on('pointerout', () => this.updateHighlights(null));
        });
    }

    /**
     * Handles window resize events to adjust the layout accordingly.
     */
    private setupResizeHandler(): void {
        this.scale.on('resize', this.resize, this);
        // Force an initial resize after a short delay
        this.time.delayedCall(100, () => {
            this.resize();
        });
    }

    /**
     * Creates the background image for the CombatScene.
     */
    private createBackground(): void {
        this.backgroundImage = this.add.image(config.gameWidth / 2, config.gameHeight / 2, 'battleback1')
            .setOrigin(0.5)
            .setDisplaySize(config.gameWidth, config.gameHeight)
            .setDepth(-1);
    }

    /**
     * Creates the battlefield and hand areas.
     */
    private createGameAreas(): void {
        const { gameWidth, battlefieldY, handY } = config;

        // Battlefield Area
        this.battlefieldArea = this.add.rectangle(gameWidth / 2, battlefieldY, gameWidth - 100, 300)
            .setStrokeStyle(4, 0xffff00)
            .setVisible(false);

        // Hand Area
        this.handArea = this.add.rectangle(gameWidth / 2, handY, gameWidth - 100, 300)
            .setStrokeStyle(4, 0x00ff00)
            .setVisible(false);
    }

    /**
     * Creates the player's hand by generating PhysicalCard instances.
     */
    private createPlayerHand(): void {
        GameState.getInstance().combatState.currentHand.forEach(cardData => {
            const card = CardGuiUtils.getInstance().createCard({
                scene: this,
                x: 0,
                y: config.handY,
                data: cardData,
                eventCallback: () => { }
            });
            this.playerHand.push(card);
        });
        this.arrangeCards(this.playerHand, config.handY);
    }

    /**
     * Creates the player's units on the battlefield.
     */
    private createPlayerUnits(): void {
        GameState.getInstance().currentRunCharacters.forEach((characterData, index) => {
            const x = config.gameWidth - 100;
            const y = 100 + index * 180;
            const unit = CardGuiUtils.getInstance().createCard({
                scene: this,
                x: x,
                y: y,
                data: characterData,
                eventCallback: () => { }
            });
            (unit as any).isPlayerUnit = true;
            this.playerUnits.push(unit);
        });

        GameState.getInstance().combatState.playerCharacters = this.playerUnits.map(card => card.data as BaseCharacter);
    }

    /**
     * Creates enemy units based on the encounter data.
     */
    private createEnemyCards(): void {
        GameState.getInstance().combatState.enemies = this.encounter.enemies;
        if (this.encounter && this.encounter.enemies) {
            this.encounter.enemies.forEach((enemy, index) => {
                const enemyCard = CardGuiUtils.getInstance().createCard({
                    scene: this,
                    x: 400 + index * 150,
                    y: config.battlefieldY,
                    data: enemy,
                    eventCallback: () => { }
                });
                if (enemy instanceof AutomatedCharacter) {
                    enemy.setNewIntents();
                }
                enemyCard.container.setDepth(1);
                this.enemyUnits.push(enemyCard);
            });
        }
    }

    /**
     * Creates the draw and discard piles on the screen.
     */
    private createDrawAndDiscardPiles(): void {
        const { gameWidth, pileY } = config;

        // Create Draw Pile
        this.drawPile = CardGuiUtils.getInstance().createCard({
            scene: this,
            x: gameWidth * 0.1,
            y: pileY,
            data: new UiCard({ name: 'Draw Pile (0)', description: 'Cards to draw', portraitName: "drawpile" }),
            eventCallback: () => { }
        });

        // Create Discard Pile
        this.discardPile = CardGuiUtils.getInstance().createCard({
            scene: this,
            x: gameWidth * 0.2,
            y: pileY,
            data: new UiCard({ name: 'Discard Pile (0)', description: 'Discarded cards', portraitName: "discardpile" }),
            eventCallback: () => { }
        });
    }

    /**
     * Creates the combat status text box.
     */
    private createCombatStatusText(): void {
        const { gameWidth, pileY } = config;
        this.combatStatusText = new TextBox({
            scene: this,
            x: gameWidth * 0.5,
            y: pileY,
            width: 300, // Adjust width as needed
            height: 50,  // Adjust height as needed
            text: 'CURRENT COMBAT STATUS',
            style: { fontSize: '24px', color: '#000', align: 'center' }
        });
    }

    /**
     * Creates the "End Turn" button.
     */
    private createEndTurnButton(): void {
        const { gameWidth, pileY } = config;
        this.endTurnButton = new TextBox({
            scene: this,
            x: gameWidth * 0.7,
            y: pileY,
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

    /**
     * Creates the in-game menu using the Menu class.
     */
    private createMenu(): void {
        const { gameWidth, gameHeight } = config;

        const menuOptions = [
            {
                text: 'Start New Game',
                callback: this.startNewGame.bind(this)
            },
            {
                text: 'New Campaign',
                callback: this.startNewCampaign.bind(this)
            },
            {
                text: 'Quit',
                callback: this.quitGame.bind(this)
            }
        ];

        // Calculate menu height based on the number of options
        const menuHeight = menuOptions.length * this.menuButtonSpacing() + 100;

        // Initialize the Menu at the center-right of the screen
        this.menu = new Menu({
            scene: this,
            x: gameWidth - 250,
            y: gameHeight / 2,
            width: 300,
            height: menuHeight,
            options: menuOptions
        });

        // Create a Menu button with enhanced styling
        const menuButton = this.add.text(gameWidth - 350, 50, '☰ Menu', {
            fontSize: '28px',
            color: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 15, y: 10 },
            align: 'center',
            //borderRadius: '10px'
        })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => this.menu.toggle())
            .on('pointerover', () => {
                this.tweens.add({
                    targets: menuButton,
                    scale: 1.1,
                    duration: 200,
                    ease: 'Power2'
                });
                menuButton.setStyle({ backgroundColor: '#555555' });
            })
            .on('pointerout', () => {
                this.tweens.add({
                    targets: menuButton,
                    scale: 1.0,
                    duration: 200,
                    ease: 'Power2'
                });
                menuButton.setStyle({ backgroundColor: '#000000' });
            });

        this.add.existing(menuButton);
    }

    /**
     * Determines the spacing between menu buttons based on the number of options.
     * @returns The spacing value.
     */
    private menuButtonSpacing(): number {
        return 60; // Adjust as needed
    }

    /**
     * Toggles the visibility of the menu.
     */
    private toggleMenu(): void {
        this.menu.toggle();
    }

    /**
     * Starts a new game by restarting the CombatScene.
     */
    private startNewGame(): void {
        console.log('Starting new game');
        this.scene.restart();
    }

    /**
     * Starts a new campaign by switching to the CampaignScene.
     */
    private startNewCampaign(): void {
        console.log('Starting new campaign');
        this.scene.start('Campaign');
    }

    /**
     * Quits the game by destroying the Phaser game instance.
     */
    private quitGame(): void {
        console.log('Quitting game');
        this.game.destroy(true);
    }

    /**
     * Arranges a set of cards horizontally at a specified Y position.
     * @param cardArray - Array of PhysicalCard instances to arrange.
     * @param yPosition - Y coordinate for arranging the cards.
     */
    private arrangeCards(cardArray: PhysicalCard[], yPosition: number): void {
        const { gameWidth } = config;
        const totalWidth = gameWidth;
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

    /**
     * Synchronizes the player's hand with the current game state.
     */
    private syncHandWithGameState(): void {
        const gameState = GameState.getInstance();
        const combatState = gameState.combatState;

        // Map of existing cards by their ID
        const existingCards = new Map(this.playerHand.map(card => [card.data.id, card]));

        // Remove cards that are no longer in the hand
        existingCards.forEach((physicalCard, id) => {
            if (!combatState.currentHand.some(c => c.id === id)) {
                this.discardCard(physicalCard);
            }
        });

        // Add new cards to the hand
        combatState.currentHand.forEach(abstractCard => {
            if (!existingCards.has(abstractCard.id)) {
                const newCard = this.animateCardDraw(abstractCard);
                this.playerHand.push(newCard);
            }
        });

        // Remove discarded cards from the hand
        this.playerHand = this.playerHand.filter(card => combatState.currentHand.some(c => c.id === card.data.id));

        // Arrange the hand
        this.arrangeCards(this.playerHand, config.handY);
    }

    /**
     * Animates drawing a card from the draw pile to the player's hand.
     * @param data - AbstractCard data for the card being drawn.
     * @returns The newly created PhysicalCard instance.
     */
    private animateCardDraw(data: AbstractCard): PhysicalCard {
        const card = CardGuiUtils.getInstance().createCard({
            scene: this,
            x: this.drawPile.container.x,
            y: this.drawPile.container.y,
            data: data,
            eventCallback: () => { }
        });
        card.container.setScale(0.5);
        card.container.setAlpha(0);

        // Animate the card moving to the hand
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

    /**
     * Discards a card by animating it to the discard pile and removing it from the hand.
     * @param card - The PhysicalCard instance to discard.
     */
    private discardCard(card: PhysicalCard): void {
        this.playerHand = this.playerHand.filter(c => c !== card);

        // Create a discard animation
        this.tweens.add({
            targets: card.container,
            x: this.discardPile.container.x,
            y: this.discardPile.container.y,
            scaleX: 0.5,
            scaleY: 0.5,
            alpha: 0,
            duration: 500,
            ease: 'Power2',
            onComplete: () => {
                card.obliterate(); // Remove the card after animation
            }
        });
    }

    /**
     * Updates the draw pile count display.
     */
    private updateDrawPileCount(): void {
        if (this.drawPile) {
            const gameState = GameState.getInstance();
            const drawPileCount = gameState.combatState.currentDrawPile.length;
            this.drawPile.data.name = `Draw Pile (${drawPileCount})`;
            this.drawPile.nameBox.setText(`Draw Pile (${drawPileCount})`);
        }
    }

    /**
     * Updates the discard pile count display.
     */
    private updateDiscardPileCount(): void {
        if (this.discardPile) {
            const gameState = GameState.getInstance();
            const discardPileCount = gameState.combatState.currentDiscardPile.length;
            this.discardPile.data.name = `Discard Pile (${discardPileCount})`;
            this.discardPile.nameBox.setText(`Discard Pile (${discardPileCount})`);
        }
    }

    /**
     * Handles the dragging start event for a card.
     * @param pointer - The pointer initiating the drag.
     * @param gameObject - The game object being dragged.
     */
    private handleDragStart(pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.Container): void {
        if ('physicalCard' in gameObject) {
            this.draggedCard = (gameObject as any).physicalCard as PhysicalCard;
        } else {
            console.warn('Dragged object is not a PhysicalCard');
            this.draggedCard = null;
        }
    }

    /**
     * Handles the dragging motion of a card.
     * @param pointer - The pointer moving the drag.
     * @param gameObject - The game object being dragged.
     * @param dragX - The X position during the drag.
     * @param dragY - The Y position during the drag.
     */
    private handleDrag(pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.Container, dragX: number, dragY: number): void {
        gameObject.x = dragX;
        gameObject.y = dragY;

        const inBattlefield = dragY < config.dividerY;
        this.battlefieldArea.setVisible(inBattlefield);
        this.handArea.setVisible(!inBattlefield);

        this.checkCardUnderPointer(pointer);
    }

    /**
     * Checks if there's a card under the pointer and handles highlighting.
     * @param pointer - The current pointer position.
     */
    private checkCardUnderPointer(pointer: Phaser.Input.Pointer): void {
        const cardUnderPointer = this.getCardUnderPointer(pointer);

        if (cardUnderPointer && cardUnderPointer !== this.draggedCard) {
            if (this.highlightedCard !== cardUnderPointer) {
                if (this.highlightedCard) {
                    this.unhighlightCard(this.highlightedCard);
                }
                this.highlightedCard = cardUnderPointer;
                this.highlightCard(cardUnderPointer);
            }
        } else if (this.highlightedCard) {
            this.unhighlightCard(this.highlightedCard);
            this.highlightedCard = null;
        }
    }

    /**
     * Retrieves the card under the current pointer position.
     * @param pointer - The current pointer.
     * @returns The PhysicalCard under the pointer or null.
     */
    private getCardUnderPointer(pointer: Phaser.Input.Pointer): PhysicalCard | null {
        const allCards = [...this.playerHand, ...this.enemyUnits, ...this.playerUnits];
        for (let i = allCards.length - 1; i >= 0; i--) {
            const card = allCards[i];
            if (card !== this.draggedCard && card.cardBackground.getBounds().contains(pointer.x, pointer.y)) {
                return card;
            }
        }
        return null;
    }

    /**
     * Handles the end of a card drag operation.
     * @param pointer - The pointer that ended the drag.
     * @param gameObject - The game object that was dragged.
     */
    private handleDragEnd(pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.Container): void {
        const physicalCard = (gameObject as any).physicalCard as PhysicalCard;
        if (!(physicalCard?.data instanceof PlayableCard)) return;

        this.battlefieldArea.setVisible(false);
        this.handArea.setVisible(false);

        if (this.highlightedCard) {
            this.handleCardInteraction(physicalCard, this.highlightedCard);
            this.unhighlightCard(this.highlightedCard);
            this.highlightedCard = null;
        }

        this.draggedCard = null;
    }

    /**
     * Handles the interaction between two cards after a drag-and-drop action.
     * @param usedCard - The card being used (dragged).
     * @param targetCard - The target card being interacted with.
     */
    private handleCardInteraction(usedCard: PhysicalCard, targetCard: PhysicalCard): void {
        if (!(usedCard.data instanceof PlayableCard)) {
            console.log("Used card is not a PlayableCard");
            return;
        }

        const usedPlayableCard = usedCard.data as PlayableCard;

        if (usedPlayableCard.IsPerformableOn(targetCard.data)) {
            usedPlayableCard.InvokeCardEffects(targetCard.data);
            console.log(`Card effects invoked: ${usedCard.data.name} on ${targetCard.data.name}`);
        } else {
            console.log(`Action not performable on ${targetCard.data.name} by ${usedCard.data.name}`);
        }
    }
    private handleEndTurn(): void {
        console.log('End turn button clicked');

        CombatRules.endTurn();
    }


    /**
     * Handles the pointer hovering over a game object.
     * @param pointer - The pointer moving over the game object.
     * @param gameObject - The game object being hovered.
     */
    private handleGameObjectOver(pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.GameObject): void {
        if (gameObject instanceof Phaser.GameObjects.Container && (gameObject as any).physicalCard instanceof PhysicalCard) {
            const physicalCard = (gameObject as any).physicalCard as PhysicalCard;
            this.bringCardToFront(gameObject);
            this.hoveredCard = physicalCard;
        }
    }

    /**
     * Handles the pointer moving out of a game object.
     * @param pointer - The pointer moving out.
     * @param gameObject - The game object being exited.
     */
    private handleGameObjectOut(pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.GameObject): void {
        if (gameObject instanceof Phaser.GameObjects.Container && (gameObject as any).physicalCard instanceof PhysicalCard) {
            const physicalCard = (gameObject as any).physicalCard as PhysicalCard;
            this.resetCardDepth(gameObject);
            if (this.hoveredCard === physicalCard) {
                this.hoveredCard = null;
            }
        }
    }

    /**
     * Brings a card container to the front by increasing its depth.
     * @param container - The container to bring to the front.
     */
    private bringCardToFront(container: Phaser.GameObjects.Container): void {
        this.maxDepth++;
        container.setDepth(this.maxDepth);
    }

    /**
     * Resets the depth of a card container to its original depth.
     * @param container - The container to reset.
     */
    private resetCardDepth(container: Phaser.GameObjects.Container): void {
        const originalDepth = (container as any).originalDepth || 0;
        container.setDepth(originalDepth);
    }

    /**
     * Highlights a specific card by making its highlight border visible.
     * @param card - The PhysicalCard to highlight.
     */
    private highlightCard(card: PhysicalCard): void {
        const highlightBorder = card.container.getByName('highlightBorder') as Phaser.GameObjects.Rectangle;
        if (highlightBorder) {
            highlightBorder.setVisible(true);
        }
    }

    /**
     * Removes the highlight from a specific card.
     * @param card - The PhysicalCard to unhighlight.
     */
    private unhighlightCard(card: PhysicalCard): void {
        const highlightBorder = card.container.getByName('highlightBorder') as Phaser.GameObjects.Rectangle;
        if (highlightBorder) {
            highlightBorder.setVisible(false);
        }
    }

    /**
     * Finds a card in the scene by its unique ID.
     * @param cardId - The unique identifier of the card.
     * @returns The PhysicalCard if found, otherwise undefined.
     */
    private findCardById(cardId: string): PhysicalCard | undefined {
        return [...this.playerHand, ...this.enemyUnits, ...this.playerUnits].find(card => card.data.id === cardId);
    }

    /**
     * Updates the layout and positions of all game elements upon resizing.
     * @param width - The new width of the game.
     * @param height - The new height of the game.
     */
    private updateLayout(width: number, height: number): void {
        config.gameWidth = width;
        config.gameHeight = height;
        config.battlefieldY = height * 0.33;
        config.handY = height * 0.75;  // Moved up slightly to make room for piles
        config.dividerY = height * 0.58;
        config.pileY = height * 0.9;  // Moved down to be below the hand

        this.createGameAreas();

        // Rearrange cards
        this.arrangeCards(this.playerHand, config.handY);
        this.arrangeCards(this.enemyUnits, config.battlefieldY);
        this.playerUnits.forEach((unit, index) => {
            unit.container.x = config.gameWidth - 100;
            unit.container.y = 100 + index * 180;
        });

        // Position draw and discard piles
        if (this.drawPile) {
            this.drawPile.container.setPosition(width * 0.1, config.pileY);
            this.drawPile.container.disableInteractive();
        }
        if (this.discardPile) {
            this.discardPile.container.setPosition(width * 0.2, config.pileY);
            this.discardPile.container.disableInteractive();
        }

        // Position combat status text
        if (this.combatStatusText) {
            this.combatStatusText.setPosition(width * 0.5, config.pileY);
        }

        // Position end turn button
        if (this.endTurnButton) {
            this.endTurnButton.setPosition(width * 0.7, config.pileY);
        }

        // Update the menu position based on new width and height
        if (this.menu) {
            this.menu.container.x = width - 250;
            this.menu.container.y = height / 2;
        }

        // Update the Menu button position
        const menuButton = this.children.getByName('MenuButton') as Phaser.GameObjects.Text;
        if (menuButton) {
            menuButton.setPosition(width - 350, 50);
        }
    }

    /**
     * Resizes the game elements based on the new game dimensions.
     */
    private resize(): void {
        if (!this.scene.isActive('CombatScene')) {
            return;
        }

        const { width, height } = this.scale;
        this.cameras.main.setViewport(0, 0, width, height);

        this.updateLayout(width, height);
        this.updateBackgroundSize(width, height);
    }

    /**
     * Updates the background image size and position based on game dimensions.
     * @param width - The new width of the game.
     * @param height - The new height of the game.
     */
    private updateBackgroundSize(width: number, height: number): void {
        if (this.backgroundImage) {
            this.backgroundImage.setDisplaySize(width, height);
            this.backgroundImage.setPosition(width / 2, height / 2);
        }
    }

    /**
     * Synchronizes the game state with the player's hand and updates pile counts.
     */
    update = (time: number, delta: number): void => {
        this.frameCount++;

        // Throttled performance logging
        if (time - this.lastPerformanceLog >= 1000) {
            const fps = Math.round(this.frameCount / ((time - this.lastPerformanceLog) / 1000));
            const memory = (performance as any).memory ?
                Math.round((performance as any).memory.usedJSHeapSize / (1024 * 1024)) :
                'N/A';

            console.debug(`Performance: FPS: ${fps}, Memory: ${memory} MB`);

            this.lastPerformanceLog = time;
            this.frameCount = 0;
        }

        // Conditional synchronization
        if (this.needsSync) {
            this.syncHandWithGameState();
            this.updateDrawPileCount();
            this.updateDiscardPileCount();
            this.needsSync = false;
        }
    };

    /**
     * Updates highlighted cards based on physical intents.
     * @param hoveredIntent - The PhysicalIntent currently hovered, if any.
     */
    private updateHighlights(hoveredIntent: PhysicalIntent | null): void {
        console.log('Mouse over highlights');
        const allCards = [...this.playerUnits, ...this.enemyUnits, ...this.playerHand];

        // Reset all highlights
        allCards.forEach(card => card.isHighlighted = false);

        // Highlight cards targeted by intents
        if (hoveredIntent) {
            const targetedCharacter = hoveredIntent.getTargetedCharacter();
            const targetedCard = allCards.find(card => card.data === targetedCharacter);
            if (targetedCard) {
                targetedCard.isHighlighted = true;
            }
        }
    }
}

/**
 * Phaser game configuration.
 */
const gameConfig: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 1920,
    height: 1080,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        parent: 'phaser-example',
    },
    render: {
        antialias: true,
        roundPixels: false,
        pixelArt: false
    },
    scene: [CampaignScene, CombatScene, MapScene]
};

// Instantiate and start the Phaser game
const game = new Phaser.Game(gameConfig);

export default CombatScene;
