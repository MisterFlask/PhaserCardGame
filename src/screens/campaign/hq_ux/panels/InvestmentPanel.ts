import { Scene } from 'phaser';
import { GameState } from '../../../../rules/GameState';
import { AbstractStrategicProject } from '../../../../strategic_projects/AbstractStrategicProject';
import { StrategicProjectTechTree } from '../../../../strategic_projects/StrategicProjectTechTree';
import { PhysicalProjectCard } from '../../../../ui/PhysicalProjectCard';
import { TextBox } from '../../../../ui/TextBox';
import { CardGuiUtils } from '../../../../utils/CardGuiUtils';
import { CampaignUiState } from '../CampaignUiState';
import { AbstractHqPanel } from './AbstractHqPanel';

export class InvestmentPanel extends AbstractHqPanel {
    private projectCards: PhysicalProjectCard[] = [];
    private titleTextBox: TextBox;
    private poundsDisplay: TextBox;
    private connectionLines: Phaser.GameObjects.Line[] = [];
    private treeContainer: Phaser.GameObjects.Container;
    private uiContainer: Phaser.GameObjects.Container;
    private currentLayout: Map<string, { x: number, y: number }> = new Map();

    constructor(scene: Scene) {
        super(scene, 'Factory Investments');
        
        // Create UI container
        this.uiContainer = scene.add.container(0, 0);
        
        // Add title TextBox
        this.titleTextBox = new TextBox({
            scene: scene,
            x: scene.scale.width / 2,
            y: 50,
            width: 400,
            text: 'STRATEGIC INVESTMENTS',
            style: { fontSize: '28px', fontFamily: 'verdana' }
        });
        this.uiContainer.add(this.titleTextBox);

        // Add British Pounds Sterling display below the title
        this.poundsDisplay = new TextBox({
            scene: scene,
            x: scene.scale.width / 2,
            y: 120,
            width: 250,
            text: `Current Working Capital: £${GameState.getInstance().moneyInVault}`,
            style: { fontSize: '24px', fontFamily: 'verdana', color: '#FFD700', align: 'center' }
        });
        this.uiContainer.add(this.poundsDisplay);
        
        // Add UI container to panel
        this.add(this.uiContainer);
        
        // Listen for funds changed events
        scene.events.on('fundsChanged', this.updatePoundsDisplay, this);

        // Setup event handlers for project card interactions
        scene.events.on('projectHovered', this.onProjectHovered, this);
        scene.events.on('projectUnhovered', this.onProjectUnhovered, this);
        scene.events.on('projectClicked', this.onProjectClicked, this);

        // Create the tree container
        this.treeContainer = scene.add.container(120, 300); // Add padding: 120px left, 300px from top
        this.add(this.treeContainer);
        
        this.displayTechTree();
        
        // Hide initially until explicitly shown
        this.hide();
    }

    show(): void {
        super.show();
    }

    hide(): void {
        super.hide();
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
        this.currentLayout = layout;
        const edges = StrategicProjectTechTree.getEdges(allProjects);

        // Clear existing content
        this.clearCards();
        this.treeContainer.removeAll();

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
                this.treeContainer.add(line);
                this.connectionLines.push(line);
            }
        });
        
        // Create all project cards at their calculated positions
        allProjects.forEach(project => {
            const pos = layout.get(project.name);
            if (pos) {
                const card = this.createProjectCard(project, pos.x, pos.y);
                this.treeContainer.add(card.container);
                this.projectCards.push(card);
            }
        });
    }

    private createProjectCard(project: AbstractStrategicProject, x: number, y: number): PhysicalProjectCard {
        const cardConfig = CardGuiUtils.getInstance().cardConfig;
        
        const card = new PhysicalProjectCard({
            scene: this.scene,
            x,
            y,
            data: project,
            cardConfig
        });
        
        return card;
    }
    
    private onProjectHovered(project: AbstractStrategicProject): void {
        this.highlightConnections(project);
    }
    
    private onProjectUnhovered(): void {
        this.resetConnectionHighlights();
    }
    
    private onProjectClicked(project: AbstractStrategicProject): void {
        const campaignState = CampaignUiState.getInstance();

        // Check if player can afford it and prerequisites are met
        const prerequisites = project.getPrerequisites();
        const prereqsMet = prerequisites.length === 0 || prerequisites.every(prereq => 
            campaignState.ownedStrategicProjects.some(owned => owned.name === prereq.name)
        );
        
        if (campaignState.getCurrentFunds() >= project.getMoneyCost() && prereqsMet) {
            // Move from available to owned
            campaignState.availableStrategicProjects = campaignState.availableStrategicProjects
                .filter(p => p !== project);
            campaignState.ownedStrategicProjects.push(project);
            
            // Deduct funds from GameState
            GameState.getInstance().moneyInVault -= project.getMoneyCost();
            
            // Notify other components that funds have changed
            this.scene.events.emit('fundsChanged');
            
            // Update all cards to reflect the change
            this.updateCards();
        }
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

    private updateCards(): void {
        // Update all project cards to reflect current state
        this.projectCards.forEach(card => {
            card.update();
        });
    }

    update(): void {
        // Update any dynamic content
        this.updatePoundsDisplay();
        
        // Update all cards
        this.updateCards();
    }
} 