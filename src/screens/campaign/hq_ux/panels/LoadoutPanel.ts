import { Scene } from 'phaser';
import { EncounterManager } from '../../../../encounters/Encounters';
import { PlayerCharacter } from '../../../../gamecharacters/CharacterClasses';
import { GameState } from '../../../../rules/GameState';
import { TextBoxButton } from '../../../../ui/Button';
import { PhysicalCard } from '../../../../ui/PhysicalCard';
import { TextBox } from '../../../../ui/TextBox';
import { CardGuiUtils } from '../../../../utils/CardGuiUtils';
import { SceneChanger } from '../../../SceneChanger';
import { CampaignState } from '../CampaignState';
import { AbstractHqPanel } from './AbstractHqPanel';

export class LoadoutPanel extends AbstractHqPanel {
    public rosterPanel: RosterPanel;
    public partyPanel: CaravanPartyPanel;
    public equipmentPanel: EquipmentAssignmentPanel;
    public summaryPanel: ExpeditionSummaryPanel;
    private launchButton: TextBoxButton;
    private statusText: TextBox;
    private tradeRouteCard: PhysicalCard | null = null;

    constructor(scene: Scene) {
        super(scene, 'Expedition Loadout');

        // Create sub-panels, passing 'this' as a reference
        this.rosterPanel = new RosterPanel(scene, this);
        this.partyPanel = new CaravanPartyPanel(scene, this);
        this.equipmentPanel = new EquipmentAssignmentPanel(scene, this);
        this.summaryPanel = new ExpeditionSummaryPanel(scene, this);

        // Position panels
        this.rosterPanel.setPosition(scene.scale.width * 0.2, scene.scale.height * 0.2);
        this.partyPanel.setPosition(scene.scale.width * 0.4, scene.scale.height * 0.2);
        this.equipmentPanel.setPosition(scene.scale.width * 0.6, scene.scale.height * 0.2);
        this.summaryPanel.setPosition(scene.scale.width * 0.8, scene.scale.height * 0.2);

        // Create launch button
        this.launchButton = new TextBoxButton({
            scene,
            x: scene.scale.width * 0.8,
            y: scene.scale.height * 0.85,
            width: 200,
            height: 50,
            text: 'Launch Expedition',
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
            this.equipmentPanel,
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

        this.partyPanel.on('characterSelected', (character: PlayerCharacter) => {
            this.equipmentPanel.setActiveCharacter(character);
            this.updateSummary();
        });

        this.updateTradeRouteCard();
    }

    private handleLaunch(): void {
        if (this.isReadyToLaunch()) {
            this.scene.events.emit('launchExpedition');
            GameState.getInstance().currentRunCharacters = CampaignState.getInstance().selectedParty;
            
            // Add cargo cards to characters' master decks
            const campaignState = CampaignState.getInstance();
            campaignState.selectedParty.forEach(character => {
                const assignedTradeGoods = campaignState.ownedTradeGoods.filter(
                    good => good.owner === character
                );
                character.cardsInMasterDeck.push(...assignedTradeGoods);
            });

            SceneChanger.switchToCombatScene({ encounter: EncounterManager.getInstance().getShopEncounter().data });
        }
    }

    private isReadyToLaunch(): boolean {
        const campaignState = CampaignState.getInstance();
        return (
            campaignState.selectedParty.length === 3 &&
            campaignState.selectedTradeRoute !== null &&
            this.hasValidEquipment()
        );
    }

    private hasValidEquipment(): boolean {
        // Check if all party members have necessary equipment
        const campaignState = CampaignState.getInstance();
        return campaignState.selectedParty.every(character => {
            // Add your equipment validation logic here
            return true; // Placeholder
        });
    }

    private getReadinessStatus(): { ready: boolean; reasons: string[] } {
        const campaignState = CampaignState.getInstance();
        const reasons: string[] = [];

        // Check party size
        if (campaignState.selectedParty.length < 3) {
            reasons.push(`Need ${3 - campaignState.selectedParty.length} more party members`);
        }

        // Check trade route
        if (!campaignState.selectedTradeRoute) {
            reasons.push("No trade route selected");
        }

        // Check equipment
        if (!this.hasValidEquipment()) {
            reasons.push("Missing required equipment");
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
            this.statusText.setText("Ready to launch!");
            this.statusText.setFillColor(0x006400); // Dark green
        } else {
            const reasonsText = status.reasons.join('\n• ');
            this.statusText.setText(`Cannot launch:\n• ${reasonsText}`);
            this.statusText.setFillColor(0x8B0000); // Dark red
        }
    }

    private updateSummary(): void {
        this.summaryPanel.update();
        this.updateLaunchButton();
    }

    private updateTradeRouteCard(): void {
        const campaignState = CampaignState.getInstance();
        
        if (!this.tradeRouteCard && campaignState.selectedTradeRoute) {
            // Create the card if it doesn't exist and we have a route
            this.tradeRouteCard = CardGuiUtils.getInstance().createCard({
                scene: this.scene,
                x: this.scene.scale.width * 0.2,
                y: this.scene.scale.height * 0.8,
                data: campaignState.selectedTradeRoute,
                onCardCreatedEventCallback: (card) => {
                    card.container.setScale(0.8);
                    this.add(card.container);
                }
            });
        } else if (this.tradeRouteCard && !campaignState.selectedTradeRoute) {
            // Remove the card if we have no route
            this.tradeRouteCard.container.destroy();
            this.tradeRouteCard = null;
        } else if (this.tradeRouteCard && campaignState.selectedTradeRoute) {
            // Update existing card's data
            this.tradeRouteCard.data = campaignState.selectedTradeRoute;
        }
    }

    update(): void {
        this.rosterPanel.update();
        this.partyPanel.update();
        this.equipmentPanel.update();
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
        const campaignState = CampaignState.getInstance();
        const roster = campaignState.roster;

        roster.forEach((character, index) => {
            this.addCharacter(character);
        });
    }

    addCharacter(character: PlayerCharacter): void {
        const yOffset = 60 + (this.characterCards.size * 120);
        const card = CardGuiUtils.getInstance().createCard({
            scene: this.scene,
            x: 0,
            y: yOffset,
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
            card.container.destroy();
            this.characterCards.delete(character);
            this.repositionCards();
        }
    }

    private setupCharacterCard(card: PhysicalCard): void {
        card.container.setInteractive()
            .on('pointerdown', () => {
                this.loadoutPanel.rosterPanel.emit('characterSelected', card.data);
            })
            .on('pointerover', () => {
                card.container.setScale(1.1);
                
            })
            .on('pointerout', () => {
                card.container.setScale(1.0);
            });
    }

    private repositionCards(): void {
        let yOffset = 60;
        this.characterCards.forEach(card => {
            card.container.setPosition(0, yOffset);
            yOffset += 120;
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
            text: 'Caravan Party',
            style: { fontSize: '18px', color: '#ffffff' }
        });
        this.add(this.title);
    }

    canAddCharacter(): boolean {
        return this.characterCards.size < this.MAX_PARTY_SIZE;
    }

    addCharacter(character: PlayerCharacter): void {
        if (!this.canAddCharacter()) return;

        const yOffset = 60 + (this.characterCards.size * 120);
        const card = CardGuiUtils.getInstance().createCard({
            scene: this.scene,
            x: 0,
            y: yOffset,
            data: character,
            onCardCreatedEventCallback: (card) => this.setupCharacterCard(card)
        });
        
        this.characterCards.set(character, card);
        this.add(card.container);
        CampaignState.getInstance().selectedParty.push(character);
        this.repositionCards();
    }

    private setupCharacterCard(card: PhysicalCard): void {
        card.container.setInteractive()
            .on('pointerdown', () => {
                this.loadoutPanel.partyPanel.emit('characterSelected', card.data);
            })
            .on('pointerdown', (pointer: Phaser.Input.Pointer) => {
                this.loadoutPanel.partyPanel.removeCharacter(card.data as PlayerCharacter);
                this.loadoutPanel.partyPanel.emit('characterRemoved', card.data);
            })
            .on('pointerover', () => {
                card.container.setScale(1.1);
            })
            .on('pointerout', () => {
                card.container.setScale(1.0);
            });
    }

    removeCharacter(character: PlayerCharacter): void {
        const card = this.characterCards.get(character);
        if (card) {
            card.container.destroy();
            this.characterCards.delete(character);
            this.repositionCards();
            CampaignState.getInstance().selectedParty = CampaignState.getInstance().selectedParty.filter(c => c !== character);
        }
    }

    private repositionCards(): void {
        let yOffset = 60;
        this.characterCards.forEach(card => {
            card.container.setPosition(0, yOffset);
            yOffset += 120;
        });
    }

    getCharacterCards(): Map<PlayerCharacter, PhysicalCard> {
        return this.characterCards;
    }

}

class EquipmentAssignmentPanel extends Phaser.GameObjects.Container {
    private loadoutPanel: LoadoutPanel;
    private activeCharacter: PlayerCharacter | null = null;
    private equipmentSlots: PhysicalCard[] = [];
    private gridContainer: Phaser.GameObjects.Container;

    constructor(scene: Scene, loadoutPanel: LoadoutPanel) {
        super(scene, 0, 0);
        this.loadoutPanel = loadoutPanel;
        scene.add.existing(this);

        // Create a container for the grid
        this.gridContainer = new Phaser.GameObjects.Container(scene, 0, 0);
        this.add(this.gridContainer);

        this.createTitle();
        this.createAssignableCardsGrid();

        // Subscribe to trade goods changes
        this.scene.events.on('tradeGoodsChanged', () => {
            this.refreshGrid();
        });
    }

    private refreshGrid(): void {
        // Clear existing grid
        this.equipmentSlots.forEach(card => {
            card.container.destroy();
        });
        this.equipmentSlots = [];
        this.gridContainer.removeAll();

        // Recreate the grid
        this.createAssignableCardsGrid();
    }

    private createTitle(): void {
        const title = new TextBox({
            scene: this.scene,
            x: 0,
            y: -30,
            width: 200,
            height: 40,
            text: 'Equipment Assignment',
            style: { fontSize: '18px', color: '#ffffff' }
        });
        this.add(title);
    }

    private createAssignableCardsGrid(): void {
        const campaignState = CampaignState.getInstance();
        const GRID_ROWS = 3;
        const CARD_WIDTH = 100;
        const CARD_HEIGHT = 140;
        const PADDING = 20;

        campaignState.ownedTradeGoods.forEach((good, index) => {
            const row = index % GRID_ROWS;
            const col = Math.floor(index / GRID_ROWS);
            
            const x = col * (CARD_WIDTH + PADDING);
            const y = 60 + row * (CARD_HEIGHT + PADDING);

            const card = CardGuiUtils.getInstance().createCard({
                scene: this.scene,
                x,
                y,
                data: good,
                onCardCreatedEventCallback: (card) => {
                    this.setupTradeGoodCard(card);
                    
                    // Create assignment status text box as child of card container
                    const assignmentText = new TextBox({
                        scene: this.scene,
                        x: CARD_WIDTH + 5,
                        y: CARD_HEIGHT / 2,
                        width: 120,
                        height: 30,
                        text: good.owner ? `Assigned to:\n${good.owner.name}` : 'Unassigned (will not be taken)',
                        style: { 
                            fontSize: '14px', 
                            color: good.owner ? '#90EE90' : '#FFB6C1',
                            align: 'left',
                            wordWrap: { width: 110 }
                        }
                    });

                    card.container.add(assignmentText);
                    (card as any).assignmentText = assignmentText;
                }
            });

            this.gridContainer.add(card.container);
            this.equipmentSlots.push(card);
        });
    }

    private setupTradeGoodCard(card: PhysicalCard): void {
        card.container.setInteractive({ draggable: true });

        const originalX = card.container.x;
        const originalY = card.container.y;
        const originalScale = card.container.scale;

        card.container
            .on('dragstart', () => {
                card.container.setScale(0.8);
                this.scene.children.bringToTop(card.container);
                // Highlight character cards when starting drag
                this.loadoutPanel.partyPanel.getCharacterCards().forEach((characterCard) => {
                    characterCard.setGlow(true);
                });
            })
            .on('drag', (pointer: Phaser.Input.Pointer, dragX: number, dragY: number) => {
                card.container.x = dragX;
                card.container.y = dragY;
            })
            .on('dragend', () => {
                const droppedOnCharacter = this.checkDropOnCharacter(card);
                
                // Remove highlighting when drag ends
                this.loadoutPanel.partyPanel.getCharacterCards().forEach((characterCard) => {
                    characterCard.setGlow(false);
                });
                
                // Return to original position
                card.container.x = originalX;
                card.container.y = originalY;
                card.container.setScale(originalScale);
            })
            .on('pointerover', () => {
                if (card.container.input?.dragState != 2) {
                    card.container.setScale(1.1);
                }
            })
            .on('pointerout', () => {
                if (card.container.input?.dragState != 2) {
                    card.container.setScale(1.0);
                }
            });
    }

    private checkDropOnCharacter(cargoCard: PhysicalCard): boolean {
        // Get the CaravanPartyPanel instance
        console.log("checking drop on character");
        const partyPanel = this.loadoutPanel.partyPanel;
        
        if (!partyPanel) {
            console.error("party panel not found");
            return false;
        }

        // Check overlap with each character card using mouse cursor
        for (const [character, characterCard] of partyPanel.getCharacterCards()) {
            const bounds = characterCard.container.getBounds();
            const pointer = this.scene.input.activePointer;

            if (Phaser.Geom.Rectangle.Contains(bounds, pointer.x, pointer.y)) {
                this.equipTradeGood(cargoCard, character);
                console.log("dropped on character ", character.name);
                return true;
            }
        }

        console.log("not dropped on character");
        return false;
    }

    private equipTradeGood(tradeGood: PhysicalCard, character: PlayerCharacter): void {
        // Update the trade good's owner
        tradeGood.data.owner = character;

        // Update the assignment text box directly through the stored reference
        const assignmentText = (tradeGood as any).assignmentText as TextBox;
        if (assignmentText) {
            assignmentText.setText(`Assigned to:\n${character.name}`);
            assignmentText.setFillColor(0x90EE90);
        }

        console.log("assigned trade good to character ", character.name, " with trade good ", tradeGood.data.name);
    }

    setActiveCharacter(character: PlayerCharacter): void {
        this.activeCharacter = character;
        this.refreshAssignableCardsDisplay();
    }

    private refreshAssignableCardsDisplay(): void {
        // Update equipment display for active character
    }

    update(): void {
        // Update equipment states and positions
    }
}

class ExpeditionSummaryPanel extends Phaser.GameObjects.Container {
    private loadoutPanel: LoadoutPanel;
    private cargoValueText!: TextBox;
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
        const textStyle = { 
            fontSize: '16px', 
            color: '#ffffff',
            align: 'left',
            wordWrap: { width: 290 }
        };

        // Cargo value text
        this.cargoValueText = new TextBox({
            scene: this.scene,
            x: 0,
            y: 30,
            width: 300,
            height: 60,
            text: '',
            style: textStyle
        });

        // Party info text
        this.partyInfoText = new TextBox({
            scene: this.scene,
            x: 0,
            y: 100,
            width: 300,
            height: 100,
            text: '',
            style: textStyle
        });

        // Trade route text
        this.tradeRouteText = new TextBox({
            scene: this.scene,
            x: 0,
            y: 210,
            width: 300,
            height: 60,
            text: '',
            style: textStyle
        });

        // Warnings text
        this.warningsText = new TextBox({
            scene: this.scene,
            x: 0,
            y: 280,
            width: 300,
            height: 100,
            text: '',
            style: { ...textStyle, color: '#ff6b6b' }
        });

        this.add([
            this.cargoValueText,
            this.partyInfoText,
            this.tradeRouteText,
            this.warningsText
        ]);
    }

    update(): void {
        const campaignState = CampaignState.getInstance();
        
        // Update cargo value
        const totalValue = campaignState.ownedTradeGoods.reduce((total, good) => 
            total + (good.owner ? good.hellSellValue : 0), 0);
        this.cargoValueText.setText(
            `Total Cargo Value: ${totalValue} Hell\n` +
            `Assigned Cards: ${campaignState.ownedTradeGoods.filter(g => g.owner).length}/${campaignState.ownedTradeGoods.length}`
        );

        // Update party info
        const partySize = campaignState.selectedParty.length;
        this.partyInfoText.setText(
            `Party Members: ${partySize}/3\n` +
            `${campaignState.selectedParty.map(char => `• ${char.name}`).join('\n')}`
        );

        // Update trade route info
        this.tradeRouteText.setText(
            `Trade Route: ${campaignState.selectedTradeRoute ? 
                campaignState.selectedTradeRoute.name : 'None selected'}`
        );

    }
} 