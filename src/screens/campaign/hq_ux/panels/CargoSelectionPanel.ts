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
    private locationCard: PhysicalCard | null = null;
    private launchButton: TextBoxButton;
    private backButton: TextBoxButton;
    private statusText: TextBox;
    private fundsDisplay: TextBox;

    // we keep track of all dynamically created objects (except those that have their own destroy/obliterate logic)
    // so we can remove or destroy them when hiding or refreshing
    private characterObjects: Phaser.GameObjects.GameObject[] = [];
    private cargoObjects: Phaser.GameObjects.GameObject[] = [];
    private characterCards: Map<PlayerCharacter, PhysicalCard> = new Map();

    constructor(scene: Scene) {
        super(scene, 'Cargo Selection');

        // create funds display
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
                align: 'center',
            },
        });

        // place fundsDisplay at a visible depth
        scene.add.existing(this.fundsDisplay);
        this.fundsDisplay.setDepth(100);

        // listen for funds changes
        this.scene.events.on('fundsChanged', () => {
            this.updateFundsDisplay();
        });

        // create back button
        this.backButton = new TextBoxButton({
            scene,
            x: scene.scale.width * 0.2,
            y: scene.scale.height * 0.85,
            width: 200,
            height: 50,
            text: 'Back to Loadout',
            style: { fontSize: '20px', color: '#ffffff' },
            fillColor: 0x444444,
        });
        scene.add.existing(this.backButton);
        this.backButton.setDepth(1000);
        this.backButton.setVisible(false);

        // create launch button
        this.launchButton = new TextBoxButton({
            scene,
            x: scene.scale.width * 0.8,
            y: scene.scale.height * 0.85,
            width: 200,
            height: 50,
            text: 'Launch Expedition',
            style: { fontSize: '20px', color: '#ffffff' },
            fillColor: 0x444444,
        });
        scene.add.existing(this.launchButton);
        this.launchButton.setDepth(1000);
        this.launchButton.setVisible(false);

        // create status text
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
                wordWrap: { width: 290 },
            },
        });
        scene.add.existing(this.statusText);
        this.statusText.setDepth(1000);

        // wire up button events
        this.backButton.onClick(() => this.handleBack());
        this.launchButton.onClick(() => this.handleLaunch());

        // hide the default return to hub button since we have our own back button
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
            gameState.initializeRun();
            SceneChanger.switchToCombatScene(
                EncounterManager.getInstance().getShopEncounter(),
                true
            );
        }
    }

    private isReadyToLaunch(): boolean {
        const readinessState = this.getReadinessStatus();
        if (!readinessState.ready) {
            console.log(
                'CargoSelectionPanel is not ready to launch: ',
                readinessState.reasons
            );
        }
        return readinessState.ready;
    }

    private getReadinessStatus(): { ready: boolean; reasons: string[] } {
        const gameState = GameState.getInstance();
        const reasons: string[] = [];

        return {
            ready: reasons.length === 0,
            reasons,
        };
    }

    private updateLaunchButton(): void {
        const status = this.getReadinessStatus();
        this.launchButton.setButtonEnabled(status.ready);

        if (status.ready) {
            this.statusText.setText('Ready to launch!');
            this.statusText.setFillColor(0x006400); // dark green
        } else {
            const reasonsText = status.reasons.join('\n• ');
            this.statusText.setText(`Cannot launch:\n• ${reasonsText}`);
            this.statusText.setFillColor(0x8b0000); // dark red
        }
    }

    private displayCharacters(): void {
        // clear old stuff
        this.characterCards.forEach((card) => card.obliterate());
        this.characterCards.clear();
        this.characterObjects.forEach((obj) => obj.destroy());
        this.characterObjects = [];

        // create a border + title for the character zone
        const characterSection = this.createSection(
            'Expedition Party',
            50,
            100,
            this.scene.scale.width * 0.3,
            this.scene.scale.height - 200
        );
        characterSection.forEach((obj) => {
            this.scene.add.existing(obj);
            if ('setDepth' in obj) {
                (obj as any).setDepth(100);
            }
            this.characterObjects.push(obj);
        });

        // display selected party members
        const campaignState = CampaignUiState.getInstance();
        campaignState.selectedParty.forEach((character, index) => {
            const xPos = 100;
            const yPos = 250 + index * 170;
            const card = CardGuiUtils.getInstance().createCard({
                scene: this.scene,
                x: xPos,
                y: yPos,
                data: character,
                onCardCreatedEventCallback: (createdCard) => {
                    // track it
                    this.scene.add.existing(createdCard.container);
                    createdCard.container.setDepth(500);

                    // Add hover effects similar to cargo cards
                    createdCard.container.setInteractive();
                    createdCard.container.on('pointerover', () => createdCard.container.setDepth(1500));
                    createdCard.container.on('pointerout', () => createdCard.container.setDepth(500));

                    this.characterCards.set(character, createdCard);
                },
            });
        });
    }

    private createSection(
        title: string,
        x: number,
        y: number,
        width: number,
        height: number
    ): Phaser.GameObjects.GameObject[] {
        const border = this.scene.add.rectangle(x, y, width, height, 0x666666);
        border.setOrigin(0, 0);
        border.setStrokeStyle(2, 0x888888);

        const titleText = this.scene.add.text(x + 10, y + 10, title, {
            fontSize: '20px',
            color: '#ffffff',
            backgroundColor: '#444444',
            padding: { x: 10, y: 5 },
        });

        return [border, titleText];
    }

    private displayLocationCard(): void {
        if (this.locationCard) {
            this.locationCard.obliterate();
            this.locationCard = null;
        }

        const campaignState = CampaignUiState.getInstance();
        if (campaignState.selectedTradeRoute) {
            const xPos = this.scene.scale.width * 0.2;
            const yPos = this.scene.scale.height * 0.2;
            this.locationCard = CardGuiUtils.getInstance().createCard({
                scene: this.scene,
                x: xPos,
                y: yPos,
                data: campaignState.selectedTradeRoute,
                onCardCreatedEventCallback: (createdCard) => {
                    this.scene.add.existing(createdCard.container);
                    createdCard.container.setDepth(500);
                },
            });
        }
    }

    private displayCargo(): void {
        // clear existing cargo objects
        this.cargoObjects.forEach((o) => o.destroy());
        this.cargoObjects = [];

        // create sections for available & owned cargo
        const availableSection = this.createSection(
            'Available Cargo',
            this.scene.scale.width * 0.4,
            100,
            this.scene.scale.width * 0.25,
            this.scene.scale.height - 200
        );
        const ownedSection = this.createSection(
            'Purchased Cargo',
            this.scene.scale.width * 0.7,
            100,
            this.scene.scale.width * 0.25,
            this.scene.scale.height - 200
        );
        [...availableSection, ...ownedSection].forEach((obj) => {
            this.scene.add.existing(obj);
            if ('setDepth' in obj) {
                (obj as any).setDepth(100);
            }
            this.cargoObjects.push(obj);
        });

        const campaignState = CampaignUiState.getInstance();
        const gameState = GameState.getInstance();
        const GRID_COLS = 2;
        const CARD_WIDTH = 120;
        const CARD_HEIGHT = 160;
        const PADDING = 20;
        const VERTICAL_SPACING = 70;
        const ROWS_PER_COL = Math.floor((this.scene.scale.height - 350) / (CARD_HEIGHT + VERTICAL_SPACING));

        // display available trade goods
        campaignState.availableTradeGoods.forEach((good, index) => {
            // Fill vertically first, then horizontally
            const col = Math.floor(index / ROWS_PER_COL);
            const row = index % ROWS_PER_COL;
            const xPos =
                this.scene.scale.width * 0.45 + col * (CARD_WIDTH + PADDING);
            const yPos = 250 + row * (CARD_HEIGHT + VERTICAL_SPACING);

            CardGuiUtils.getInstance().createCard({
                scene: this.scene,
                x: xPos,
                y: yPos,
                data: good,
                onCardCreatedEventCallback: (card) => {
                    this.scene.add.existing(card.container);
                    card.container.setDepth(500);

                    // make it interactive
                    card.container.setInteractive();
                    card.container.on('pointerdown', () => this.purchaseCargo(good));
                    card.container.on('pointerover', () => card.container.setDepth(1500));
                    card.container.on('pointerout', () => card.container.setDepth(500));

                    // create price text - now to the right of the card
                    const priceText = new TextBox({
                        scene: this.scene,
                        x: xPos + CARD_WIDTH + 10,
                        y: yPos,
                        width: 60,
                        height: 30,
                        text: `£${good.surfacePurchaseValue}`,
                        style: { fontSize: '14px', color: '#ffffff' },
                    });
                    this.scene.add.existing(priceText);
                    priceText.setDepth(500);

                    // track them for cleanup
                    this.cargoObjects.push(card.container, priceText);
                },
            });
        });

        // display owned trade goods
        gameState.cargoHolder.cardsInMasterDeck.forEach((good, index) => {
            // Fill vertically first, then horizontally
            const col = Math.floor(index / ROWS_PER_COL);
            const row = index % ROWS_PER_COL;
            const xPos =
                this.scene.scale.width * 0.75 + col * (CARD_WIDTH + PADDING);
            const yPos = 250 + row * (CARD_HEIGHT + VERTICAL_SPACING);

            CardGuiUtils.getInstance().createCard({
                scene: this.scene,
                x: xPos,
                y: yPos,
                data: good,
                onCardCreatedEventCallback: (card) => {
                    this.scene.add.existing(card.container);
                    card.container.setDepth(500);

                    // make it interactive
                    card.container.setInteractive();
                    card.container.on('pointerdown', () => this.sellCargo(good));
                    card.container.on('pointerover', () => card.container.setDepth(1500));
                    card.container.on('pointerout', () => card.container.setDepth(500));

                    // create price text - now to the right of the card
                    const priceText = new TextBox({
                        scene: this.scene,
                        x: xPos + CARD_WIDTH + 10,
                        y: yPos,
                        width: 60,
                        height: 30,
                        text: `£${good.surfacePurchaseValue}`,
                        style: { fontSize: '14px', color: '#ffffff' },
                    });
                    this.scene.add.existing(priceText);
                    priceText.setDepth(500);

                    // track them for cleanup
                    this.cargoObjects.push(card.container, priceText);
                },
            });
        });
    }

    private purchaseCargo(good: PlayableCard): void {
        const gameState = GameState.getInstance();
        const campaignState = CampaignUiState.getInstance();

        if (gameState.moneyInVault >= good.surfacePurchaseValue) {
            // remove from available
            const idx = campaignState.availableTradeGoods.indexOf(good);
            if (idx > -1) {
                campaignState.availableTradeGoods.splice(idx, 1);
                gameState.cargoHolder.cardsInMasterDeck.push(good);
                gameState.moneyInVault -= good.surfacePurchaseValue;

                this.scene.events.emit('fundsChanged');
                this.displayCargo();
                this.updateLaunchButton();
            }
        } else {
            this.statusText.setText(
                `Cannot afford cargo: Need £${good.surfacePurchaseValue}`
            );
            this.statusText.setFillColor(0x8b0000);
        }
    }

    private sellCargo(good: PlayableCard): void {
        const gameState = GameState.getInstance();
        const campaignState = CampaignUiState.getInstance();

        const idx = gameState.cargoHolder.cardsInMasterDeck.indexOf(good);
        if (idx > -1) {
            gameState.cargoHolder.cardsInMasterDeck.splice(idx, 1);
            campaignState.availableTradeGoods.push(good);
            gameState.moneyInVault += good.surfacePurchaseValue;

            this.scene.events.emit('fundsChanged');
            this.displayCargo();
            this.updateLaunchButton();
        }
    }

    private updateFundsDisplay(): void {
        this.fundsDisplay.setText(
            `Available Funds: £${GameState.getInstance().moneyInVault}`
        );
    }

    show(): void {
        super.show();
        this.displayCharacters();
        this.displayLocationCard();
        this.displayCargo();
        this.updateFundsDisplay();
        this.updateLaunchButton();
        
        // Ensure buttons are visible only in this screen
        this.launchButton.setVisible(true);
        this.backButton.setVisible(true);
    }

    update(): void {
        this.updateLaunchButton();
    }

    public hide(): void {
        // Ensure buttons are hidden when leaving this screen
        this.launchButton.setVisible(false);
        this.backButton.setVisible(false);

        // obliterate character cards
        this.characterCards.forEach((card) => card.obliterate());
        this.characterCards.clear();

        // obliterate location card if it exists
        if (this.locationCard) {
            this.locationCard.obliterate();
            this.locationCard = null;
        }

        // destroy all ephemeral objects
        this.characterObjects.forEach((obj) => obj.destroy());
        this.characterObjects = [];
        this.cargoObjects.forEach((obj) => obj.destroy());
        this.cargoObjects = [];

        super.hide();
    }
}
