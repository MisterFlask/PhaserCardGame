import Phaser from 'phaser';
import GameImageLoader from '../utils/ImageUtils';
import { ArcaneRitualCard, BaseCharacter, FireballCard, GoblinCharacter, SummonDemonCard, ToxicCloudCard } from '../gamecharacters/CharacterClasses';
import { AbstractCard, CardType, PhysicalCard, CardScreenLocation, TextBox } from '../gamecharacters/PhysicalCard';
import { CardGuiUtils } from '../utils/CardGuiUtils';
import CampaignScene from './campaign';
import MapScene from './map';
import { EncounterData } from '../encounters/encounters';


const unitData: AbstractCard[] = [
    new AbstractCard({ name: 'Knight', description: 'A brave warrior', portraitName: 'flamer1', cardType: CardType.CHARACTER }),
    new AbstractCard({ name: 'Archer', description: 'Skilled with a bow', portraitName: 'flamer1', cardType: CardType.CHARACTER }),
    new AbstractCard({ name: 'Mage', description: 'Wields powerful magic', portraitName: 'flamer1', cardType: CardType.CHARACTER }),
];

const cardData: AbstractCard[] = [
    new AbstractCard({ name: 'Fireball', description: 'Deals 3 damage to target' }),
    new AbstractCard({ name: 'Healing Touch', description: 'Restores 2 health' }),
    new AbstractCard({ name: 'Stone Wall', description: 'Summons a defensive barrier' }),
    new AbstractCard({ name: 'Lightning Bolt', description: 'Strikes for 2 damage' }),
    new AbstractCard({ name: 'Nature\'s Blessing', description: 'Grants 1 extra mana' }),
    new AbstractCard({ name: 'Nature\'s Blessing', description: 'Grants 1 extra mana' }),
    new AbstractCard({ name: 'Nature\'s Blessing', description: 'Grants 1 extra mana' }),
    new AbstractCard({ name: 'Nature\'s Blessing', description: 'Grants 1 extra mana' }),
    new FireballCard(),
    new ToxicCloudCard(),
    new SummonDemonCard(),
    new ArcaneRitualCard(),
];

const config = {
    battlefieldY: 200,
    handY: 500,
    dividerY: 350,
    gameWidth: 800,
    gameHeight: 600,
    pileY: 550  // Increased to be below the hand
};

class CombatScene extends Phaser.Scene {
    private playerHand: Phaser.GameObjects.Container[];
    private battlefield: Phaser.GameObjects.Container[];
    private playerUnits: Phaser.GameObjects.Container[];
    private backgroundImage!: Phaser.GameObjects.Image;
    private battlefieldArea!: Phaser.GameObjects.Rectangle;
    private handArea!: Phaser.GameObjects.Rectangle;
    private highlightedCard: Phaser.GameObjects.Container | null;
    private draggedCard: Phaser.GameObjects.Container | null;
    private menuButton!: Phaser.GameObjects.Text;
    private menuPanel!: Phaser.GameObjects.Container;
    private drawPile!: Phaser.GameObjects.Container;
    private discardPile!: Phaser.GameObjects.Container;
    private drawPileCount: number = 30;
    private discardPileCount: number = 0;
    private encounter!: EncounterData;
    private combatStatusText!: TextBox;
    private lastPerformanceLog: number = 0;
    private frameCount: number = 0;
    
    constructor() {
        super('CombatScene');
        this.playerHand = [];
        this.battlefield = [];
        this.playerUnits = [];
        this.highlightedCard = null;
        this.draggedCard = null;
    }

    init(data: { encounter: EncounterData }) {
        this.encounter = data.encounter;
        game.events.on('debug', console.log);

    }
    
    createPlayerUnits(): void {
        unitData.forEach((data, index) => {
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
            this.playerUnits.push(unit.container);
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

    this.events.on('update', (time: number, delta: number) => {
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
    });
    }
    
    arrangeCards(cardArray: Phaser.GameObjects.Container[], yPosition: number): void {
        const totalWidth = config.gameWidth - 200;
        const cardSpacing = Math.min(CardGuiUtils.getInstance().cardConfig.cardWidth, totalWidth / (cardArray.length + 1));

        cardArray.forEach((card, index) => {
            card.x = 100 + index * cardSpacing;
            card.y = yPosition;
            (card as any).originalDepth = index;
            card.depth = index;
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
        this.arrangeCards(this.battlefield, config.battlefieldY);
        this.playerUnits.forEach((unit, index) => {
            unit.x = config.gameWidth - 100;
            unit.y = 100 + index * 180;
        });

        // Position draw and discard piles
        if (this.drawPile) {
            this.drawPile.setPosition(width * 0.1, config.pileY);
            this.drawPile.removeInteractive(); // Make it not draggable
        }
        if (this.discardPile) {
            this.discardPile.setPosition(width * 0.2, config.pileY);
            this.discardPile.removeInteractive(); // Make it not draggable
        }

        // Position combat status text
        if (this.combatStatusText) {
            this.combatStatusText.setPosition(width * 0.5, config.pileY);
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
        cardData.forEach((data, index) => {
            const x = 100 + index * 150;
            const y = config.handY;
            const card = CardGuiUtils.getInstance().createCard({
                scene: this,
                x: x,
                y: y,
                data: data,
                location: CardScreenLocation.HAND,
                eventCallback: ()=>{}
            });
            this.playerHand.push(card.container);
        });
        this.arrangeCards(this.playerHand, config.handY);
    }

    createDrawAndDiscardPiles(): void {
        const pileY = config.gameHeight - 100;
        
        // Create Draw Pile
        this.drawPile = this.add.container(100, pileY);
        const drawCard = CardGuiUtils.getInstance().createCard({
            scene: this,
            x: 0,
            y: 0,
            data: new AbstractCard({ name: 'Draw Pile (' + this.drawPileCount + ')', description: 'Cards to draw', portraitName: "drawpile" }),
            location: CardScreenLocation.DRAW_PILE,
            eventCallback: ()=>{}
        });
        this.drawPile.add([drawCard.container]);

        // Create Discard Pile
        this.discardPile = this.add.container(250, pileY);
        const discardCard = CardGuiUtils.getInstance().createCard({
            scene: this,
            x: 0,
            y: 0,
            data: new AbstractCard({ name: 'Discard Pile (' + this.discardPileCount + ')', description: 'Discarded cards', portraitName: "discardpile" }),
            location: CardScreenLocation.DISCARD_PILE,
            eventCallback: ()=>{}
        });
        this.discardPile.add([discardCard.container]);
    }
    createCombatStatusText(): void {
        const x = 400;
        const y = config.gameHeight - 100;
        this.combatStatusText = new TextBox(
            this,
            x,
            y,
            300, // Adjust width as needed
            50,  // Adjust height as needed
            'CURRENT COMBAT STATUS',
            { fontSize: '24px', color: '#000', align: 'center' }
        );
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
                this.battlefield.push(enemyCard.container);
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
        this.draggedCard = gameObject;
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

    getCardUnderPointer(pointer: Phaser.Input.Pointer): Phaser.GameObjects.Container | null {
        const allCards = [...this.playerHand, ...this.battlefield, ...this.playerUnits];
        for (let i = allCards.length - 1; i >= 0; i--) {
            const card = allCards[i];
            if (card !== this.draggedCard && Phaser.Geom.Rectangle.Contains(card.getBounds(), pointer.x, pointer.y)) {
                return card;
            }
        }
        return null;
    }

    handleDragEnd(pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.Container): void {
        if ((gameObject as any)?.physicalCard?.data?.cardType === CardType.CHARACTER) return;

        const inHand = gameObject.y > config.dividerY;
        if (inHand) {
            this.moveCardToHand(gameObject);
        } else {
            this.moveCardToBattlefield(gameObject);
        }

        this.battlefieldArea.setVisible(false);
        this.handArea.setVisible(false);

        if (this.highlightedCard) {
            this.handleCardInteraction(gameObject, this.highlightedCard);
            this.unhighlightCard(this.highlightedCard);
            this.highlightedCard = null;
        }

        this.draggedCard = null;
    }

    handleCardInteraction(usedCard: Phaser.GameObjects.Container, targetCard: Phaser.GameObjects.Container): void {
        const usedCardData = (usedCard as any).physicalCard as PhysicalCard;
        const targetCardData = (targetCard as any).physicalCard as PhysicalCard;

        if (usedCardData && usedCardData.data) {
            if (usedCardData.data.IsPerformableOn(targetCardData)){
                usedCardData.data.Action(targetCardData);
            }else{
                console.log("Action not performable on " + targetCardData.data.name + " by  "+ usedCardData.data.name)
            }

            // You might want to update the visual representation of the cards here
            // For example, updating health, removing cards, etc.
        }
    }
    handleGameObjectOver(pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.GameObject): void {
        if (gameObject.type === 'Container') {
            this.children.bringToTop(gameObject);
        }
    }

    highlightCard(card: Phaser.GameObjects.Container): void {
        const highlightBorder = card.getByName('highlightBorder') as Phaser.GameObjects.Rectangle;
        if (highlightBorder) {
            highlightBorder.setVisible(true);
        }
    }

    unhighlightCard(card: Phaser.GameObjects.Container): void {
        const highlightBorder = card.getByName('highlightBorder') as Phaser.GameObjects.Rectangle;
        if (highlightBorder) {
            highlightBorder.setVisible(false);
        }
    }

    moveCardToHand(card: Phaser.GameObjects.Container): void {
        if (!this.playerHand.includes(card)) {
            this.playerHand.push(card);
            this.battlefield = this.battlefield.filter(c => c !== card);
            (card as any).physicalCard.cardLocation = CardScreenLocation.HAND;
        }
        this.arrangeCards(this.playerHand, config.handY);
    }

    moveCardToBattlefield(card: Phaser.GameObjects.Container): void {
        if (!this.battlefield.includes(card)) {
            this.battlefield.push(card);
            this.playerHand = this.playerHand.filter(c => c !== card);
        }
        this.arrangeCards(this.battlefield, config.battlefieldY);
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
