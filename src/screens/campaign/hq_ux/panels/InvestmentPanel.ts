import { Scene } from 'phaser';
import { ScrollablePanel } from 'phaser3-rex-plugins/templates/ui/ui-components.js';
import RexUIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin.js';
import { GameState } from '../../../../rules/GameState';
import { AbstractStrategicProject } from '../../../../strategic_projects/AbstractStrategicProject';
import { StrategicProjectTechTree } from '../../../../strategic_projects/StrategicProjectTechTree';
import { PhysicalCard } from '../../../../ui/PhysicalCard';
import { TextBox } from '../../../../ui/TextBox';
import { CardGuiUtils } from '../../../../utils/CardGuiUtils';
import { CampaignUiState } from '../CampaignUiState';
import { AbstractHqPanel } from './AbstractHqPanel';

// Define a type for RexUI plugin

export class InvestmentPanel extends AbstractHqPanel {
    private projectCards: PhysicalCard[] = [];
    private titleTextBox: TextBox;
    private poundsDisplay: TextBox;
    private connectionLines: Phaser.GameObjects.Line[] = [];
    private scrollablePanel: ScrollablePanel;
    private contentContainer: RexUIPlugin.Container; // Using RexUI's container-lite
    private edgeScrollSpeed: number = 10; // Speed of auto-scrolling near edges
    private edgeThreshold: number = 50; // Distance from edge to trigger auto-scrolling

    constructor(scene: Scene) {
        super(scene, 'Factory Investments');
        
        // Initialize content container using RexUI's container-lite
        const ui = (scene as any).rexUI as RexUIPlugin;   // <- this is the real instance
        this.contentContainer = ui.add.container(0,0);
        
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

        // Create the scrollable panel
        this.scrollablePanel = new ScrollablePanel(scene, {
            x: scene.scale.width / 2,
            y: scene.scale.height / 2,
            width: scene.scale.width,
            height: scene.scale.height - 200, // Leave space for title and money display
            scrollMode: 2, // 2 represents 'both' in RexUI's ScrollModeTypes
            background: scene.add.rectangle(0, 0, 1, 1, 0x000000, 0.1),
            panel: {
                child: this.contentContainer,
            },
            slider: {
                track: scene.add.rectangle(0, 0, 20, 1, 0x000000, 0.2),
                thumb: scene.add.rectangle(0, 0, 20, 1, 0x000000, 0.5),
            }
        });
        this.add(this.scrollablePanel);
        
        this.displayTechTree();
        
        // Hide initially until explicitly shown
        this.hide();
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
        const treeContainer = this.scene.add.container(0, 0);
        this.contentContainer.add(treeContainer);
        
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
        
        // Get tree bounds
        const bounds = treeContainer.getBounds();
        
        // Move the tree so its left-top corner is at (0,0) inside the content container
        treeContainer.setPosition(-bounds.x, -bounds.y);
        
        // Tell rex-ui the *logical* size of the scrollable content
        this.contentContainer.setSize(bounds.width, bounds.height);  // Use setMinSize instead of setSize
        
        // Call layout to update the scrollable panel
        this.scrollablePanel.layout();
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

    private checkEdgeScrolling(): void {
        // Get mouse position
        const mouseX = this.scene.input.mousePointer.x;
        const mouseY = this.scene.input.mousePointer.y;
        
        // Get panel bounds
        const panelBounds = this.scrollablePanel.getBounds();
        
        // Only proceed if mouse is over the panel
        if (!Phaser.Geom.Rectangle.Contains(panelBounds, mouseX, mouseY)) {
            return;
        }
        
        // Calculate distances from edges
        const distanceFromLeft = mouseX - panelBounds.left;
        const distanceFromRight = panelBounds.right - mouseX;
        const distanceFromTop = mouseY - panelBounds.top;
        const distanceFromBottom = panelBounds.bottom - mouseY;
        
        let scrollX = 0;
        let scrollY = 0;
        
        // Check horizontal edges
        if (distanceFromLeft < this.edgeThreshold) {
            // Near left edge, scroll left (negative)
            scrollX = -this.edgeScrollSpeed * (1 - distanceFromLeft / this.edgeThreshold);
        } else if (distanceFromRight < this.edgeThreshold) {
            // Near right edge, scroll right (positive)
            scrollX = this.edgeScrollSpeed * (1 - distanceFromRight / this.edgeThreshold);
        }
        
        // Check vertical edges
        if (distanceFromTop < this.edgeThreshold) {
            // Near top edge, scroll up (negative)
            scrollY = -this.edgeScrollSpeed * (1 - distanceFromTop / this.edgeThreshold);
        } else if (distanceFromBottom < this.edgeThreshold) {
            // Near bottom edge, scroll down (positive)
            scrollY = this.edgeScrollSpeed * (1 - distanceFromBottom / this.edgeThreshold);
        }
        
        // Apply scrolling if needed
        if (scrollX !== 0 || scrollY !== 0) {
            // Apply scroll - RexUI's ScrollablePanel keeps track of position internally 
            // and setChildOX/setChildOY handle boundaries automatically
            if (scrollX !== 0) {
                const panel = this.scrollablePanel;
                panel.setChildOX(panel.childOX + scrollX);
            }
            
            if (scrollY !== 0) {
                const panel = this.scrollablePanel;
                panel.setChildOY(panel.childOY + scrollY);
            }
        }
    }

    update(): void {
        // Update any dynamic content
        this.updatePoundsDisplay();
        
        // Check for edge scrolling
        this.checkEdgeScrolling();
    }
} 