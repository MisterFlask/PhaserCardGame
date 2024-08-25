import Phaser from 'phaser';
import RandomImageLoader from './ImageUtils';

interface CardData {
    name: string;
    description: string;
    cardType: CardType;
    portraitName: string;
}

enum CardType{
    CHARACTER = "CHARACTER",
    PLAYABLE = "PLAYABLE"
}

class BaseCardBehavior implements CardData {
    name: string
    description: string
    portraitName: string
    cardType: CardType

    constructor({ name, description, portraitName, cardType }: { name: string; description: string; portraitName?: string, cardType?: CardType }) {
        this.name = name
        this.description = description
        this.portraitName = portraitName || "flamer1"
        this.cardType = cardType || CardType.PLAYABLE
    }
}

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
    new BaseCardBehavior({ name: 'Knight', description: 'A brave warrior', portraitName: 'flamer1', cardType: CardType.CHARACTER }),
    new BaseCardBehavior({ name: 'Archer', description: 'Skilled with a bow', portraitName: 'flamer1', cardType: CardType.CHARACTER }),
    new BaseCardBehavior({ name: 'Mage', description: 'Wields powerful magic', portraitName: 'flamer1', cardType: CardType.CHARACTER }),
];

const cardData: CardData[] = [
    new BaseCardBehavior({ name: 'Fireball', description: 'Deals 3 damage to target' }),
    new BaseCardBehavior({ name: 'Healing Touch', description: 'Restores 2 health' }),
    new BaseCardBehavior({ name: 'Stone Wall', description: 'Summons a defensive barrier' }),
    new BaseCardBehavior({ name: 'Lightning Bolt', description: 'Strikes for 2 damage' }),
    new BaseCardBehavior({ name: 'Nature\'s Blessing', description: 'Grants 1 extra mana' }),
    new BaseCardBehavior({ name: 'Nature\'s Blessing', description: 'Grants 1 extra mana' }),
    new BaseCardBehavior({ name: 'Nature\'s Blessing', description: 'Grants 1 extra mana' }),
    new BaseCardBehavior({ name: 'Nature\'s Blessing', description: 'Grants 1 extra mana' })
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
            this.playerUnits.push(unit);
        });
    }

    preload(): void {
        this.load.setBaseURL('https://raw.githubusercontent.com/');
        this.load.image('card', 'photonstorm/phaser3-examples/master/public/assets/sprites/blue_ball.png');
        this.load.image('card_bg', 'photonstorm/phaser3-examples/master/public/assets/sprites/white_square.png');
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
            this.playerHand.push(card);
        });
        this.arrangeCards(this.playerHand, this.config.handY);
    }

    createCard(x: number, y: number, data: CardData): Phaser.GameObjects.Container {
        const { cardWidth, cardHeight } = this.config;
        const cardContainer = this.add.container(x, y);
        const cardBackground = this.add.image(0, 0, 'card_bg').setDisplaySize(cardWidth, cardHeight);
        let cardTexture = data.portraitName

        const cardImage = this.add.image(0, -cardHeight / 4, cardTexture)
            .setDisplaySize(cardWidth / 2, cardHeight / 2);

        const nameBackground = this.add.rectangle(0, cardHeight / 4, cardWidth - 10, 30, 0xffffff);
        const nameText = this.add.text(0, cardHeight / 4, data.name, { fontSize: '16px', color: '#000', wordWrap: { width: cardWidth - 10 } });
        const descText = this.add.text(0, cardHeight / 2, data.description, { fontSize: '12px', color: '#000', wordWrap: { width: cardWidth - 10 } });
        const descBackground = this.add.rectangle(0, cardHeight / 2, cardWidth - 10, 60, 0xffffff).setVisible(false);

        nameText.setOrigin(0.5);
        descText.setOrigin(0.5);
        descText.setVisible(false);

        cardContainer.add([cardBackground, cardImage, nameBackground, nameText, descBackground, descText]);
        cardContainer.setSize(cardWidth, cardHeight);
        cardContainer.setInteractive();
        if (data.cardType == CardType.PLAYABLE) this.input.setDraggable(cardContainer);

        (cardContainer as any).data = data;

        this.setupCardEvents(cardContainer, descText, descBackground);

        return cardContainer;
    }


    createMonsterCard(): void {
        const monsterData: CardData = new BaseCardBehavior({ name: 'Goblin', description: 'A small, mischievous creature', cardType: CardType.CHARACTER });
        const monsterCard = this.createCard(400, this.config.battlefieldY, monsterData);
        monsterCard.setDepth(1);
        this.battlefield.push(monsterCard);
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