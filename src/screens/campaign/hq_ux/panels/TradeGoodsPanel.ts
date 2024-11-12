import { Scene } from 'phaser';
import { PlayableCard } from '../../../../gamecharacters/PlayableCard';
import { PhysicalCard } from '../../../../ui/PhysicalCard';
import { CardGuiUtils } from '../../../../utils/CardGuiUtils';
import { CampaignState } from '../CampaignState';
import { AbstractHqPanel } from './AbstractHqPanel';

export class TradeGoodsPanel extends AbstractHqPanel {
    private tradeGoods: PhysicalCard[] = [];
    private ownedTradeGoods: PhysicalCard[] = [];
    private tradeGoodsContainer: Phaser.GameObjects.Container;
    private ownedGoodsContainer: Phaser.GameObjects.Container;

    constructor(scene: Scene) {
        super(scene, 'Trade Goods');

        this.tradeGoodsContainer = this.scene.add.container(0, 0);
        this.ownedGoodsContainer = this.scene.add.container(0, 0);
        this.add([this.tradeGoodsContainer, this.ownedGoodsContainer]);

        this.displayTradeGoods();
    }

    private createSection(title: string, x: number, y: number, width: number, height: number): Phaser.GameObjects.Container {
        const container = this.scene.add.container(x, y);

        // Add border
        const border = this.scene.add.rectangle(0, 0, width, height, 0x666666);
        border.setStrokeStyle(2, 0x888888);
        border.setOrigin(0, 0);

        // Add title
        const titleText = this.scene.add.text(10, 10, title, {
            fontSize: '20px',
            color: '#ffffff',
            backgroundColor: '#444444',
            padding: { x: 10, y: 5 }
        });

        container.add([border, titleText]);
        return container;
    }

    private createTradeGoodCard(good: PlayableCard, x: number, y: number): PhysicalCard {
        const card = CardGuiUtils.getInstance().createCard({
            scene: this.scene,
            x,
            y,
            data: good,
            onCardCreatedEventCallback: (card) => this.setupTradeGoodCardEvents(card)
        });
        return card;
    }

    private setupTradeGoodCardEvents(card: PhysicalCard): void {
        card.setInteractive(true)
            .on('pointerdown', () => {
                this.handleTradeGoodCardClick(card);
            });
    }

    private handleTradeGoodCardClick(card: PhysicalCard): void {
        const good = card.data as PlayableCard;
        const campaignState = CampaignState.getInstance();

        if (!campaignState.ownedTradeGoods.includes(good) && 
            campaignState.getCurrentFunds() >= good.surfacePurchaseValue) {
            campaignState.availableTradeGoods = campaignState.availableTradeGoods
                .filter(g => g !== good);
            campaignState.ownedTradeGoods.push(good);
            this.scene.events.emit("tradeGoodsChanged");
            this.displayTradeGoods();
        }
    }

    private displayTradeGoods(): void {
        const gameState = CampaignState.getInstance();
        const cardSpacing = 20;
        const startY = 150;
        const cardsPerRow = 4;

        // Clear existing cards
        this.tradeGoods.forEach(card => card.destroy());
        this.ownedTradeGoods.forEach(card => card.destroy());
        this.tradeGoods = [];
        this.ownedTradeGoods = [];

        this.tradeGoodsContainer.removeAll(true);
        this.ownedGoodsContainer.removeAll(true);

        const availableSection = this.createSection(
            'Available Trade Goods',
            0,
            startY - 40,
            this.scene.scale.width,
            300
        );
        this.tradeGoodsContainer.add(availableSection);

        gameState.availableTradeGoods.forEach((good, index) => {
            const row = Math.floor(index / cardsPerRow);
            const col = index % cardsPerRow;
            const x = this.scene.scale.width * (0.2 + col * 0.2);
            const y = startY + row * (cardSpacing + 150);

            const card = this.createTradeGoodCard(good, x, y);
            this.tradeGoods.push(card);
            this.tradeGoodsContainer.add(card.container);
        });

        const ownedSection = this.createSection(
            'Owned Trade Goods',
            0,
            this.scene.scale.height - 250,
            this.scene.scale.width,
            200
        );
        this.ownedGoodsContainer.add(ownedSection);

        gameState.ownedTradeGoods.forEach((good, index) => {
            const x = this.scene.scale.width * (0.2 + (index % cardsPerRow) * 0.2);
            const y = this.scene.scale.height - 200;

            const card = this.createTradeGoodCard(good, x, y);
            this.ownedTradeGoods.push(card);
            this.ownedGoodsContainer.add(card.container);
        });
    }

    update(): void {
        // Update any dynamic content if needed
    }
} 