import { Scene } from 'phaser';
import { PhysicalCard } from '../../../../ui/PhysicalCard';
import { CardGuiUtils } from '../../../../utils/CardGuiUtils';
import { CampaignState } from '../CampaignState';
import { FactoryCard } from '../FactoryCard';
import { AbstractHqPanel } from './AbstractHqPanel';

export class InvestmentPanel extends AbstractHqPanel {
    private availableFactories: PhysicalCard[] = [];
    private ownedFactories: PhysicalCard[] = [];

    constructor(scene: Scene) {
        super(scene, 'Factory Investments');
        this.displayFactories();
    }

    private clearCards(): void {
        [...this.availableFactories, ...this.ownedFactories].forEach(card => {
            card.destroy();
        });
        this.availableFactories = [];
        this.ownedFactories = [];
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

    private setupFactoryCardEvents(card: PhysicalCard): void {
        card.container.setInteractive()
            .on('pointerover', () => {
                card.setGlow(true);
            })
            .on('pointerout', () => {
                card.setGlow(false);
            })
            .on('pointerdown', () => {
                this.handleFactoryCardClick(card);
            });
    }

    private handleFactoryCardClick(card: PhysicalCard): void {
        const factory = card.data as FactoryCard;
        const campaignState = CampaignState.getInstance();

        if (!campaignState.ownedFactories.includes(factory) && 
            campaignState.getCurrentFunds() >= factory.purchaseCost) {
            campaignState.availableFactories = campaignState.availableFactories
                .filter(f => f !== factory);
            campaignState.ownedFactories.push(factory);
            this.clearCards();
            this.displayFactories();
        }
    }

    update(): void {
        // Update any dynamic content
    }
} 