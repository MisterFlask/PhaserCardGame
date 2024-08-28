import Phaser from 'phaser';
import GameImageLoader from '../utils/ImageUtils';
import { ArcaneRitualCard, BaseCharacter, FireballCard, GoblinCharacter, SummonDemonCard, ToxicCloudCard } from '../gamecharacters/CharacterClasses';
import { AbstractCard, CardType, PhysicalCard, CardScreenLocation } from '../gamecharacters/PhysicalCard';
import { CardGuiUtils, GameConfig } from '../utils/CardGuiUtils';
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
    private config: GameConfig;
    private drawPile!: Phaser.GameObjects.Container;
    private discardPile!: Phaser.GameObjects.Container;
    private drawPileCount: number = 30;
    private discardPileCount: number = 0;
    private encounter!: EncounterData;
    
    constructor() {
        super('CombatScene');
        this.config = new CardGuiUtils().config;
        this.playerHand = [];
        this.battlefield = [];
        this.playerUnits = [];
        this.highlightedCard = null;
        this.draggedCard = null;
    }

    init(data: { encounter: EncounterData }) {
        this.encounter = data.encounter;
    }
    
    createPlayerUnits(): void {
        unitData.forEach((data, index) => {
            const x = this.config.gameWidth - 100;
            const y = 100 + index * 180;
            const unit = new CardGuiUtils().createCard({
                scene: this,
                x: x,
                y: y,
                data: data,
                location: CardScreenLocation.CHARACTER_ROSTER,
                eventCallback: this.setupCardEvents
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
        this.createGameAreas();
        this.createPlayerHand();
        this.createEnemyCards();
        this.setupEventListeners();
        this.createPlayerUnits();
        this.createMenu();
        this.createDrawAndDiscardPiles();

        this.scale.on('resize', this.resize, this);
        this.resize();
    }

    createGameAreas(): void {
        const { gameWidth, gameHeight, battlefieldY, handY } = this.config;
        this.backgroundImage = this.add.image(gameWidth / 2, gameHeight / 2, 'battleback1').setOrigin(0.5);
        this.backgroundImage.setDisplaySize(gameWidth, gameHeight);
        this.backgroundImage.setDepth(-1);

        this.battlefieldArea = this.add.rectangle(gameWidth / 2, battlefieldY, gameWidth - 100, 300).setStrokeStyle(4, 0xffff00);
        this.handArea = this.add.rectangle(gameWidth / 2, handY, gameWidth - 100, 300).setStrokeStyle(4, 0x00ff00);
        this.battlefieldArea.setVisible(false);
        this.handArea.setVisible(false);
    }

    createPlayerHand(): void {
        cardData.forEach((data, index) => {
            const x = 100 + index * 150;
            const y = this.config.handY;
            const card = new CardGuiUtils().createCard({
                scene: this,
                x: x,
                y: y,
                data: data,
                location: CardScreenLocation.HAND,
                eventCallback: this.setupCardEvents
            });
            this.playerHand.push(card.container);
        });
        this.arrangeCards(this.playerHand, this.config.handY);
    }

    createDrawAndDiscardPiles(): void {
        const pileY = this.config.gameHeight - 100;
        
        // Create Draw Pile
        this.drawPile = this.add.container(100, pileY);
        const drawCard = new CardGuiUtils().createCard({
            scene: this,
            x: 0,
            y: 0,
            data: new AbstractCard({ name: 'Draw Pile', description: 'Cards to draw' }),
            location: CardScreenLocation.DRAW_PILE,
            eventCallback: this.setupCardEvents
        });
        const drawCountText = this.add.text(50, 0, this.drawPileCount.toString(), { fontSize: '24px', color: '#fff' });
        this.drawPile.add([drawCard.container, drawCountText]);

        // Create Discard Pile
        this.discardPile = this.add.container(250, pileY);
        const discardCard = new CardGuiUtils().createCard({
            scene: this,
            x: 0,
            y: 0,
            data: new AbstractCard({ name: 'Discard Pile', description: 'Discarded cards' }),
            location: CardScreenLocation.DISCARD_PILE,
            eventCallback: this.setupCardEvents
        });
        const discardCountText = this.add.text(50, 0, this.discardPileCount.toString(), { fontSize: '24px', color: '#fff' });
        this.discardPile.add([discardCard.container, discardCountText]);
    }

    createEnemyCards(): void {
        if (this.encounter && this.encounter.enemies) {
            this.encounter.enemies.forEach((enemy, index) => {
                const enemyCard = new CardGuiUtils().createCard({
                    scene: this,
                    x: 400 + index * 150,
                    y: this.config.battlefieldY,
                    data: enemy,
                    location: CardScreenLocation.BATTLEFIELD,
                    eventCallback: this.setupCardEvents
                });
                enemyCard.container.setDepth(1);
                this.battlefield.push(enemyCard.container);
            });
        }
    }

    setupCardEvents(card: PhysicalCard): void {
        card.container.on('pointerover', () => {
            card.descBox.setVisible(true);
            card.tooltipBox.setVisible(true);
            card.container.setDepth(1000);
        });
        card.container.on('pointerout', () => {
            card.descBox.setVisible(false);
            card.tooltipBox.setVisible(false);
            card.container.setDepth((card.container as any).originalDepth);
        });
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

        const inBattlefield = dragY < this.config.dividerY;
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

        const inHand = gameObject.y > this.config.dividerY;
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
        this.arrangeCards(this.playerHand, this.config.handY);
    }

    moveCardToBattlefield(card: Phaser.GameObjects.Container): void {
        if (!this.battlefield.includes(card)) {
            this.battlefield.push(card);
            this.playerHand = this.playerHand.filter(c => c !== card);
        }
        this.arrangeCards(this.battlefield, this.config.battlefieldY);
    }

    arrangeCards(cardArray: Phaser.GameObjects.Container[], yPosition: number): void {
        const { gameWidth, cardWidth } = this.config;
        const totalWidth = gameWidth - 200;
        const cardSpacing = Math.min(cardWidth, totalWidth / (cardArray.length + 1));

        cardArray.forEach((card, index) => {
            card.x = 100 + index * cardSpacing;
            card.y = yPosition;
            (card as any).originalDepth = index;
            card.depth = index;
        });
    }

    resize(): void {
        if (!this.scene.isActive('CardGame')) {
            return;
        }

        const { width, height } = this.scale;
        this.cameras.main.setViewport(0, 0, width, height);

        this.updateLayout(width, height);

        this.updateBackgroundSize(width, height);
    }

    updateLayout(width: number, height: number): void {
        this.config.gameWidth = width;
        this.config.gameHeight = height;
        this.config.battlefieldY = height * 0.33;
        this.config.handY = height * 0.83;
        this.config.dividerY = height * 0.58;

        this.createGameAreas();

        this.arrangeCards(this.playerHand, this.config.handY);
        this.arrangeCards(this.battlefield, this.config.battlefieldY);
        this.playerUnits.forEach((unit, index) => {
            unit.x = this.config.gameWidth - 100;
            unit.y = 100 + index * 180;
        });
    }

    updateBackgroundSize(width: number, height: number): void {
        if (this.backgroundImage) {
            this.backgroundImage.setDisplaySize(width, height);
            this.backgroundImage.setPosition(width / 2, height / 2);
        }
    }
}

const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    scale: {
        mode: Phaser.Scale.RESIZE,
        parent: 'phaser-example',
        width: '100%',
        height: '100%'
    },
    scene: [CampaignScene, CombatScene, MapScene]
};

const game = new Phaser.Game(config);



