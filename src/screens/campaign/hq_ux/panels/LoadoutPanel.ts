import { Scene } from 'phaser';
import Label from 'phaser3-rex-plugins/templates/ui/label/Label.js';
import Sizer from 'phaser3-rex-plugins/templates/ui/sizer/Sizer.js';
import RexUIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin.js';
import { PlayableCard } from '../../../../gamecharacters/PlayableCard';
import { PlayerCharacter } from '../../../../gamecharacters/PlayerCharacter';
import { PhysicalCard } from '../../../../ui/PhysicalCard';
import { TextBox } from '../../../../ui/TextBox';
import { CardGuiUtils } from '../../../../utils/CardGuiUtils';
import { CampaignUiState } from '../CampaignUiState';
import { AbstractHqPanel } from './AbstractHqPanel';

export class LoadoutPanel extends AbstractHqPanel {
    public rosterPanel: RosterPanel;
    public partyPanel: CaravanPartyPanel;
    public summaryPanel: ExpeditionSummaryPanel;
    private statusText: Label;
    private tradeRouteCard: PhysicalCard | null = null;
    private mainSizer!: Sizer;

    private get rexUI(): RexUIPlugin {
        return (this.scene as Scene & { rexUI: RexUIPlugin }).rexUI;
    }

    constructor(scene: Scene) {
        super(scene, 'Expedition Loadout');

        // Create sub-panels, passing 'this' as a reference
        this.rosterPanel = new RosterPanel(scene, this);
        this.partyPanel = new CaravanPartyPanel(scene, this);
        this.summaryPanel = new ExpeditionSummaryPanel(scene, this);

        // Create status text using rexUI label
        this.statusText = this.rexUI.add.label({
            background: this.rexUI.add.roundRectangle(0, 0, 0, 0, 10, 0x555555),
            text: this.scene.add.text(0, 0, '', { fontSize: '16px', color: '#ffffff', wordWrap: { width: 300 } }),
            space: { top: 8, bottom: 8, left: 10, right: 10 },
        });

        this.updateLaunchButton();

        // ---- Build the main panel layout via RexUI sizers ----
        const mainSizer = this.rexUI.add.sizer({
            orientation: 'vertical',
            x: scene.scale.width / 2,
            y: scene.scale.height / 2,
            width: scene.scale.width * 0.9,
            height: scene.scale.height * 0.9,
            space: { top: 10, bottom: 10, left: 10, right: 10, item: 10 },
        });

        // Upper section: panels on the left/right
        const panelsSizer = this.rexUI.add.sizer({
            orientation: 'horizontal',
            space: { item: 20 },
        });

        // Left column: vertical sizer for roster and party panels
        const leftColumn = this.rexUI.add.sizer({
            orientation: 'vertical',
            space: { item: 10 },
        });
        leftColumn.add(this.rosterPanel, { proportion: 1, expand: true, align: 'center' });
        leftColumn.add(this.partyPanel, { proportion: 1, expand: true, align: 'center' });

        panelsSizer.add(leftColumn, { proportion: 2, expand: true });
        panelsSizer.add(this.summaryPanel, { proportion: 1, expand: true });

        // Lower section: just the status text now
        const bottomSizer = this.rexUI.add.sizer({
            orientation: 'horizontal',
            space: { item: 10 },
        });
        bottomSizer.add(this.statusText, { proportion: 1, expand: true });

        // Add panels and bottom row to the main sizer
        mainSizer.add(panelsSizer, { proportion: 1, expand: true });
        mainSizer.add(bottomSizer, { proportion: 0, expand: false });

        // Add the main sizer to this panel
        this.add(mainSizer);
        this.mainSizer = mainSizer;

        // ---- Update event listeners between panels remain unchanged ----
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

        // Adjust the trade route card update: add it into the summary panel
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
        if (status.ready) {
            // Update status text and background for "ready" state
            (this.statusText.getElement('text') as Phaser.GameObjects.Text).setText("Ready to select cargo!");
            (this.statusText.getElement('background') as Phaser.GameObjects.Rectangle).setFillStyle(0x006400); // Dark green
            
            // Make the status text interactive when ready
            this.statusText.setInteractive()
                .on('pointerdown', () => this.handleLaunch())
                .on('pointerover', () => {
                    (this.statusText.getElement('background') as Phaser.GameObjects.Rectangle).setFillStyle(0x008800); // Lighter green on hover
                })
                .on('pointerout', () => {
                    (this.statusText.getElement('background') as Phaser.GameObjects.Rectangle).setFillStyle(0x006400); // Back to dark green
                });
        } else {
            const reasonsText = status.reasons.join('\n• ');
            (this.statusText.getElement('text') as Phaser.GameObjects.Text).setText(`Cannot proceed:\n• ${reasonsText}`);
            (this.statusText.getElement('background') as Phaser.GameObjects.Rectangle).setFillStyle(0x8B0000); // Dark red
            
            // Remove interactivity if not ready
            this.statusText.removeInteractive();
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
                x: 0, // positions will be managed by the summary panel layout
                y: 0,
                data: campaignState.selectedTradeRoute,
                onCardCreatedEventCallback: (card) => {
                    // NEW: Add card to the summary panel container
                    this.summaryPanel.add(card.container);
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
        // Relayout the main sizer after updating
        this.mainSizer.layout();
    }
}

class RosterPanel extends Phaser.GameObjects.Container {
    private loadoutPanel: LoadoutPanel;
    private characterCards: Map<PlayerCharacter, PhysicalCard> = new Map();
    private title: TextBox;
    private deckDisplayContainer: Phaser.GameObjects.Container;
    private deckCards: PhysicalCard[] = [];
    private deckNameText: TextBox;
    private currentlyDisplayedCharacter: PlayerCharacter | null = null;

    constructor(scene: Scene, loadoutPanel: LoadoutPanel) {
        super(scene, 0, 0);
        this.loadoutPanel = loadoutPanel;
        scene.add.existing(this);

        // Create deck display container to the left of the roster
        this.deckDisplayContainer = new Phaser.GameObjects.Container(scene, -400, 0);
        this.add(this.deckDisplayContainer);

        // Create deck name text
        this.deckNameText = new TextBox({
            scene: this.scene,
            x: 0,
            y: -30,
            width: 200,
            height: 40,
            text: '',
            style: { fontSize: '18px', color: '#ffffff' }
        });
        this.deckDisplayContainer.add(this.deckNameText);

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

        // Listen for deck display events at scene level
        scene.events.on('loadout:showdeck', (character: PlayerCharacter) => {
            this.showDeckForCharacter(character);
        });

        scene.events.on('loadout:hidedeck', () => {
            this.clearDeckDisplay();
        });

        this.refreshRoster();
    }

    private clearDeckDisplay(): void {
        this.deckCards.forEach(card => card.obliterate());
        this.deckCards = [];
        this.deckNameText.setText('');
        this.currentlyDisplayedCharacter = null;
    }

    private showDeckForCharacter(character: PlayerCharacter): void {
        if (this.currentlyDisplayedCharacter === character) return;
        
        this.clearDeckDisplay();
        this.currentlyDisplayedCharacter = character;
        this.deckNameText.setText(`${character.name}'s Starting Deck`);

        // Create and position cards vertically with proper spacing
        character.cardsInMasterDeck.forEach((cardData: PlayableCard, index: number) => {
            const card = CardGuiUtils.getInstance().createCard({
                scene: this.scene,
                x: 0, // All cards aligned vertically
                y: index * 160, // Vertical spacing between cards
                data: cardData,
                onCardCreatedEventCallback: (card) => {
                    this.setupDeckCard(card, index);
                }
            });
            this.deckCards.push(card);
        });
    }

    private setupDeckCard(card: PhysicalCard, index: number): void {
        this.deckDisplayContainer.add(card.container);
        card.container.setDepth(index);
        
        card.container.setInteractive();
        
        // Track the highest depth used in the deck
        const deckHighestDepth = this.deckCards.length + 1000;
        
        card.container.on('pointerover', () => {
            card.container.setDepth(deckHighestDepth);
            // Scale up slightly on hover for better visibility
            card.container.setScale(1.1);
            this.deckDisplayContainer.bringToTop(card.container) // hack
        });
        
        card.container.on('pointerout', () => {
            card.container.setDepth(index);
            card.container.setScale(1.0);
        });
    }

    private setupCharacterCard(card: PhysicalCard): void {
        card.container.setInteractive();
        card.container.on('pointerdown', () => {
            this.emit('characterSelected', card.data);
        });

        // Update hover effects to show deck
        const baseDepth = 100;
        card.container.on('pointerover', () => {
            card.container.setDepth(1000);
            this.scene.events.emit('loadout:showdeck', card.data as PlayerCharacter);
        });
        card.container.on('pointerout', () => {
            card.container.setDepth(baseDepth);
            // Removed hidedeck event emission
        });
    }

    private refreshRoster(): void {
        const campaignState = CampaignUiState.getInstance();
        const roster = campaignState.roster;

        roster.forEach((character, index) => {
            this.addCharacter(character);
        });
    }

    addCharacter(character: PlayerCharacter): void {
        const xOffset = (this.characterCards.size * 180); // Increased spacing for better readability
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

    private repositionCards(): void {
        let xOffset = 0;
        this.characterCards.forEach(card => {
            card.container.setPosition(xOffset, 60);
            xOffset += 180; // Increased spacing for better readability
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

        const xOffset = (this.characterCards.size * 180); // Increased spacing for better readability
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

        const baseDepth = 100;
        card.container.on('pointerover', () => {
            card.container.setDepth(1000); // Bring to front when hovered
            this.scene.events.emit('loadout:showdeck', card.data as PlayerCharacter);
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
            xOffset += 180; // Increased spacing for better readability
        });
    }
}

class ExpeditionSummaryPanel extends Phaser.GameObjects.Container {
    private loadoutPanel: LoadoutPanel;

    constructor(scene: Scene, loadoutPanel: LoadoutPanel) {
        super(scene, 0, 0);
        this.loadoutPanel = loadoutPanel;
        scene.add.existing(this);
        this.createSummaryTexts();
    }

    private createSummaryTexts(): void {
    }

    update(): void {

    }
} 