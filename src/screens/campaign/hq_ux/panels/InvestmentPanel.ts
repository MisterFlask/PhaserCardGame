import { Scene } from 'phaser';
import { GameState } from '../../../../rules/GameState';
import { AbstractStrategicProject } from '../../../../strategic_projects/AbstractStrategicProject';
import { StrategicProjectTechTree } from '../../../../strategic_projects/StrategicProjectTechTree';
import { PhysicalCard } from '../../../../ui/PhysicalCard';
import { TextBox } from '../../../../ui/TextBox';
import { CardGuiUtils } from '../../../../utils/CardGuiUtils';
import { CampaignUiState } from '../CampaignUiState';
import { AbstractHqPanel } from './AbstractHqPanel';

export class InvestmentPanel extends AbstractHqPanel {
    private projectCards: PhysicalCard[] = [];
    private titleTextBox: TextBox;
    private poundsDisplay: TextBox;
    private connectionLines: Phaser.GameObjects.Line[] = [];

    constructor(scene: Scene) {
        super(scene, 'Factory Investments');
        
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

        // Add British Pounds Sterling display below the title
        this.poundsDisplay = new TextBox({
            scene: scene,
            x: scene.scale.width / 2,
            y: 120,
            width: 250,
            text: `Current Working Capital: £${GameState.getInstance().moneyInVault}`,
            style: { fontSize: '24px', fontFamily: 'verdana', color: '#FFD700', align: 'center' }
        });
        this.add(this.poundsDisplay);
        
        // Listen for funds changed events
        scene.events.on('fundsChanged', this.updatePoundsDisplay, this);
        
        this.displayTechTree();
    }

    private updatePoundsDisplay(): void {
        this.poundsDisplay.setText(`£${GameState.getInstance().moneyInVault}`);
    }

    private clearCards(): void {
        // Clear all cards
        this.projectCards.forEach(card => {
            card.obliterate();
        });
        this.projectCards = [];
        
        // Clear all connection lines
        this.connectionLines.forEach(line => {
            line.destroy();
        });
        this.connectionLines = [];
    }

    private displayTechTree(): void {
        const campaignState = CampaignUiState.getInstance();
        
        // Combine available and owned projects for the tech tree layout
        const allProjects = [
            ...campaignState.availableStrategicProjects,
            ...campaignState.ownedStrategicProjects
        ];
        
        // Calculate layout using dagre
        const layout = StrategicProjectTechTree.calculateLayout(allProjects);
        const edges = StrategicProjectTechTree.getEdges(allProjects);

        // Create a container for the tech tree that we can position and scale
        const treeContainer = this.scene.add.container(this.scene.scale.width / 2, 200);
        this.add(treeContainer);
        
        // Draw connections first (so they're behind the cards)
        edges.forEach(edge => {
            const sourcePos = layout.get(edge.source);
            const targetPos = layout.get(edge.target);
            if (sourcePos && targetPos) {
                const line = this.scene.add.line(
                    0, 0,
                    sourcePos.x, sourcePos.y,
                    targetPos.x, targetPos.y,
                    0xCCCCCC, 0.7
                );
                line.setOrigin(0, 0);
                treeContainer.add(line);
                this.connectionLines.push(line);
            }
        });
        
        // Create all project cards at their calculated positions
        allProjects.forEach(project => {
            const pos = layout.get(project.name);
            if (pos) {
                const isOwned = campaignState.ownedStrategicProjects.includes(project);
                const card = this.createProjectCard(project, pos.x, pos.y, isOwned);
                treeContainer.add(card.container);
                this.projectCards.push(card);
            }
        });
        
        // Center the tech tree in the panel
        const bounds = treeContainer.getBounds();
        treeContainer.setPosition(
            this.scene.scale.width / 2 - bounds.width / 2, 
            200
        );
        
        // Add zoom controls if needed
        // this.addZoomControls(treeContainer);
    }

    private createProjectCard(project: AbstractStrategicProject, x: number, y: number, isOwned: boolean): PhysicalCard {
        const card = CardGuiUtils.getInstance().createCard({
            scene: this.scene,
            x,
            y,
            data: project,
            onCardCreatedEventCallback: (card) => this.setupProjectCardEvents(card, isOwned)
        });
        
        // Apply visual distinctions based on ownership and availability
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
            const canAfford = campaignState.getCurrentFunds() >= project.getMoneyCost();
            
            // Check if prerequisites are met
            const prereqsMet = this.checkPrerequisitesMet(project);
            const isAvailable = canAfford && prereqsMet;
            
            const purchaseButton = this.scene.add.container(0, 90);
            
            const buttonBg = this.scene.add.rectangle(0, -200, 120, 40, 
                isAvailable ? 0x4CAF50 : 0x9E9E9E) // Green if available, gray if not
                .setOrigin(0.5);
            
            const costText = this.scene.add.text(0, -200, `£${project.getMoneyCost()}`, {
                fontSize: '14px',
                fontFamily: 'verdana',
                color: '#FFFFFF'
            }).setOrigin(0.5);
            
            purchaseButton.add([buttonBg, costText]);
            card.container.add(purchaseButton);
            
            // Add an overlay if the project is not available
            if (!isAvailable) {
                const unavailableOverlay = this.scene.add.rectangle(0, 0, 180, 250, 
                    0x000000, 0.5)
                    .setOrigin(0.5);
                card.container.add(unavailableOverlay);
                
                // Add text indicating why it's unavailable
                let reasonText = canAfford ? "" : "Insufficient Funds";
                if (!prereqsMet) {
                    reasonText = reasonText ? "Requirements Not Met" : "Missing Prerequisites";
                }
                
                if (reasonText) {
                    const reason = this.scene.add.text(0, 0, reasonText, {
                        fontSize: '14px',
                        fontFamily: 'verdana',
                        color: '#FFFFFF',
                        backgroundColor: '#FF0000',
                        padding: { x: 5, y: 3 }
                    }).setOrigin(0.5);
                    card.container.add(reason);
                }
            }
        }
        
        return card;
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

    private setupProjectCardEvents(card: PhysicalCard, isOwned: boolean): void {
        card.container.setInteractive()
            .on('pointerover', () => {
                card.setGlow(true);
                this.highlightConnections(card.data as AbstractStrategicProject);
            })
            .on('pointerout', () => {
                card.setGlow(false);
                this.resetConnectionHighlights();
            })
            .on('pointerdown', () => {
                if (!isOwned) {
                    this.handleProjectCardClick(card);
                }
            });
    }
    
    private highlightConnections(project: AbstractStrategicProject): void {
        // Highlight connections to prerequisites
        const prerequisites = project.getPrerequisites();
        
        this.connectionLines.forEach(line => {
            line.setStrokeStyle(1, 0xCCCCCC, 0.7); // Reset to default
        });
        
        if (prerequisites.length > 0) {
            const campaignState = CampaignUiState.getInstance();
            const allProjects = [
                ...campaignState.availableStrategicProjects,
                ...campaignState.ownedStrategicProjects
            ];
            
            const edges = StrategicProjectTechTree.getEdges(allProjects);
            
            // Find the edges connected to this project
            edges.forEach((edge, index) => {
                if (edge.target === project.name) {
                    // This is a prerequisite connection
                    this.connectionLines[index]?.setStrokeStyle(3, 0xFFFF00, 1); // Yellow, thicker, fully opaque
                }
            });
        }
    }
    
    private resetConnectionHighlights(): void {
        // Reset all connection lines to default appearance
        this.connectionLines.forEach(line => {
            line.setStrokeStyle(1, 0xCCCCCC, 0.7);
        });
    }

    private handleProjectCardClick(card: PhysicalCard): void {
        const project = card.data as AbstractStrategicProject;
        const campaignState = CampaignUiState.getInstance();

        // Check if player can afford it and prerequisites are met
        if (campaignState.getCurrentFunds() >= project.getMoneyCost() && 
            this.checkPrerequisitesMet(project)) {
            
            // Move from available to owned
            campaignState.availableStrategicProjects = campaignState.availableStrategicProjects
                .filter(p => p !== project);
            campaignState.ownedStrategicProjects.push(project);
            
            // Deduct funds from GameState
            GameState.getInstance().moneyInVault -= project.getMoneyCost();
            
            // Notify other components that funds have changed
            this.scene.events.emit('fundsChanged');
            
            // Redraw the tech tree
            this.clearCards();
            this.displayTechTree();
        }
    }

    update(): void {
        // Update any dynamic content
        this.updatePoundsDisplay();
    }
} 