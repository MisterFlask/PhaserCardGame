import { Scene } from 'phaser';
import { PlayableCard } from '../../../../gamecharacters/PlayableCard';
import { TextBoxButton } from '../../../../ui/Button';
import { PhysicalCard } from '../../../../ui/PhysicalCard';
import { CardGuiUtils } from '../../../../utils/CardGuiUtils';
import { CampaignState } from '../CampaignState';
import { FactoryCard } from '../FactoryCard';
import { AbstractHqPanel } from './AbstractHqPanel';

export class InvestmentPanel extends AbstractHqPanel {
    private availableFactories: PhysicalCard[] = [];
    private ownedFactories: PhysicalCard[] = [];
    private tradeGoods: PhysicalCard[] = [];
    private ownedTradeGoods: PhysicalCard[] = [];
    private currentTab: 'factories' | 'goods' = 'factories';
    private tabButtons: Map<string, TextBoxButton> = new Map();
    private tradeGoodsContainer: Phaser.GameObjects.Container ;
    private ownedGoodsContainer: Phaser.GameObjects.Container ;

    constructor(scene: Scene) {
        super(scene, 'Investment & Factory');

        // Create containers for trade goods sections
        this.tradeGoodsContainer = this.scene.add.container(0, 0);
        this.ownedGoodsContainer = this.scene.add.container(0, 0);
        this.add([this.tradeGoodsContainer, this.ownedGoodsContainer]);

        this.createTabs();
        this.showFactoriesTab();
    }

    private createTabs(): void {
        const tabConfig = {
            width: 150,
            height: 40,
            style: { fontSize: '16px', color: '#ffffff' }
        };

        // Create Factory Investments tab
        const factoryTab = new TextBoxButton({
            scene: this.scene,
            x: this.scene.scale.width * 0.3,
            y: 80,
            text: 'Factory Investments',
            fillColor: 0x444444,
            ...tabConfig
        });
        factoryTab.onClick(() => this.showFactoriesTab());

        // Create Trade Goods tab
        const goodsTab = new TextBoxButton({
            scene: this.scene,
            x: this.scene.scale.width * 0.7,
            y: 80,
            text: 'Trade Goods',
            fillColor: 0x444444,
            ...tabConfig
        });
        goodsTab.onClick(() => this.showGoodsTab());

        this.tabButtons.set('factories', factoryTab);
        this.tabButtons.set('goods', goodsTab);

        this.add([factoryTab, goodsTab]);
    }

    private showFactoriesTab(): void {
        this.currentTab = 'factories';
        this.updateTabVisuals();
        this.clearCards();
        this.displayFactories();
    }

    private showGoodsTab(): void {
        this.currentTab = 'goods';
        this.updateTabVisuals();
        this.clearCards();
        this.displayTradeGoods();
    }

    private updateTabVisuals(): void {
        this.tabButtons.forEach((button, tabName) => {
            button.setFillColor(tabName === this.currentTab ? 0x666666 : 0x444444);
        });
    }

    private clearCards(): void {
        [...this.availableFactories, ...this.ownedFactories, ...this.tradeGoods, ...this.ownedTradeGoods].forEach(card => {
            card.destroy();
        });
        this.availableFactories = [];
        this.ownedFactories = [];
        this.tradeGoods = [];
        this.ownedTradeGoods = [];
    }

    private displayFactories(): void {
        const campaignState = CampaignState.getInstance();
        const cardSpacing = 20;
        const startY = 150;

        // Display available factories on the left
        campaignState.availableFactories.forEach((factory, index) => {
            const card = this.createFactoryCard(factory, 
                this.scene.scale.width * 0.25,
                startY + index * (cardSpacing + 150)
            );
            this.availableFactories.push(card);
        });

        // Display owned factories on the right
        campaignState.ownedFactories.forEach((factory, index) => {
            const card = this.createFactoryCard(factory,
                this.scene.scale.width * 0.75,
                startY + index * (cardSpacing + 150)
            );
            this.ownedFactories.push(card);
        });
    }

    private displayTradeGoods(): void {
        const gameState = CampaignState.getInstance();
        const cardSpacing = 20;
        const startY = 150;
        const cardsPerRow = 4;

        // Clear existing containers
        this.tradeGoodsContainer.removeAll(true);
        this.ownedGoodsContainer.removeAll(true);

        // Create section for available trade goods
        const availableSection = this.createSection(
            'Available Trade Goods',
            0,
            startY - 40,
            this.scene.scale.width,
            300
        );
        this.tradeGoodsContainer.add(availableSection);

        // Display available trade goods
        gameState.availableTradeGoods.forEach((good, index) => {
            const row = Math.floor(index / cardsPerRow);
            const col = index % cardsPerRow;
            const x = this.scene.scale.width * (0.2 + col * 0.2);
            const y = startY + row * (cardSpacing + 150);

            const card = this.createTradeGoodCard(good, x, y);
            this.tradeGoods.push(card);
            this.tradeGoodsContainer.add(card.container);
        });

        // Create section for owned trade goods
        const ownedSection = this.createSection(
            'Owned Trade Goods',
            0,
            this.scene.scale.height - 250,
            this.scene.scale.width,
            200
        );
        this.ownedGoodsContainer.add(ownedSection);

        // Display owned trade goods
        gameState.ownedTradeGoods.forEach((good, index) => {
            const x = this.scene.scale.width * (0.2 + (index % cardsPerRow) * 0.2);
            const y = this.scene.scale.height - 200;

            const card = this.createTradeGoodCard(good, x, y);
            this.ownedTradeGoods.push(card);
            this.ownedGoodsContainer.add(card.container);
        });
    }

    private createSection(title: string, x: number, y: number, width: number, height: number): Phaser.GameObjects.Container  {
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

    private createFactoryCard(factory: FactoryCard, x: number, y: number): PhysicalCard {
        const card = CardGuiUtils.getInstance().createCard({
            scene: this.scene,
            x,
            y,
            data: factory,
            onCardCreatedEventCallback: (card) => this.setupFactoryCardEvents(card)
        });
        this.add(card.container);
        return card;
    }

    private createTradeGoodCard(good: PlayableCard, x: number, y: number): PhysicalCard {
        const card = CardGuiUtils.getInstance().createCard({
            scene: this.scene,
            x,
            y,
            data: good,
            onCardCreatedEventCallback: (card) => this.setupTradeGoodCardEvents(card)
        });
        this.add(card.container);
        return card;
    }

    private setupFactoryCardEvents(card: PhysicalCard): void {
        card.container.setInteractive()
            .on('pointerover', () => {
                card.highlight();
            })
            .on('pointerout', () => {
                card.unhighlight();
            })
            .on('pointerdown', () => {
                this.handleFactoryCardClick(card);
            });
    }

    private setupTradeGoodCardEvents(card: PhysicalCard): void {
        card.container.setInteractive()
            .on('pointerover', () => {
                card.highlight();
            })
            .on('pointerout', () => {
                card.unhighlight();
            })
            .on('pointerdown', () => {
                this.handleTradeGoodCardClick(card);
            });
    }

    private handleFactoryCardClick(card: PhysicalCard): void {
        const factory = card.data as FactoryCard;
        const campaignState = CampaignState.getInstance();

        if (!campaignState.ownedFactories.includes(factory) && 
            campaignState.getCurrentFunds() >= factory.purchaseCost) {
            // Purchase the factory
            campaignState.availableFactories = campaignState.availableFactories
                .filter(f => f !== factory);
            campaignState.ownedFactories.push(factory);
            this.showFactoriesTab(); // Refresh display
        }
    }

    private handleTradeGoodCardClick(card: PhysicalCard): void {
        const good = card.data as PlayableCard;
    const campaignState = CampaignState.getInstance();

    if (!campaignState.ownedTradeGoods.includes(good) && 
        campaignState.getCurrentFunds() >= good.surfacePurchaseValue) {
        // Purchase the trade good
        campaignState.availableTradeGoods = campaignState.availableTradeGoods
            .filter(g => g !== good);
            campaignState.ownedTradeGoods.push(good);
            this.scene.events.emit("tradeGoodsChanged");
            this.showGoodsTab(); // Refresh display
        }
    }

    update(): void {
        // Update any dynamic content
    }
} 