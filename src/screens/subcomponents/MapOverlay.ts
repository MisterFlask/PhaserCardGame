import Phaser from 'phaser';
import { AdjacencyManager } from '../../maplogic/AdjacencyManager';
import { LocationCard } from '../../maplogic/LocationCard';
import { LocationManager } from '../../maplogic/LocationManager';
import { SpatialManager } from '../../maplogic/SpatialManager';
import { GameState } from '../../rules/GameState';
import { TextBoxButton } from '../../ui/Button';
import { DepthManager } from '../../ui/DepthManager';
import { PhysicalCard } from '../../ui/PhysicalCard';
import { UIContext, UIContextManager } from '../../ui/UIContextManager';
import { ActionManagerFetcher } from '../../utils/ActionManagerFetcher';
import { CardGuiUtils } from '../../utils/CardGuiUtils';
import { CampaignBriefStatus } from './CampaignBriefStatus';

export class MapOverlay {
    private scene: Phaser.Scene;
    private overlay: Phaser.GameObjects.Container;
    private isVisible: boolean = false;
    private locationCards: PhysicalCard[] = [];
    private characterCards: PhysicalCard[] = [];
    private adjacencyGraphics: Phaser.GameObjects.Graphics | null = null;
    private campaignBriefStatus: CampaignBriefStatus | null = null;

    // Managers
    private locationManager: LocationManager;
    private spatialManager: SpatialManager;
    private adjacencyManager: AdjacencyManager;

    private background: Phaser.GameObjects.Image | null = null;
    private abortButton: TextBoxButton | null = null;
    private campaignStatusText: Phaser.GameObjects.Text | null = null;
    private moveUpButton: TextBoxButton | null = null;
    private moveDownButton: TextBoxButton | null = null;
    private closeButton: TextBoxButton | null = null;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        this.overlay = this.scene.add.container(0, 0)
            .setVisible(false)
            .setDepth(DepthManager.getInstance().MAP_OVERLAY);

        // Initialize Managers
        this.locationManager = new LocationManager();
        this.spatialManager = new SpatialManager(this.scene.scale.width, this.scene.scale.height);
        this.adjacencyManager = new AdjacencyManager(0.3, 1);

        // Initialize components
        ActionManagerFetcher.getActionManager();
        this.createOverlay();
    }

    private createOverlay(): void {
        // Update spatial manager with actual dimensions
        const { width, height } = this.scene.scale;
        this.spatialManager.updateDimensions(width, height);

        this.createBackground();
        this.createCampaignBriefStatus();
        this.createAdjacencyGraphics();
        this.generateAndPlaceLocations();
        this.createPhysicalLocationCards();
        this.createCharacterCards();
        this.createAdjacencyLines();
        this.createAbortButton();
        this.createCampaignStatusText();
        this.createCameraButtons();

        this.scene.scale.on('resize', this.resize, this);
        this.resize();

        // Call the update function
        this.scene.events.on('update', this.update, this);
        this.updateHighlights();

        // Add close button
        this.closeButton = new TextBoxButton({
            scene: this.scene,
            x: width - 50,
            y: 50,
            width: 40,
            height: 40,
            text: 'X',
            style: { fontSize: '24px', color: '#ffffff' },
            textBoxName: 'closeButton'
        });
        this.closeButton.onClick(this.hide.bind(this));
        this.closeButton.setScrollFactor(0);
        this.overlay.add(this.closeButton);
    }

    // Background creation
    private createBackground() {
        this.background = this.scene.add.image(this.scene.scale.width / 2, this.scene.scale.height / 2, 'mapbackground1');
        this.background.setOrigin(0.5, 0.5);
        this.background.setScrollFactor(0);
        this.background.setDisplaySize(this.scene.scale.width, this.scene.scale.height);
        this.overlay.add(this.background);
    }

    // Campaign Brief Status
    private createCampaignBriefStatus() {
        this.campaignBriefStatus = new CampaignBriefStatus(this.scene);
        this.campaignBriefStatus.setScrollFactor(0);
        this.campaignBriefStatus.setDepth(DepthManager.getInstance().UI_BASE);
        this.overlay.add(this.campaignBriefStatus);
    }

    // Adjacency Graphics
    private createAdjacencyGraphics() {
        this.adjacencyGraphics = new Phaser.GameObjects.Graphics(this.scene, { lineStyle: { width: 2, color: 0xffffff } });
        this.overlay.add(this.adjacencyGraphics!);
    }

    // Generate and place locations
    private generateAndPlaceLocations(force: boolean = false) {
        if (GameState.getInstance().mapInitialized && !force) {
            return;
        }
        
        const locationData = this.locationManager.initializeLocations();
        GameState.getInstance().setLocations(locationData);

        this.adjacencyManager.enrichLocationsWithAdjacencies();
        this.spatialManager.enrichLocationsWithPositioning();
        GameState.getInstance().mapInitialized = true;
    }

    // Create Physical Location Cards
    private createPhysicalLocationCards() {
        const locations = GameState.getInstance().getLocations();
        const depthManager = DepthManager.getInstance();

        locations.forEach(location => {
            const card = CardGuiUtils.getInstance().createCard({
                scene: this.scene,
                x: location.xPos,
                y: location.yPos,
                data: location,
                onCardCreatedEventCallback: this.setupLocationCardEvents
            });
            card.container.setDepth(depthManager.CARD_BASE);
            this.locationCards.push(card);
            this.overlay.add(card.container);
        });

        this.updatePlayerLocationIcon();
    }

    // Update Player Location Icon
    private updatePlayerLocationIcon() {
        const currentLocation = GameState.getInstance().getCurrentLocation();
        const currentLocationCard = this.locationCards.find(card => (card.data as LocationCard).id === currentLocation?.id);
        if (currentLocationCard) {
            currentLocationCard.container.list.forEach(child => {
                if (child.name === "currentLocationIcon") {
                    child.destroy();
                }
            });

            const portraitWidth = currentLocationCard.cardImage.displayWidth;
            const portraitHeight = currentLocationCard.cardImage.displayHeight;

            const currentLocationIcon = this.scene.add.image(0, -currentLocationCard.cardBackground.displayHeight / 4, 'old-wagon');
            currentLocationIcon.setDisplaySize(portraitWidth / 2, portraitHeight / 2);
            currentLocationIcon.setDepth(1);
            currentLocationIcon.setName("currentLocationIcon");
            currentLocationCard.container.add(currentLocationIcon);
        }
    }

    // Create Character Cards
    private createCharacterCards() {
        const gameState = GameState.getInstance();
        const characters = gameState.getCurrentRunCharacters();

        characters.forEach((character, index) => {
            const card = CardGuiUtils.getInstance().createCard({
                scene: this.scene,
                x: 0,
                y: 0,
                data: character,
                onCardCreatedEventCallback: this.setupCharacterCardEvents
            });
            this.characterCards.push(card);
            this.overlay.add(card.container);
        });
    }

    // Create Adjacency Lines
    private createAdjacencyLines() {
        if (!this.adjacencyGraphics) return;

        this.adjacencyGraphics.clear();
        this.adjacencyGraphics.lineStyle(2, 0xaaaaaa, 1);

        const locations = GameState.getInstance().getLocations();

        locations.forEach(location => {
            const fromX = location.xPos;
            const fromY = location.yPos;

            location.adjacentLocations.forEach(adj => {
                if (adj.id > location.id) {
                    const toX = adj.xPos;
                    const toY = adj.yPos;
                    this.adjacencyGraphics!.strokeLineShape(new Phaser.Geom.Line(fromX, fromY, toX, toY));
                }
            });
        });
    }

    // Create Abort Button
    private createAbortButton() {
        const { width, height } = this.scene.scale;
        const buttonWidth = 300;
        const buttonHeight = 80;
        const buttonX = width / 2;
        const buttonY = height - 60;

        this.abortButton = new TextBoxButton({
            scene: this.scene,
            x: buttonX,
            y: buttonY,
            width: buttonWidth,
            height: buttonHeight,
            text: 'ABORT MISSION\n(fee: 50% of current revenues)',
            style: { fontSize: '24px', color: '#ffffff', align: 'center' },
            fillColor: 0xff0000,
            textBoxName: 'abortButton'
        });
        this.abortButton
            .onClick(() => this.onAbortMission())
            .setScrollFactor(0);
        this.overlay.add(this.abortButton);
    }

    // Create Campaign Status Text
    private createCampaignStatusText() {
        const { width, height } = this.scene.scale;
        const padding = 20;
        const x = width - padding;
        const y = padding;
        this.campaignStatusText = this.scene.add.text(x, y, this.getCampaignStatusText(), {
            fontSize: '18px',
            color: '#ffffff',
            align: 'right'
        }).setOrigin(1, 0);
        this.campaignStatusText.setScrollFactor(0);
        this.overlay.add(this.campaignStatusText);
    }

    private getCampaignStatusText(): string {
        return [
            this.getMissionStatusText(),
            this.getTeamStatusText(),
            this.getResourceStatusText()
        ].join('\n\n');
    }

    private getMissionStatusText(): string {
        // TODO: Implement actual mission status logic
        return 'Mission Status:\nIn Progress - Day 3 of 7';
    }

    private getTeamStatusText(): string {
        const gameState = GameState.getInstance();
        const characters = gameState.getCurrentRunCharacters();
        return `Team Status:\n${characters.length} Characters Active`;
    }

    private getResourceStatusText(): string {
        // TODO: Implement actual resource status logic
        return 'Resources:\nGold: 1000\nSupplies: 75%';
    }
    // Create Camera Buttons
    private createCameraButtons() {
        const { width, height } = this.scene.scale;
        const buttonWidth = 100;
        const buttonHeight = 50;
        const padding = 20;

        // Move Up Button
        this.moveUpButton = new TextBoxButton({
            scene: this.scene,
            x: padding + buttonWidth / 2,
            y: padding + buttonHeight / 2,
            width: buttonWidth,
            height: buttonHeight,
            text: 'Move Up',
            style: { fontSize: '20px', color: '#000000' },
            fillColor: 0x00ff00,
            textBoxName: 'moveUpButton'
        });
        this.moveUpButton
            .onClick(() => this.panCameraUp())
            .setScrollFactor(0);
        this.overlay.add(this.moveUpButton);

        // Move Down Button
        this.moveDownButton = new TextBoxButton({
            scene: this.scene,
            x: padding + buttonWidth / 2,
            y: padding + buttonHeight * 1.5 + 10,
            width: buttonWidth,
            height: buttonHeight,
            text: 'Move Down',
            style: { fontSize: '20px', color: '#000000' },
            fillColor: 0x00ff00,
            textBoxName: 'moveDownButton'
        });
        this.moveDownButton
            .onClick(() => this.panCameraDown())
            .setScrollFactor(0);
        this.overlay.add(this.moveDownButton);

        // Add scroll wheel functionality for camera panning
        this.scene.input.on('wheel', (pointer: Phaser.Input.Pointer, gameObjects: Phaser.GameObjects.GameObject[], deltaX: number, deltaY: number, deltaZ: number) => {
            if (!this.isVisible) return;

            if (deltaY > 0) {
                this.panCameraDown();
            } else if (deltaY < 0) {
                this.panCameraUp();
            }
        });
    }

    private panCameraUp() {
        console.log("panCameraUp");
        this.scene.cameras.main.scrollY -= 50;
    }

    private panCameraDown() {
        console.log("panCameraDown");
        this.scene.cameras.main.scrollY += 50;
    }

    // Highlight Updates
    public updateHighlights() {
        // Clear glow effects on all location cards
        this.locationCards.forEach(card => {
            card.setGlow(false);
        });
        
        const currentLocation = GameState.getInstance().getCurrentLocation();
        const currentLocationCard = this.locationCards.find(card => (card.data as LocationCard).id === currentLocation?.id);
        if (currentLocationCard) {
            currentLocationCard.glowColor = 0x00ff00;
            currentLocationCard.setGlow(true);
        }
        const nextLocations = currentLocation?.adjacentLocations;
        nextLocations?.forEach(loc => {
            const nextLocationCard = this.locationCards.find(card => (card.data as LocationCard).id === loc.id);
            if (nextLocationCard) {
                nextLocationCard.setGlow(true);
            }
        });
    }

    // Setup Location Card Events
    private setupLocationCardEvents = (card: PhysicalCard) => {
        card.container.setInteractive();
        card.container.on('pointerdown', () => {
            if (card.data instanceof LocationCard) {
                const gameState = GameState.getInstance();
                gameState.setCurrentLocation(card.data);
                
                GameState.getInstance().relicsInventory.forEach(relic => {
                    relic.onLocationEntered(card.data as LocationCard)
                });

                card.data.OnLocationSelected(this.scene);
                this.updatePlayerLocationIcon();
            }
        });
    }

    // Setup Character Card Events
    private setupCharacterCardEvents = (card: PhysicalCard) => {
        // Character card events can be set up here if needed
    }

    // Resize Handler
    private resize(): void {
        const { width, height } = this.scene.scale;

        // Update background
        if (this.background) {
            this.background.setDisplaySize(width, height);
            this.background.setPosition(width / 2, height / 2);
        }

        // Update campaign brief status position
        if (this.campaignBriefStatus) {
            this.campaignBriefStatus.setPosition(600, 10);
        }

        // Update spatial manager dimensions
        this.spatialManager.updateDimensions(width, height);

        // Reposition character cards
        this.positionCharacterCards(width, height);

        // Reposition abort button
        this.positionAbortButton(width, height);

        // Reposition campaign status text
        this.positionCampaignStatusText(width, height);

        // Reposition camera buttons
        this.positionCameraButtons(width, height);
    }

    private positionCharacterCards(width: number, height: number) {
        const rightEdge = width - 100;
        const cardSpacing = height * 0.25;
        const startY = height * 0.25;

        this.characterCards.forEach((card, index) => {
            card.container.setPosition(rightEdge, startY + index * cardSpacing);
            card.container.setScrollFactor(0);
        });
    }

    private positionAbortButton(width: number, height: number) {
        if (this.abortButton) {
            this.abortButton.setPosition(width / 2, height - 60);
        }
    }

    private positionCampaignStatusText(width: number, height: number) {
        if (this.campaignStatusText) {
            const padding = 20;
            this.campaignStatusText.setPosition(width - padding, padding);
        }
    }

    private positionCameraButtons(width: number, height: number) {
        if (this.moveUpButton) {
            this.moveUpButton.setPosition(20 + this.moveUpButton.width / 2, 20 + this.moveUpButton.height / 2);
        }
        if (this.moveDownButton) {
            this.moveDownButton.setPosition(20 + this.moveDownButton.width / 2, 20 + this.moveDownButton.height * 1.5 + 10);
        }
    }

    // Update Method
    private update(time: number, delta: number): void {
        this.updateHighlights();
    }


    // Abort Mission Logic
    private onAbortMission(): void {
        console.log('Mission aborted');
        // Implement abort mission logic here
    }

    // Public Methods to Control Overlay
    public show(): void {
        this.overlay.setVisible(true);
        this.isVisible = true;
        this.resetCameraPosition();
        UIContextManager.getInstance().setContext(UIContext.MAP);
    }

    public hide(): void {
        this.overlay.setVisible(false);
        this.isVisible = false;
        this.resetCameraPosition();
        UIContextManager.getInstance().setContext(UIContext.COMBAT);
        
        // Ensure the campaign brief status is properly updated when hiding
        if (this.campaignBriefStatus) {
            this.scene.events.emit('propagateGameStateChangesToUi');
        }
    }

    public toggle(): void {
        this.isVisible ? this.hide() : this.show();
    }

    private resetCameraPosition(): void {
        this.scene.cameras.main.scrollX = 0;
        this.scene.cameras.main.scrollY = 0;
    }
}
