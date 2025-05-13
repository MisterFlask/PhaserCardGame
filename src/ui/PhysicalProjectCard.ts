import { CampaignUiState } from '../screens/campaign/hq_ux/CampaignUiState';
import { AbstractStrategicProject } from '../strategic_projects/AbstractStrategicProject';
import { CardConfig } from '../utils/CardGuiUtils';
import { PhysicalCard } from './PhysicalCard';

export class PhysicalProjectCard extends PhysicalCard {
    private ownedIndicator?: Phaser.GameObjects.Image;
    private ownedLabel?: Phaser.GameObjects.Text;
    private priceLabel?: Phaser.GameObjects.Text;
    private purchaseButton?: Phaser.GameObjects.Container;
    private unavailableOverlay?: Phaser.GameObjects.Rectangle;
    private unavailableReasonText?: Phaser.GameObjects.Text;

    constructor({
        scene,
        x,
        y,
        data,
        cardConfig
    }: {
        scene: Phaser.Scene;
        x: number;
        y: number;
        data: AbstractStrategicProject;
        cardConfig: CardConfig;
    }) {
        super({
            scene,
            x,
            y,
            data,
            cardConfig
        });
        this.setupInteractions();
        this.update();
    }

    private setupInteractions(): void {
        this.container.setInteractive()
            .on('pointerover', () => {
                this.setGlow(true);
                this.scene.events.emit('projectHovered', this.data as AbstractStrategicProject);
                // Bring the card to the front when hovered
                if (this.container.parentContainer) {
                    this.container.parentContainer.bringToTop(this.container);
                }
            })
            .on('pointerout', () => {
                this.setGlow(false);
                this.scene.events.emit('projectUnhovered');
            })
            .on('pointerdown', () => {
                const project = this.data as AbstractStrategicProject;
                if (!project.isOwned) {
                    this.scene.events.emit('projectClicked', project);
                }
            });
    }

    update(): void {
        // Clear existing UI elements
        this.clearUIElements();

        const project = this.data as AbstractStrategicProject;
        const campaignState = CampaignUiState.getInstance();
        const isOwned = campaignState.ownedStrategicProjects.includes(project);

        project.isOwned = isOwned;

        if (project.isOwned){
            project.backgroundImageNameOverride = "red_background";
        }
        
        if (isOwned) {
            this.renderOwnedState();
        } else {
            this.renderPurchasableState();
        }
        this.updateVisuals();
    }

    private clearUIElements(): void {
        this.ownedIndicator?.destroy();
        this.ownedLabel?.destroy();
        this.priceLabel?.destroy();
        if (this.purchaseButton) {
            this.purchaseButton.removeAll(true);
            this.purchaseButton.destroy();
        }
        this.unavailableOverlay?.destroy();
        this.unavailableReasonText?.destroy();
    }

    private renderOwnedState(): void {
        // Add a green overlay for owned cards
        this.ownedIndicator = this.scene.add.image(0, -90, 'card-frame')
            .setTint(0x32CD32) // Green tint
            .setAlpha(0.5)
            .setScale(1.05);
        this.container.add(this.ownedIndicator);
        
        // Add owned label
        this.ownedLabel = this.scene.add.text(0, -120, "OWNED", {
            fontSize: '16px',
            fontFamily: 'verdana',
            color: '#FFFFFF',
            backgroundColor: '#32CD32',
            padding: { x: 10, y: 5 }
        }).setOrigin(0.5);
        this.container.add(this.ownedLabel);
    }

    private renderPurchasableState(): void {
        const project = this.data as AbstractStrategicProject;
        const campaignState = CampaignUiState.getInstance();
        const canAfford = campaignState.getCurrentFunds() >= project.getMoneyCost();
        const prereqsMet = this.checkPrerequisitesMet(project);
        const isAvailable = canAfford && prereqsMet;
        
        // Add price label at the top
        this.priceLabel = this.scene.add.text(0, -120, `£${project.getMoneyCost()}`, {
            fontSize: '16px',
            fontFamily: 'verdana',
            color: '#FFFFFF',
            backgroundColor: canAfford ? '#4CAF50' : '#9E9E9E',
            padding: { x: 10, y: 5 }
        }).setOrigin(0.5);
        this.container.add(this.priceLabel);
        
        // Create purchase button without price text
        this.purchaseButton = this.scene.add.container(0, 0);
        
        const buttonBg = this.scene.add.rectangle(0, 90, 120, 40, 
            isAvailable ? 0x4CAF50 : 0x9E9E9E) // Green if available, gray if not
            .setOrigin(0.5);
        
        const buttonText = this.scene.add.text(0, 90, "PURCHASE", {
            fontSize: '14px',
            fontFamily: 'verdana',
            color: '#FFFFFF'
        }).setOrigin(0.5);
        
        this.purchaseButton.add([buttonBg, buttonText]);
        this.container.add(this.purchaseButton);
        
        // Add an overlay if the project is not available
        if (!isAvailable) {
            this.unavailableOverlay = this.scene.add.rectangle(0, 0, 180, 250, 
                0x000000, 0.5)
                .setOrigin(0.5);
            this.container.add(this.unavailableOverlay);
            
            // Add text indicating why it's unavailable
            let reasonText = canAfford ? "" : "Insufficient Funds";
            if (!prereqsMet) {
                reasonText = reasonText ? "Requirements Not Met" : "Missing Prerequisites";
            }
            
            if (reasonText) {
                this.unavailableReasonText = this.scene.add.text(0, 0, reasonText, {
                    fontSize: '14px',
                    fontFamily: 'verdana',
                    color: '#FFFFFF',
                    backgroundColor: '#FF0000',
                    padding: { x: 5, y: 3 }
                }).setOrigin(0.5);
                this.container.add(this.unavailableReasonText);
            }
        }
    }

    private checkPrerequisitesMet(project: AbstractStrategicProject): boolean {
        const campaignState = CampaignUiState.getInstance();
        const prerequisites = project.getPrerequisites();
        
        // If no prerequisites, then requirements are met
        if (prerequisites.length === 0) {
            return true;
        }
        
        // Check if all prerequisites are in the owned projects
        return prerequisites.every(prereq => 
            campaignState.ownedStrategicProjects.some(owned => owned.name === prereq.name)
        );
    }
} 