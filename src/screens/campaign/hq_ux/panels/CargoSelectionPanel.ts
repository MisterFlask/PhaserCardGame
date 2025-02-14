import { Scene } from 'phaser';
import { EncounterManager } from '../../../../encounters/EncountersList';
import { PlayableCard } from '../../../../gamecharacters/PlayableCard';
import { PlayerCharacter } from '../../../../gamecharacters/PlayerCharacter';
import { GameState } from '../../../../rules/GameState';
import { TextBoxButton } from '../../../../ui/Button';
import { PhysicalCard } from '../../../../ui/PhysicalCard';
import { TextBox } from '../../../../ui/TextBox';
import { CardGuiUtils } from '../../../../utils/CardGuiUtils';
import { SceneChanger } from '../../../SceneChanger';
import { CampaignUiState } from '../CampaignUiState';
import { AbstractHqPanel } from './AbstractHqPanel';

export class CargoSelectionPanel extends AbstractHqPanel {
    private characterContainer: Phaser.GameObjects.Container;
    private cargoContainer: Phaser.GameObjects.Container;
    private locationCard: PhysicalCard | null = null;
    private launchButton: TextBoxButton;
    private backButton: TextBoxButton;
    private statusText: TextBox;
    private fundsDisplay: TextBox;
    private characterCards: Map<PlayerCharacter, PhysicalCard> = new Map();

    constructor(scene: Scene) {
        super(scene, 'Cargo Selection');

        // Create funds display
        this.fundsDisplay = new TextBox({
            scene,
            x: scene.scale.width * 0.5,
            y: 70,
            width: 300,
            height: 40,
            text: `Available Funds: £${GameState.getInstance().moneyInVault}`,
            style: { 
                fontSize: '24px', 
                color: '#ffff00',
                align: 'center'
            }
        });

        // Create containers
        this.characterContainer = this.scene.add.container(0, 0);
        this.cargoContainer = this.scene.add.container(0, 0);
        this.add([this.characterContainer, this.cargoContainer, this.fundsDisplay]);

        // Listen for funds changes
        this.scene.events.on('fundsChanged', () => {
            this.updateFundsDisplay();
        });

        // Create back button (separate from the default return to hub button)
        this.backButton = new TextBoxButton({
            scene,
            x: scene.scale.width * 0.2,
            y: scene.scale.height * 0.85,
            width: 200,
            height: 50,
            text: 'Back to Loadout',
            style: { fontSize: '20px', color: '#ffffff' },
            fillColor: 0x444444
        });

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

        // Create status text
        this.statusText = new TextBox({
            scene,
            x: scene.scale.width * 0.5,
            y: scene.scale.height * 0.85,
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

        this.backButton.onClick(() => this.handleBack());
        this.launchButton.onClick(() => this.handleLaunch());

        this.add([this.backButton, this.launchButton, this.statusText]);

        // Hide the default return to hub button since we have our own back button
        this.returnButton.setVisible(false);
    }

    private handleBack(): void {
        this.hide();
        this.scene.events.emit('navigate', 'loadout');
    }

    private handleLaunch(): void {
        if (this.isReadyToLaunch()) {
            const campaignState = CampaignUiState.getInstance();
            const gameState = GameState.getInstance();
            
            gameState.currentRunCharacters = campaignState.selectedParty;
            
            // No need to copy cards to cargoHolder since we're already using it
            gameState.initializeRun();
            SceneChanger.switchToCombatScene(EncounterManager.getInstance().getShopEncounter(), true);
        }
    }

    private isReadyToLaunch(): boolean {
        const readinessState = this.getReadinessStatus();
        if (!readinessState.ready) {
            console.log("CargoSelectionPanel is not ready to launch: ", readinessState.reasons);
        }
        return readinessState.ready;
    }

    private getReadinessStatus(): { ready: boolean; reasons: string[] } {
        const gameState = GameState.getInstance();
        const reasons: string[] = [];

        // Check if any cargo is selected
        if (gameState.cargoHolder.cardsInMasterDeck.length === 0) {
            reasons.push("No cargo purchased for the expedition");
        }

        return {
            ready: reasons.length === 0,
            reasons
        };
    }

    private updateLaunchButton(): void {
        const status = this.getReadinessStatus();
        this.launchButton.setButtonEnabled(status.ready);

        if (status.ready) {
            this.statusText.setText("Ready to launch!");
            this.statusText.setFillColor(0x006400); // Dark green
        } else {
            const reasonsText = status.reasons.join('\n• ');
            this.statusText.setText(`Cannot launch:\n• ${reasonsText}`);
            this.statusText.setFillColor(0x8B0000); // Dark red
        }
    }

    private displayCharacters(): void {
        // Clear existing character cards
        this.characterCards.forEach(card => card.obliterate());
        this.characterCards.clear();
        this.characterContainer.removeAll(true);

        // Create section for characters
        const characterSection = this.createSection(
            'Expedition Party',
            50,
            100,
            this.scene.scale.width * 0.3,
            this.scene.scale.height - 200
        );
        this.characterContainer.add(characterSection);

        // Display selected party members
        const campaignState = CampaignUiState.getInstance();
        campaignState.selectedParty.forEach((character, index) => {
            const card = CardGuiUtils.getInstance().createCard({
                scene: this.scene,
                x: 100,
                y: 150 + index * 120,
                data: character,
                onCardCreatedEventCallback: (card) => {
                    this.characterCards.set(character, card);
                    this.characterContainer.add(card.container);
                }
            });
        });
    }

    private createSection(title: string, x: number, y: number, width: number, height: number): Phaser.GameObjects.Container {
        const container = this.scene.add.container(x, y);

        // Add border
        const border = this.scene.add.rectangle(0, 0, width, height, 0x666666);
        border.setStrokeStyle(2, 0x888888);
        border.setOrigin(0, 0);

        // Add title
        const titleText = this.scene.add.text(10, 10, title, {
            fontSize: '20px',
            color: '#ffffff',
            backgroundColor: '#444444',
            padding: { x: 10, y: 5 }
        });

        container.add([border, titleText]);
        return container;
    }

    private displayLocationCard(): void {
        if (this.locationCard) {
            this.locationCard.obliterate();
            this.locationCard = null;
        }

        const campaignState = CampaignUiState.getInstance();
        if (campaignState.selectedTradeRoute) {
            this.locationCard = CardGuiUtils.getInstance().createCard({
                scene: this.scene,
                x: this.scene.scale.width * 0.2,
                y: this.scene.scale.height * 0.2,
                data: campaignState.selectedTradeRoute,
                onCardCreatedEventCallback: (card) => {
                    this.add(card.container);
                }
            });
        }
    }

    private displayCargo(): void {
        // Clear existing cargo container and destroy its children
        this.cargoContainer.removeAll(true);

        // Create sections for available and owned cargo
        const availableCargoSection = this.createSection(
            'Available Cargo',
            this.scene.scale.width * 0.4,
            100,
            this.scene.scale.width * 0.25,
            this.scene.scale.height - 200
        );

        const ownedCargoSection = this.createSection(
            'Purchased Cargo',
            this.scene.scale.width * 0.7,
            100,
            this.scene.scale.width * 0.25,
            this.scene.scale.height - 200
        );

        this.cargoContainer.add([availableCargoSection, ownedCargoSection]);

        // Display cargo cards in a grid
        const campaignState = CampaignUiState.getInstance();
        const gameState = GameState.getInstance();
        const GRID_COLS = 2;
        const CARD_WIDTH = 120;
        const CARD_HEIGHT = 160;
        const PADDING = 20;

        // Display available trade goods
        campaignState.availableTradeGoods.forEach((good, index) => {
            const col = index % GRID_COLS;
            const row = Math.floor(index / GRID_COLS);
            
            const x = this.scene.scale.width * 0.45 + col * (CARD_WIDTH + PADDING);
            const y = 150 + row * (CARD_HEIGHT + PADDING);

            const card = CardGuiUtils.getInstance().createCard({
                scene: this.scene,
                x,
                y,
                data: good,
                onCardCreatedEventCallback: (card) => {
                    this.setupAvailableCargoCard(card);
                    
                    // Add price display text
                    const priceText = new TextBox({
                        scene: this.scene,
                        x: CARD_WIDTH / 2,
                        y: CARD_HEIGHT + 10,
                        width: 100,
                        height: 30,
                        text: `£${good.surfacePurchaseValue}`,
                        style: { fontSize: '14px', color: '#ffffff' }
                    });

                    card.container.add(priceText);
                    this.cargoContainer.add(card.container);
                }
            });
        });

        // Display owned trade goods
        gameState.cargoHolder.cardsInMasterDeck.forEach((good, index) => {
            const col = index % GRID_COLS;
            const row = Math.floor(index / GRID_COLS);
            
            const x = this.scene.scale.width * 0.75 + col * (CARD_WIDTH + PADDING);
            const y = 150 + row * (CARD_HEIGHT + PADDING);

            const card = CardGuiUtils.getInstance().createCard({
                scene: this.scene,
                x,
                y,
                data: good,
                onCardCreatedEventCallback: (card) => {
                    this.setupOwnedCargoCard(card);
                    
                    // Add price display text
                    const priceText = new TextBox({
                        scene: this.scene,
                        x: CARD_WIDTH / 2,
                        y: CARD_HEIGHT + 10,
                        width: 100,
                        height: 30,
                        text: `£${good.surfacePurchaseValue}`,
                        style: { fontSize: '14px', color: '#ffffff' }
                    });

                    card.container.add(priceText);
                    this.cargoContainer.add(card.container);
                }
            });
        });
    }

    private setupAvailableCargoCard(card: PhysicalCard): void {
        card.container.setInteractive();
        card.container.on('pointerdown', () => this.purchaseCargo(card.data as PlayableCard));

        // Add hover effects for depth management
        const baseDepth = card.container.depth;
        card.container.on('pointerover', () => {
            card.container.setDepth(1000); // Bring to front when hovered
        });
        card.container.on('pointerout', () => {
            card.container.setDepth(baseDepth); // Restore original depth
        });
    }

    private setupOwnedCargoCard(card: PhysicalCard): void {
        card.container.setInteractive();
        card.container.on('pointerdown', () => this.sellCargo(card.data as PlayableCard));

        // Add hover effects for depth management
        const baseDepth = card.container.depth;
        card.container.on('pointerover', () => {
            card.container.setDepth(1000); // Bring to front when hovered
        });
        card.container.on('pointerout', () => {
            card.container.setDepth(baseDepth); // Restore original depth
        });
    }

    private purchaseCargo(good: PlayableCard): void {
        const gameState = GameState.getInstance();
        const campaignState = CampaignUiState.getInstance();
        
        if (gameState.moneyInVault >= good.surfacePurchaseValue) {
            // Remove from available and add to owned
            const index = campaignState.availableTradeGoods.indexOf(good);
            if (index > -1) {
                campaignState.availableTradeGoods.splice(index, 1);
                gameState.cargoHolder.cardsInMasterDeck.push(good);
                
                // Update money
                gameState.moneyInVault -= good.surfacePurchaseValue;
                
                // Refresh display
                this.scene.events.emit('fundsChanged');
                this.displayCargo();
                this.updateLaunchButton();
            }
        } else {
            this.statusText.setText(`Cannot afford cargo: Need £${good.surfacePurchaseValue}`);
            this.statusText.setFillColor(0x8B0000);
        }
    }

    private sellCargo(good: PlayableCard): void {
        const gameState = GameState.getInstance();
        const campaignState = CampaignUiState.getInstance();
        
        // Remove from owned and add back to available
        const index = gameState.cargoHolder.cardsInMasterDeck.indexOf(good);
        if (index > -1) {
            gameState.cargoHolder.cardsInMasterDeck.splice(index, 1);
            campaignState.availableTradeGoods.push(good);
            
            // Return full purchase value
            gameState.moneyInVault += good.surfacePurchaseValue;
            
            // Refresh display
            this.scene.events.emit('fundsChanged');
            this.displayCargo();
            this.updateLaunchButton();
        }
    }

    private updateFundsDisplay(): void {
        this.fundsDisplay.setText(`Available Funds: £${GameState.getInstance().moneyInVault}`);
    }

    show(): void {
        super.show();
        this.displayCharacters();
        this.displayLocationCard();
        this.displayCargo();
        this.updateFundsDisplay();
        this.updateLaunchButton();
    }

    update(): void {
        this.updateLaunchButton();
    }

    // Override hide to clear dynamic elements when navigating away
    public hide(): void {
        // Obliterate character cards
        this.characterCards.forEach(card => card.obliterate());
        this.characterCards.clear();

        // Obliterate location card if it exists
        if (this.locationCard) {
            this.locationCard.obliterate();
            this.locationCard = null;
        }

        // Remove and destroy all children from the containers so no duplicates remain
        this.characterContainer.removeAll(true);
        this.cargoContainer.removeAll(true);

        super.hide();
    }
} 