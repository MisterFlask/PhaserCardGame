import { Scene } from 'phaser';
import { AbstractStrategicProject } from '../../../../strategic_projects/AbstractStrategicProject';
import { PhysicalCard } from '../../../../ui/PhysicalCard';
import { TextBox } from '../../../../ui/TextBox';
import { CardGuiUtils } from '../../../../utils/CardGuiUtils';
import { CampaignUiState } from '../CampaignUiState';
import { AbstractHqPanel } from './AbstractHqPanel';

export class InvestmentPanel extends AbstractHqPanel {
    private availableFactories: PhysicalCard[] = [];
    private ownedFactories: PhysicalCard[] = [];
    private backgroundImage: Phaser.GameObjects.Image;
    private titleTextBox: TextBox;

    constructor(scene: Scene) {
        super(scene, 'Factory Investments');
        
        // Add background image
        this.backgroundImage = scene.add.image(0, 0, 'investments-screen')
            .setOrigin(0, 0)
            .setDisplaySize(scene.scale.width, scene.scale.height);
        this.add(this.backgroundImage);
        
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
        
        this.displayFactories();
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
        const startY = 150;

        // Display available factories on the left
        campaignState.availableStrategicProjects.forEach((factory, index) => {
            const card = this.createFactoryCard(factory, 
                this.scene.scale.width * 0.25,
                startY + index * (cardSpacing + 150)
            );
            this.availableFactories.push(card);
        });

        // Display owned factories on the right
        campaignState.ownedStrategicProjects.forEach((factory, index) => {
            const card = this.createFactoryCard(factory,
                this.scene.scale.width * 0.75,
                startY + index * (cardSpacing + 150)
            );
            this.ownedFactories.push(card);
        });
    }

    private createFactoryCard(factory: AbstractStrategicProject, x: number, y: number): PhysicalCard {
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
        const factory = card.data as AbstractStrategicProject;
        const campaignState = CampaignUiState.getInstance();

        if (!campaignState.ownedStrategicProjects.includes(factory) && 
            campaignState.getCurrentFunds() >= factory.getMoneyCost()) {
            campaignState.availableStrategicProjects = campaignState.availableStrategicProjects
                .filter(f => f !== factory);
            campaignState.ownedStrategicProjects.push(factory);
            this.clearCards();
            this.displayFactories();
        }
    }

    update(): void {
        // Update any dynamic content
    }
} 