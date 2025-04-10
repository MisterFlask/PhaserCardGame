import { Scene } from 'phaser';
import { GameState } from '../../../../rules/GameState';
import { AbstractStrategicProject } from '../../../../strategic_projects/AbstractStrategicProject';
import { PhysicalCard } from '../../../../ui/PhysicalCard';
import { TextBox } from '../../../../ui/TextBox';
import { CardGuiUtils } from '../../../../utils/CardGuiUtils';
import { CampaignUiState } from '../CampaignUiState';
import { AbstractHqPanel } from './AbstractHqPanel';

export class InvestmentPanel extends AbstractHqPanel {
    private availableFactories: PhysicalCard[] = [];
    private ownedFactories: PhysicalCard[] = [];
    private titleTextBox: TextBox;
    private availableSectionText: TextBox;
    private ownedSectionText: TextBox;
    private poundsDisplay: TextBox;

    constructor(scene: Scene) {
        super(scene, 'Factory Investments', 'investments-screen');
        
        // Add title TextBox
        this.titleTextBox = new TextBox({
            scene: scene,
            x: scene.scale.width / 2,
            y: 50,
            width: 400,
            text: 'STRATEGIC INVESTMENTS',
            style: { fontSize: '28px', fontFamily: 'verdana' }
        });
        this.add(this.titleTextBox);

        // Add section headers
        this.availableSectionText = new TextBox({
            scene: scene,
            x: scene.scale.width * 0.25,
            y: 100,
            width: 300,
            text: 'AVAILABLE FOR PURCHASE',
            style: { fontSize: '20px', fontFamily: 'verdana', color: '#FFD700' }
        });
        this.add(this.availableSectionText);

        this.ownedSectionText = new TextBox({
            scene: scene,
            x: scene.scale.width * 0.75,
            y: 100,
            width: 300,
            text: 'OWNED INVESTMENTS',
            style: { fontSize: '20px', fontFamily: 'verdana', color: '#32CD32' }
        });
        this.add(this.ownedSectionText);
        
        // Add British Pounds Sterling display in upper right
        this.poundsDisplay = new TextBox({
            scene: scene,
            x: scene.scale.width - 150,
            y: 40,
            width: 250,
            text: `£${GameState.getInstance().britishPoundsSterling}`,
            style: { fontSize: '24px', fontFamily: 'verdana', color: '#FFD700', align: 'right' }
        });
        this.add(this.poundsDisplay);
        
        // Listen for funds changed events
        scene.events.on('fundsChanged', this.updatePoundsDisplay, this);
        
        this.displayFactories();
    }

    private updatePoundsDisplay(): void {
        this.poundsDisplay.setText(`£${GameState.getInstance().britishPoundsSterling}`);
    }

    private clearCards(): void {
        [...this.availableFactories, ...this.ownedFactories].forEach(card => {
            card.obliterate();
        });
        this.availableFactories = [];
        this.ownedFactories = [];
    }

    private displayFactories(): void {
        const campaignState = CampaignUiState.getInstance();
        const cardSpacing = 20;
        const startY = 350;

        // Display available factories on the left
        campaignState.availableStrategicProjects.forEach((factory, index) => {
            const card = this.createFactoryCard(factory, 
                this.scene.scale.width * 0.25,
                startY + index * (cardSpacing + 150),
                false
            );
            this.availableFactories.push(card);
        });

        // Display owned factories on the right
        campaignState.ownedStrategicProjects.forEach((factory, index) => {
            const card = this.createFactoryCard(factory,
                this.scene.scale.width * 0.75,
                startY + index * (cardSpacing + 150),
                true
            );
            this.ownedFactories.push(card);
        });
    }

    private createFactoryCard(factory: AbstractStrategicProject, x: number, y: number, isOwned: boolean): PhysicalCard {
        const card = CardGuiUtils.getInstance().createCard({
            scene: this.scene,
            x,
            y,
            data: factory,
            onCardCreatedEventCallback: (card) => this.setupFactoryCardEvents(card, isOwned)
        });
        
        this.add(card.container);
        
        // Apply visual distinctions based on ownership status
        if (isOwned) {
            // Add a green overlay or border for owned cards
            const ownedIndicator = this.scene.add.image(0, -90, 'card-frame')
                .setTint(0x32CD32) // Green tint
                .setAlpha(0.5)
                .setScale(1.05);
            card.container.add(ownedIndicator);
            
            const ownedLabel = this.scene.add.text(0, -120, "OWNED", {
                fontSize: '16px',
                fontFamily: 'verdana',
                color: '#FFFFFF',
                backgroundColor: '#32CD32',
                padding: { x: 10, y: 5 }
            }).setOrigin(0.5);
            card.container.add(ownedLabel);
        } else {
            // Add purchase indicator for available cards
            const campaignState = CampaignUiState.getInstance();
            const canAfford = campaignState.getCurrentFunds() >= factory.getMoneyCost();
            
            const purchaseButton = this.scene.add.container(0, 90);
            
            const buttonBg = this.scene.add.rectangle(0, 0, 120, 40, 
                canAfford ? 0x4CAF50 : 0x9E9E9E) // Green if affordable, gray if not
                .setOrigin(0.5);
            
            const costText = this.scene.add.text(0, 0, `BUY: $${factory.getMoneyCost()}`, {
                fontSize: '14px',
                fontFamily: 'verdana',
                color: '#FFFFFF'
            }).setOrigin(0.5);
            
            purchaseButton.add([buttonBg, costText]);
            card.container.add(purchaseButton);
            
            if (!canAfford) {
                const unavailableOverlay = this.scene.add.rectangle(0, 0, card.container.width, card.container.height, 
                    0x000000, 0.3)
                    .setOrigin(0.5);
                card.container.add(unavailableOverlay);
            }
        }
        
        return card;
    }

    private setupFactoryCardEvents(card: PhysicalCard, isOwned: boolean): void {
        card.container.setInteractive()
            .on('pointerover', () => {
                card.setGlow(true);
            })
            .on('pointerout', () => {
                card.setGlow(false);
            })
            .on('pointerdown', () => {
                if (!isOwned) {
                    this.handleFactoryCardClick(card);
                }
            });
    }

    private handleFactoryCardClick(card: PhysicalCard): void {
        const factory = card.data as AbstractStrategicProject;
        const campaignState = CampaignUiState.getInstance();

        if (campaignState.getCurrentFunds() >= factory.getMoneyCost()) {
            campaignState.availableStrategicProjects = campaignState.availableStrategicProjects
                .filter(f => f !== factory);
            campaignState.ownedStrategicProjects.push(factory);
            
            // Deduct funds from GameState
            GameState.getInstance().moneyInVault -= factory.getMoneyCost();
            
            // Notify other components that funds have changed
            this.scene.events.emit('fundsChanged');
            
            this.clearCards();
            this.displayFactories();
        }
    }

    update(): void {
        // Update any dynamic content
        this.updatePoundsDisplay();
    }
} 