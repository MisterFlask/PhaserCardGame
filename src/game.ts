import Phaser from 'phaser';
import RandomImageLoader from './utils/ImageUtils';
import { AbstractCard, ArcaneRitualCard, CardData, CardType, FireballCard, SummonDemonCard, ToxicCloudCard } from './gamecharacters/CharacterClasses';


interface GameConfig {
    cardWidth: number;
    cardHeight: number;
    battlefieldY: number;
    handY: number;
    dividerY: number;
    gameWidth: number;
    gameHeight: number;
}

const unitData: CardData[] = [
    new AbstractCard({ name: 'Knight', description: 'A brave warrior', portraitName: 'flamer1', cardType: CardType.CHARACTER }),
    new AbstractCard({ name: 'Archer', description: 'Skilled with a bow', portraitName: 'flamer1', cardType: CardType.CHARACTER }),
    new AbstractCard({ name: 'Mage', description: 'Wields powerful magic', portraitName: 'flamer1', cardType: CardType.CHARACTER }),
];

class PhysicalCard {
    container: Phaser.GameObjects.Container;
    cardBackground: Phaser.GameObjects.Image;
    cardImage: Phaser.GameObjects.Image;
    nameBackground: Phaser.GameObjects.Rectangle;
    nameText: Phaser.GameObjects.Text;
    descText: Phaser.GameObjects.Text;
    descBackground: Phaser.GameObjects.Rectangle;
    tooltipBackground: Phaser.GameObjects.Rectangle;
    tooltipText: Phaser.GameObjects.Text;
    data: CardData;

    constructor({
        container,
        cardBackground,
        cardImage,
        nameBackground,
        nameText,
        descText,
        tooltipBackground,
        tooltipText,
        descBackground,
        data
    }: {
        container: Phaser.GameObjects.Container;
        cardBackground: Phaser.GameObjects.Image;
        cardImage: Phaser.GameObjects.Image;
        nameBackground: Phaser.GameObjects.Rectangle;
        nameText: Phaser.GameObjects.Text;
        descText: Phaser.GameObjects.Text;
        tooltipBackground: Phaser.GameObjects.Rectangle;
        tooltipText: Phaser.GameObjects.Text;
        descBackground: Phaser.GameObjects.Rectangle;
        data: CardData;
    }) {
        this.container = container;
        this.cardBackground = cardBackground;
        this.cardImage = cardImage;
        this.nameBackground = nameBackground;
        this.nameText = nameText;
        this.descText = descText;
        this.descBackground = descBackground;
        this.tooltipBackground = tooltipBackground;
        this.tooltipText = tooltipText;
        this.data = data;
    }
}

const cardData: CardData[] = [
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

class CardGame extends Phaser.Scene {
    private config: GameConfig;
    private playerHand: Phaser.GameObjects.Container[];
    private battlefield: Phaser.GameObjects.Container[];
    private playerUnits: Phaser.GameObjects.Container[];
    private backgroundImage!: Phaser.GameObjects.Image;
    private battlefieldArea!: Phaser.GameObjects.Rectangle;
    private handArea!: Phaser.GameObjects.Rectangle;

    constructor() {
        super('CardGame');
        this.config = {
            cardWidth: 120,
            cardHeight: 160,
            battlefieldY: 200,
            handY: 500,
            dividerY: 350,
            gameWidth: 800,
            gameHeight: 600
        };
        this.playerHand = [];
        this.battlefield = [];
        this.playerUnits = [];
    }

    createPlayerUnits(): void {
        unitData.forEach((data, index) => {
            const x = this.config.gameWidth - 100;
            const y = 100 + index * 180;
            const unit = this.createCard(x, y, data);
            (unit as any).isPlayerUnit = true;
            this.playerUnits.push(unit.container);
        });
    }

    preload(): void {
        this.load.setBaseURL('https://raw.githubusercontent.com/');
        this.load.image('card', 'photonstorm/phaser3-examples/master/public/assets/sprites/blue_ball.png');
        this.load.image('monster', 'photonstorm/phaser3-examples/master/public/assets/sprites/red_ball.png');
        new RandomImageLoader().loadAllImages(this.load);
    }

    create(): void {
        this.createGameAreas();
        this.createPlayerHand();
        this.createMonsterCard();
        this.setupEventListeners();
        this.createPlayerUnits();

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
            const card = this.createCard(x, y, data);
            this.playerHand.push(card.container);
        });
        this.arrangeCards(this.playerHand, this.config.handY);
    }
    createCard(x: number, y: number, data: CardData): PhysicalCard {
        const { cardWidth, cardHeight } = this.config;
        const cardContainer = this.add.container(x, y);
        const cardBackground = this.add.image(0, 0, 'greyscale').setDisplaySize(cardWidth, cardHeight);
        let cardTexture = data.portraitName;

        const cardImage = this.add.image(0, -cardHeight / 4, cardTexture)
            .setDisplaySize(cardWidth / 2, cardHeight / 2);

        const nameBackground = this.add.rectangle(0, cardHeight / 4, cardWidth - 10, 30, 0xffffff);
        const nameText = this.add.text(0, cardHeight / 4, data.name, { fontSize: '16px', color: '#000', wordWrap: { width: cardWidth - 10 } });
        
        // Modified to include both description and tooltip
        const descText = this.add.text(-cardWidth / 4, cardHeight / 2, data.description, { fontSize: '12px', color: '#000', wordWrap: { width: (cardWidth - 10) / 2 } });
        const tooltipText = this.add.text(cardWidth / 4, cardHeight / 2, data.tooltip || '', { fontSize: '12px', color: '#000', wordWrap: { width: (cardWidth - 10) / 2 } });
        const infoBackground = this.add.rectangle(0, cardHeight / 2, cardWidth - 10, 60, 0xffffff).setVisible(false).setStrokeStyle(2, 0x000000);

        nameText.setOrigin(0.5);
        descText.setOrigin(0.5);
        tooltipText.setOrigin(0.5);
        descText.setVisible(false);
        tooltipText.setVisible(false);

        cardContainer.add([cardBackground, cardImage, nameBackground, nameText, infoBackground, descText, tooltipText]);
        cardContainer.setSize(cardWidth, cardHeight);
        cardContainer.setInteractive();
        if (data.cardType == CardType.PLAYABLE) this.input.setDraggable(cardContainer);

        const physicalCard = new PhysicalCard({
            container: cardContainer,
            cardBackground: cardBackground,
            cardImage: cardImage,
            nameBackground: nameBackground,
            nameText: nameText,
            descText: descText,
            tooltipText: tooltipText,
            descBackground: infoBackground,
            tooltipBackground: infoBackground,//todo: fix this to be a different background thing
            data: data
        });

        this.setupCardEvents(physicalCard.container, physicalCard.descText, physicalCard.descBackground);

        return physicalCard;
    }


    createMonsterCard(): void {
        const monsterData: CardData = new AbstractCard({ name: 'Goblin', description: 'A small, mischievous creature', cardType: CardType.CHARACTER });
        const monsterCard = this.createCard(400, this.config.battlefieldY, monsterData);
        monsterCard.container.setDepth(1);
        this.battlefield.push(monsterCard.container);
    }

    setupCardEvents(card: Phaser.GameObjects.Container, descText: Phaser.GameObjects.Text, descBackground: Phaser.GameObjects.Rectangle): void {
        card.on('pointerover', () => {
            descText.setVisible(true);
            descBackground.setVisible(true);
            card.setDepth(1000);
        });
        card.on('pointerout', () => {
            descText.setVisible(false);
            descBackground.setVisible(false);
            card.setDepth((card as any).originalDepth);
        });
    }

    setupEventListeners(): void {
        this.input.on('drag', this.handleDrag, this);
        this.input.on('dragend', this.handleDragEnd, this);
        this.input.on('gameobjectover', this.handleGameObjectOver, this);
    }

    handleDrag(pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.Container, dragX: number, dragY: number): void {
        gameObject.x = dragX;
        gameObject.y = dragY;

        const inBattlefield = dragY < this.config.dividerY;
        this.battlefieldArea.setVisible(inBattlefield);
        this.handArea.setVisible(!inBattlefield);
    }

    handleDragEnd(pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.Container): void {
        if ((gameObject as any)?.data?.cardType === CardType.CHARACTER) return;

        const inHand = gameObject.y > this.config.dividerY;
        if (inHand) {
            this.moveCardToHand(gameObject);
        } else {
            this.moveCardToBattlefield(gameObject);
        }

        this.battlefieldArea.setVisible(false);
        this.handArea.setVisible(false);
    }

    handleGameObjectOver(pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.GameObject): void {
        if (gameObject.type === 'Container') {
            this.children.bringToTop(gameObject);
        }
    }

    moveCardToHand(card: Phaser.GameObjects.Container): void {
        if (!this.playerHand.includes(card)) {
            this.playerHand.push(card);
            this.battlefield = this.battlefield.filter(c => c !== card);
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
    scene: CardGame
};

const game = new Phaser.Game(config);