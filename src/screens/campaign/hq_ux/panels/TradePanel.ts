import { Scene } from 'phaser';
import { TextBoxButton } from '../../../../ui/Button';
import { PhysicalCard } from '../../../../ui/PhysicalCard';
import { UIContext } from '../../../../ui/UIContextManager';
import { CardGuiUtils } from '../../../../utils/CardGuiUtils';
import { AbstractTradeRoute } from '../AbstractTradeRoute';
import { CampaignState } from '../CampaignState';
import { AbstractHqPanel } from './AbstractHqPanel';

export class TradeRouteSelectionPanel extends AbstractHqPanel {
    private tradeRouteCards: PhysicalCard[] = [];
    private detailsContainer: Phaser.GameObjects.Container;

    constructor(scene: Scene) {
        super(scene, 'Trade Route Selection');

        this.detailsContainer = this.scene.add.container(0, 0);
        this.detailsContainer.setVisible(false);
        this.add(this.detailsContainer);

        this.displayTradeRoutes();
    }

    private displayTradeRoutes(): void {
        // Clear existing trade route cards
        this.tradeRouteCards.forEach(card => card.destroy());
        this.tradeRouteCards = [];

        const campaignState = CampaignState.getInstance();
        const routes = campaignState.availableTradeRoutes;

        // Display 3 routes side by side
        routes.slice(0, 3).forEach((route, index) => {
            const card = this.createTradeRouteCard(
                route,
                this.scene.scale.width * (0.25 + index * 0.25),
                this.scene.scale.height * 0.4
            );
            this.tradeRouteCards.push(card);
        });
    }

    private createTradeRouteCard(route: AbstractTradeRoute, x: number, y: number): PhysicalCard {
        
        const physicalCard = CardGuiUtils.getInstance().createCard(
            {
                scene: this.scene,
                x: x,
                y: y,
                data: route,
                contextRelevant: UIContext.CAMPAIGN_HQ
            }
        );

        this.setupTradeRouteCardEvents(physicalCard);
        this.add(physicalCard.container);
        return physicalCard;
    }

    private setupTradeRouteCardEvents(card: PhysicalCard): void {
        card.container.setInteractive()
            .on('pointerover', () => {
                card.setGlow(true);
                this.showRouteDetails(card);
                CampaignState.getInstance().selectedTradeRoute = card.data as AbstractTradeRoute;
            })
            .on('pointerout', () => {
                card.setGlow(false);
                this.hideRouteDetails();
            })
            .on('pointerdown', () => {
                const campaignState = CampaignState.getInstance();
                this.scene.events.emit('routeSelected', card.data);
                this.returnToHub();
            });
    }

    private showRouteDetails(card: PhysicalCard): void {
        this.detailsContainer.removeAll();
        const route = card.data as AbstractTradeRoute;

        // Create detailed view of route modifiers
        const modifierDetails = route.buffs.map((modifier, index) => {
            return new TextBoxButton({
                scene: this.scene,
                x: this.scene.scale.width * 0.75,
                y: this.scene.scale.height * (0.3 + index * 0.1),
                width: 300,
                height: 40,
                text: `${modifier.getName()}: ${modifier.getDescription()}`,
                style: { fontSize: '16px', color: '#ffffff' },
                fillColor: 0x333333
            });
        });

        this.detailsContainer.add(modifierDetails);
        this.detailsContainer.setVisible(true);
    }

    private hideRouteDetails(): void {
        this.detailsContainer.setVisible(false);
    }

    update(): void {
        // Update any dynamic content
    }
} 