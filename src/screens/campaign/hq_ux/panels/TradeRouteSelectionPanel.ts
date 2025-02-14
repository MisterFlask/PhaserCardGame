import { Scene } from 'phaser';
import { GameState } from '../../../../rules/GameState';
import { TextBoxButton } from '../../../../ui/Button';
import { PhysicalCard } from '../../../../ui/PhysicalCard';
import { UIContext } from '../../../../ui/UIContextManager';
import { CardGuiUtils } from '../../../../utils/CardGuiUtils';
import { AbstractTradeRoute } from '../AbstractTradeRoute';
import { CampaignUiState } from '../CampaignUiState';
import { AbstractHqPanel } from './AbstractHqPanel';

export class TradeRouteSelectionPanel extends AbstractHqPanel {
    private tradeRouteCards: PhysicalCard[] = [];
    private detailsContainer: Phaser.GameObjects.Container;
    private modifierButtons: TextBoxButton[] = []; // Track modifier buttons separately

    constructor(scene: Scene) {
        super(scene, 'Trade Route Selection');

        this.detailsContainer = this.scene.add.container(0, 0);
        this.detailsContainer.setVisible(false);
        this.add(this.detailsContainer);

        this.displayTradeRoutes();
    }

    private displayTradeRoutes(): void {
        // Clear existing trade route cards
        this.tradeRouteCards.forEach(card => card.obliterate());
        this.tradeRouteCards = [];

        const campaignState = CampaignUiState.getInstance();
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
                CampaignUiState.getInstance().selectedTradeRoute = card.data as AbstractTradeRoute;
            })
            .on('pointerout', () => {
                card.setGlow(false);
                this.hideRouteDetails();
            })
            .on('pointerdown', () => {
                CampaignUiState.getInstance().selectedTradeRoute = card.data as AbstractTradeRoute;
                GameState.getInstance().currentRoute = card.data as AbstractTradeRoute;
                this.scene.events.emit('routeSelected', card.data);
                this.hide();
                this.scene.events.emit('navigate', 'loadout');
            });
    }

    private showRouteDetails(card: PhysicalCard): void {
        this.hideRouteDetails(); // Clean up existing details first
        const route = card.data as AbstractTradeRoute;

        // Create detailed view of route modifiers
        this.modifierButtons = route.buffs.map((modifier, index) => {
            const button = new TextBoxButton({
                scene: this.scene,
                x: this.scene.scale.width * 0.75,
                y: this.scene.scale.height * (0.3 + index * 0.1),
                width: 300,
                height: 40,
                text: `${modifier.getDisplayName()}: ${modifier.getDescription()}`,
                style: { fontSize: '16px', color: '#ffffff' },
                fillColor: 0x333333
            });
            this.scene.add.existing(button);
            return button;
        });

        this.detailsContainer.add(this.modifierButtons);
        this.detailsContainer.setVisible(true);
    }

    private hideRouteDetails(): void {
        // Properly destroy all modifier buttons
        this.modifierButtons.forEach(button => {
            button.destroy();
        });
        this.modifierButtons = [];
        
        this.detailsContainer.removeAll();
        this.detailsContainer.setVisible(false);
    }

    public hide(): void {
        // Clean up trade route cards
        this.tradeRouteCards.forEach(card => {
            card.obliterate();
        });
        this.tradeRouteCards = [];

        // Clean up details
        this.hideRouteDetails();
        
        // Clean up the details container itself
        this.detailsContainer.destroy();

        super.hide();
    }

    update(): void {
        // Update any dynamic content
    }
} 