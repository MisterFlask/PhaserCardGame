import { Scene } from 'phaser';
import { PlayerCharacter } from '../../../../gamecharacters/CharacterClasses';
import { TextBoxButton } from '../../../../ui/Button';
import { PhysicalCard } from '../../../../ui/PhysicalCard';
import { TextBox } from '../../../../ui/TextBox';
import { CardGuiUtils } from '../../../../utils/CardGuiUtils';
import { CampaignState } from '../CampaignState';
import { AbstractHqPanel } from './AbstractHqPanel';

export class LoadoutPanel extends AbstractHqPanel {
    private rosterPanel: RosterPanel;
    private partyPanel: CaravanPartyPanel;
    private equipmentPanel: EquipmentAssignmentPanel;
    private summaryPanel: ExpeditionSummaryPanel;
    private launchButton: TextBoxButton;

    constructor(scene: Scene) {
        super(scene, 'Expedition Loadout');

        // Create sub-panels
        this.rosterPanel = new RosterPanel(scene);
        this.partyPanel = new CaravanPartyPanel(scene);
        this.equipmentPanel = new EquipmentAssignmentPanel(scene);
        this.summaryPanel = new ExpeditionSummaryPanel(scene);

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

        this.launchButton.onClick(() => this.handleLaunch());
        this.updateLaunchButton();

        // Add everything to the panel
        this.add([
            this.rosterPanel,
            this.partyPanel,
            this.equipmentPanel,
            this.summaryPanel,
            this.launchButton
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
    }

    private handleLaunch(): void {
        if (this.isReadyToLaunch()) {
            this.scene.events.emit('launchExpedition');
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

    private updateLaunchButton(): void {
        const isReady = this.isReadyToLaunch();
        this.launchButton.setButtonEnabled(isReady);
    }

    private updateSummary(): void {
        this.summaryPanel.update();
        this.updateLaunchButton();
    }

    update(): void {
        this.rosterPanel.update();
        this.partyPanel.update();
        this.equipmentPanel.update();
        this.summaryPanel.update();
        this.updateLaunchButton();
    }
}

class RosterPanel extends Phaser.GameObjects.Container {
    private characterCards: Map<PlayerCharacter, PhysicalCard> = new Map();
    private title: TextBox;

    constructor(scene: Scene) {
        super(scene, 0, 0);
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
                this.emit('characterSelected', card.data);
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
    private characterCards: Map<PlayerCharacter, PhysicalCard> = new Map();
    private readonly MAX_PARTY_SIZE = 3;
    private title: TextBox;

    constructor(scene: Scene) {
        super(scene, 0, 0);
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
        this.repositionCards();
    }

    private setupCharacterCard(card: PhysicalCard): void {
        card.container.setInteractive()
            .on('pointerdown', () => {
                this.emit('characterSelected', card.data);
            })
            .on('pointerdown', (pointer: Phaser.Input.Pointer) => {
                this.removeCharacter(card.data as PlayerCharacter);
                this.emit('characterRemoved', card.data);
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
        }
    }

    private repositionCards(): void {
        let yOffset = 60;
        this.characterCards.forEach(card => {
            card.container.setPosition(0, yOffset);
            yOffset += 120;
        });
    }
}

class EquipmentAssignmentPanel extends Phaser.GameObjects.Container {
    private activeCharacter: PlayerCharacter | null = null;
    private equipmentSlots: PhysicalCard[] = [];

    constructor(scene: Scene) {
        super(scene, 0, 0);
        scene.add.existing(this);

        this.createTitle();
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
        const GRID_COLS = 3;
        const CARD_WIDTH = 100;
        const CARD_HEIGHT = 140;
        const PADDING = 20;

        campaignState.ownedTradeGoods.forEach((good, index) => {
            const col = index % GRID_COLS;
            const row = Math.floor(index / GRID_COLS);
            
            const x = col * (CARD_WIDTH + PADDING);
            const y = 60 + row * (CARD_HEIGHT + PADDING);

            const card = CardGuiUtils.getInstance().createCard({
                scene: this.scene,
                x,
                y,
                data: good,
                onCardCreatedEventCallback: (card) => this.setupTradeGoodCard(card)
            });

            this.add(card.container);
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
            })
            .on('drag', (pointer: Phaser.Input.Pointer, dragX: number, dragY: number) => {
                card.container.x = dragX;
                card.container.y = dragY;
            })
            .on('dragend', () => {
                const droppedOnCharacter = this.checkDropOnCharacter(card);
                
                if (!droppedOnCharacter) {
                    // Return to original position if not dropped on a character
                    card.container.x = originalX;
                    card.container.y = originalY;
                    card.container.setScale(originalScale);
                }
            })
            .on('pointerover', () => {
                if (!card.container.input.dragging) {
                    card.container.setScale(1.1);
                }
            })
            .on('pointerout', () => {
                if (!card.container.input.dragging) {
                    card.container.setScale(1.0);
                }
            });
    }

    private checkDropOnCharacter(card: PhysicalCard): boolean {
        if (!this.activeCharacter) return false;

        // Get the character card from the CaravanPartyPanel
        const characterCard = this.scene.children.list
            .find(child => child instanceof CaravanPartyPanel)
            ?.characterCards?.get(this.activeCharacter);

        if (!characterCard) return false;

        const bounds = characterCard.container.getBounds();
        const cardBounds = card.container.getBounds();

        if (Phaser.Geom.Rectangle.Overlaps(bounds, cardBounds)) {
            this.equipTradeGood(card, this.activeCharacter);
            return true;
        }

        return false;
    }

    private equipTradeGood(tradeGood: PhysicalCard, character: PhysicalCard): void {
        const characterCard = character

        if (!characterCard) return;

        // Position the trade good card next to the character card
        const targetX = characterCard.container.x + characterCard.container.width + 10;
        const targetY = characterCard.container.y;

        // Animate the card to its new position
        this.scene.tweens.add({
            targets: tradeGood.container,
            x: targetX,
            y: targetY,
            scale: 0.6,
            duration: 200,
            ease: 'Power2'
        });

        tradeGood.data.owner = character.data as PlayerCharacter; 
        // when we launch expedition we'll need to actually add the trade good to the character's master deck.
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
    private cargoValueText!: TextBox;
    private deckCompositionText!: TextBox;
    private tradeRouteText!: TextBox;
    private warningsText!: TextBox;

    constructor(scene: Scene) {
        super(scene, 0, 0);
        scene.add.existing(this);

        this.createTitle();
        this.createSummaryTexts();
    }

    private createTitle(): void {
        const title = new TextBox({
            scene: this.scene,
            x: 0,
            y: -30,
            width: 200,
            height: 40,
            text: 'Expedition Summary',
            style: { fontSize: '18px', color: '#ffffff' }
        });
        this.add(title);
    }

    private createSummaryTexts(): void {
        // Create and position summary text elements
        this.cargoValueText = new TextBox({
            scene: this.scene,
            x: 0,
            y: 30,
            width: 300,
            height: 40,
            text: 'Total Cargo Value: £0',
            style: { fontSize: '16px', color: '#ffffff' }
        });

        // Add other summary texts...

        this.add([this.cargoValueText]);
    }

    update(): void {
        const campaignState = CampaignState.getInstance();
        // Update all summary information
        this.updateCargoValue();
        this.updateDeckComposition();
        this.updateTradeRouteInfo();
        this.updateWarnings();
    }

    private updateCargoValue(): void {
        // Calculate and update total cargo value
    }

    private updateDeckComposition(): void {
        // Update deck composition summary
    }

    private updateTradeRouteInfo(): void {
        // Update trade route information
    }

    private updateWarnings(): void {
        // Update any warnings about the expedition setup
    }
} 