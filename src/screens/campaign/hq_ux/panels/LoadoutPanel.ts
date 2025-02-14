import { Scene } from 'phaser';
import { PlayerCharacter } from '../../../../gamecharacters/PlayerCharacter';
import { TextBoxButton } from '../../../../ui/Button';
import { PhysicalCard } from '../../../../ui/PhysicalCard';
import { TextBox } from '../../../../ui/TextBox';
import { CardGuiUtils } from '../../../../utils/CardGuiUtils';
import { CampaignUiState } from '../CampaignUiState';
import { AbstractHqPanel } from './AbstractHqPanel';

export class LoadoutPanel extends AbstractHqPanel {
    public rosterPanel: RosterPanel;
    public partyPanel: CaravanPartyPanel;
    public summaryPanel: ExpeditionSummaryPanel;
    private launchButton: TextBoxButton;
    private statusText: TextBox;
    private tradeRouteCard: PhysicalCard | null = null;

    constructor(scene: Scene) {
        super(scene, 'Expedition Loadout');

        // Create sub-panels, passing 'this' as a reference
        this.rosterPanel = new RosterPanel(scene, this);
        this.partyPanel = new CaravanPartyPanel(scene, this);
        this.summaryPanel = new ExpeditionSummaryPanel(scene, this);

        // Position panels
        // Roster at top
        this.rosterPanel.setPosition(scene.scale.width * 0.2, scene.scale.height * 0.15);
        // Selected party below roster
        this.partyPanel.setPosition(scene.scale.width * 0.2, scene.scale.height * 0.45);
        // Summary on the right
        this.summaryPanel.setPosition(scene.scale.width * 0.8, scene.scale.height * 0.2);

        // Create launch button
        this.launchButton = new TextBoxButton({
            scene,
            x: scene.scale.width * 0.8,
            y: scene.scale.height * 0.85,
            width: 200,
            height: 50,
            text: 'Select Cargo',
            style: { fontSize: '20px', color: '#ffffff' },
            fillColor: 0x444444
        });

        // Create status text box below launch button
        this.statusText = new TextBox({
            scene,
            x: scene.scale.width * 0.8,
            y: scene.scale.height * 0.85 + 70, // Position below launch button
            width: 300,
            height: 100,
            text: '',
            style: { 
                fontSize: '16px', 
                color: '#ffffff',
                align: 'center',
                wordWrap: { width: 290 }
            }
        });

        this.launchButton.onClick(() => this.handleLaunch());
        this.updateLaunchButton();

        // Add everything to the panel
        this.add([
            this.rosterPanel,
            this.partyPanel,
            this.summaryPanel,
            this.launchButton,
            this.statusText
        ]);

        // Set up event listeners between panels
        this.rosterPanel.on('characterSelected', (character: PlayerCharacter) => {
            if (this.partyPanel.canAddCharacter()) {
                this.partyPanel.addCharacter(character);
                this.rosterPanel.removeCharacter(character);
                this.updateSummary();
            }
        });

        this.partyPanel.on('characterRemoved', (character: PlayerCharacter) => {
            this.rosterPanel.addCharacter(character);
            this.updateSummary();
        });

        this.updateTradeRouteCard();
    }

    private handleLaunch(): void {
        if (this.isReadyToLaunch()) {
            this.scene.events.emit('navigate', 'cargoselection');
        }
    }

    private isReadyToLaunch(): boolean {
        var readinessState = this.getReadinessStatus()
        if (!readinessState.ready) {
            console.log("LoadoutPanel is not ready to launch: ", readinessState.reasons);
        }
        return readinessState.ready;
    }

    private getReadinessStatus(): { ready: boolean; reasons: string[] } {
        const campaignState = CampaignUiState.getInstance();
        const reasons: string[] = [];

        // Check party size
        if (campaignState.selectedParty.length < 3) {
            reasons.push(`Need ${3 - campaignState.selectedParty.length} more party members`);
        }

        // Check trade route
        if (!campaignState.selectedTradeRoute) {
            reasons.push("No trade route selected");
        }

        return {
            ready: reasons.length === 0,
            reasons
        };
    }

    private updateLaunchButton(): void {
        const status = this.getReadinessStatus();
        this.launchButton.setButtonEnabled(status.ready);

        // Update status text
        if (status.ready) {
            this.statusText.setText("Ready to select cargo!");
            this.statusText.setFillColor(0x006400); // Dark green
        } else {
            const reasonsText = status.reasons.join('\n• ');
            this.statusText.setText(`Cannot proceed:\n• ${reasonsText}`);
            this.statusText.setFillColor(0x8B0000); // Dark red
        }
    }

    private updateSummary(): void {
        this.summaryPanel.update();
        this.updateLaunchButton();
    }

    private updateTradeRouteCard(): void {
        const campaignState = CampaignUiState.getInstance();
        
        if (!this.tradeRouteCard && campaignState.selectedTradeRoute) {
            // Create the card if it doesn't exist and we have a route
            this.tradeRouteCard = CardGuiUtils.getInstance().createCard({
                scene: this.scene,
                x: this.scene.scale.width * 0.2,
                y: this.scene.scale.height * 0.7, // Moved down to accommodate the new layout
                data: campaignState.selectedTradeRoute,
                onCardCreatedEventCallback: (card) => {
                    this.add(card.container);
                }
            });
        } else if (this.tradeRouteCard && !campaignState.selectedTradeRoute) {
            // Remove the card if we have no route
            this.tradeRouteCard.obliterate();
            this.tradeRouteCard = null;
        } else if (this.tradeRouteCard && campaignState.selectedTradeRoute) {
            // Update existing card's data
            this.tradeRouteCard.data = campaignState.selectedTradeRoute;
        }
    }

    update(): void {
        this.rosterPanel.update();
        this.partyPanel.update();
        this.summaryPanel.update();
        this.updateTradeRouteCard();
        this.updateSummary();
    }
}

class RosterPanel extends Phaser.GameObjects.Container {
    private loadoutPanel: LoadoutPanel;
    private characterCards: Map<PlayerCharacter, PhysicalCard> = new Map();
    private title: TextBox;

    constructor(scene: Scene, loadoutPanel: LoadoutPanel) {
        super(scene, 0, 0);
        this.loadoutPanel = loadoutPanel;
        scene.add.existing(this);

        this.title = new TextBox({
            scene: this.scene,
            x: 0,
            y: -30,
            width: 200,
            height: 40,
            text: 'Available Characters',
            style: { fontSize: '18px', color: '#ffffff' }
        });
        this.add(this.title);

        this.refreshRoster();
    }

    private refreshRoster(): void {
        const campaignState = CampaignUiState.getInstance();
        const roster = campaignState.roster;

        roster.forEach((character, index) => {
            this.addCharacter(character);
        });
    }

    addCharacter(character: PlayerCharacter): void {
        const xOffset = (this.characterCards.size * 140); // Increased spacing for better readability
        const card = CardGuiUtils.getInstance().createCard({
            scene: this.scene,
            x: xOffset,
            y: 60, // Fixed Y position since we're arranging horizontally
            data: character,
            onCardCreatedEventCallback: (card) => this.setupCharacterCard(card)
        });
        
        this.characterCards.set(character, card);
        this.add(card.container);
        this.repositionCards();
    }

    removeCharacter(character: PlayerCharacter): void {
        const card = this.characterCards.get(character);
        if (card) {
            card.obliterate();
            this.characterCards.delete(character);
            this.repositionCards();
        }
    }

    private setupCharacterCard(card: PhysicalCard): void {
        card.container.setInteractive();
        card.container.on('pointerdown', () => {
            this.emit('characterSelected', card.data);
        });

        // Add hover effects for depth management
        const baseDepth = card.container.depth;
        card.container.on('pointerover', () => {
            card.container.setDepth(1000); // Bring to front when hovered
        });
        card.container.on('pointerout', () => {
            card.container.setDepth(baseDepth); // Restore original depth
        });
    }

    private repositionCards(): void {
        let xOffset = 0;
        this.characterCards.forEach(card => {
            card.container.setPosition(xOffset, 60);
            xOffset += 140; // Increased spacing for better readability
        });
    }
}

class CaravanPartyPanel extends Phaser.GameObjects.Container {
    private loadoutPanel: LoadoutPanel;
    private characterCards: Map<PlayerCharacter, PhysicalCard> = new Map();
    private readonly MAX_PARTY_SIZE = 3;
    private title: TextBox;

    constructor(scene: Scene, loadoutPanel: LoadoutPanel) {
        super(scene, 0, 0);
        this.loadoutPanel = loadoutPanel;
        scene.add.existing(this);

        this.title = new TextBox({
            scene: this.scene,
            x: 0,
            y: -30,
            width: 200,
            height: 40,
            text: 'Selected Party',
            style: { fontSize: '18px', color: '#ffffff' }
        });
        this.add(this.title);
    }

    canAddCharacter(): boolean {
        return this.characterCards.size < this.MAX_PARTY_SIZE;
    }

    addCharacter(character: PlayerCharacter): void {
        if (!this.canAddCharacter()) return;

        const xOffset = (this.characterCards.size * 140); // Increased spacing for better readability
        const card = CardGuiUtils.getInstance().createCard({
            scene: this.scene,
            x: xOffset,
            y: 60, // Fixed Y position since we're arranging horizontally
            data: character,
            onCardCreatedEventCallback: (card) => this.setupCharacterCard(card)
        });

        this.characterCards.set(character, card);
        this.add(card.container);
        
        // Update campaign state
        CampaignUiState.getInstance().selectedParty.push(character);
        
        this.repositionCards();
    }

    private setupCharacterCard(card: PhysicalCard): void {
        card.container.setInteractive();
        card.container.on('pointerdown', () => {
            this.removeCharacter(card.data as PlayerCharacter);
        });

        // Add hover effects for depth management
        const baseDepth = card.container.depth;
        card.container.on('pointerover', () => {
            card.container.setDepth(1000); // Bring to front when hovered
        });
        card.container.on('pointerout', () => {
            card.container.setDepth(baseDepth); // Restore original depth
        });
    }

    removeCharacter(character: PlayerCharacter): void {
        const card = this.characterCards.get(character);
        if (card) {
            card.obliterate();
            this.characterCards.delete(character);
            
            // Update campaign state
            const campaignState = CampaignUiState.getInstance();
            const index = campaignState.selectedParty.indexOf(character);
            if (index > -1) {
                campaignState.selectedParty.splice(index, 1);
            }
            
            this.repositionCards();
            this.emit('characterRemoved', character);
        }
    }

    private repositionCards(): void {
        let xOffset = 0;
        this.characterCards.forEach(card => {
            card.container.setPosition(xOffset, 60);
            xOffset += 140; // Increased spacing for better readability
        });
    }
}

class ExpeditionSummaryPanel extends Phaser.GameObjects.Container {
    private loadoutPanel: LoadoutPanel;
    private partyInfoText!: TextBox;
    private tradeRouteText!: TextBox;
    private warningsText!: TextBox;

    constructor(scene: Scene, loadoutPanel: LoadoutPanel) {
        super(scene, 0, 0);
        this.loadoutPanel = loadoutPanel;
        scene.add.existing(this);
        this.createSummaryTexts();
    }

    private createSummaryTexts(): void {
        // Create text boxes for different summary sections
        this.partyInfoText = new TextBox({
            scene: this.scene,
            x: 0,
            y: 0,
            width: 300,
            height: 100,
            text: 'Party: None',
            style: { fontSize: '16px', color: '#ffffff' }
        });

        this.tradeRouteText = new TextBox({
            scene: this.scene,
            x: 0,
            y: 120,
            width: 300,
            height: 100,
            text: 'Trade Route: None',
            style: { fontSize: '16px', color: '#ffffff' }
        });

        this.warningsText = new TextBox({
            scene: this.scene,
            x: 0,
            y: 240,
            width: 300,
            height: 100,
            text: '',
            style: { fontSize: '16px', color: '#ff0000' }
        });

        this.add([this.partyInfoText, this.tradeRouteText, this.warningsText]);
    }

    update(): void {
        const campaignState = CampaignUiState.getInstance();
        
        // Update party info
        const partySize = campaignState.selectedParty.length;
        this.partyInfoText.setText(`Party Members: ${partySize}/3`);

        // Update trade route info
        const tradeRoute = campaignState.selectedTradeRoute;
        this.tradeRouteText.setText(`Trade Route: ${tradeRoute ? tradeRoute.name : 'None'}`);

        // Update warnings
        const warnings: string[] = [];
        if (partySize < 3) {
            warnings.push(`Need ${3 - partySize} more party members`);
        }
        if (!tradeRoute) {
            warnings.push('No trade route selected');
        }

        this.warningsText.setText(warnings.length > 0 ? `Warnings:\n• ${warnings.join('\n• ')}` : '');
    }
} 