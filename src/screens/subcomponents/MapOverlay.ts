import Phaser from 'phaser';
import { AdjacencyLineRenderer } from '../../maplogic/AdjacencyLineRenderer';
import { AdjacencyManager } from '../../maplogic/AdjacencyManager';
import { LocationCard } from '../../maplogic/LocationCard';
import { LocationManager } from '../../maplogic/LocationManager';
import { SpatialManager } from '../../maplogic/SpatialManager';
import { GameState } from '../../rules/GameState';
import { TextBoxButton } from '../../ui/Button';
import { DepthManager } from '../../ui/DepthManager';
import { PhysicalCard } from '../../ui/PhysicalCard';
import { TransientUiState } from '../../ui/TransientUiState';
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
    private campaignBriefStatus: CampaignBriefStatus | null = null;

    // Managers
    private locationManager: LocationManager;
    private spatialManager: SpatialManager;
    private adjacencyManager: AdjacencyManager;

    private background: Phaser.GameObjects.Image  | null = null;
    private abortButton: TextBoxButton | null = null;
    private campaignStatusText: Phaser.GameObjects.Text | null = null;
    private moveUpButton: TextBoxButton | null = null;
    private moveDownButton: TextBoxButton | null = null;
    private closeButton: TextBoxButton | null = null;

    private adjacencyLineRenderer: AdjacencyLineRenderer;

    private currentLocationIcon: Phaser.GameObjects.Image | null = null;
    private isLocationTransitionInProgress: boolean = false;

    private readonly TRANSITION_DURATION: number = 500;
    private readonly SLIDE_DISTANCE: number = 2000;
    private isTransitioning: boolean = false;

    background_by_act: Record<number, string> = {
        1: 'styx_delta',
        2: 'dis',
        3: 'styx_delta'
    } as const;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        this.overlay = this.scene.add.container(0, 0)
            .setVisible(false)
            .setDepth(DepthManager.getInstance().MAP_OVERLAY + 1000);

        // Initialize Managers
        this.locationManager = new LocationManager();
        this.spatialManager = new SpatialManager(this.scene.scale.width, this.scene.scale.height);
        this.adjacencyManager = new AdjacencyManager(0.3, 1);

        // Initialize components
        ActionManagerFetcher.getActionManager();
        this.adjacencyLineRenderer = new AdjacencyLineRenderer(this.scene, this.overlay);
        this.createOverlay();

        // Listen for map regeneration event
        this.scene.events.on('regenerateMap', (force: boolean) => {
            console.log('regenerateMap', force);
            this.regenerateMap(force);
        });

        // Listen for show map overlay event
        this.scene.events.on('showMapOverlay', () => {
            console.log('showMapOverlay');
            this.show();
        });
    }

    private createOverlay(): void {
        // Update spatial manager with actual dimensions
        const { width, height } = this.scene.scale;
        this.spatialManager.updateDimensions(width, height);

        this.createBackground();
        this.createCampaignBriefStatus();
        this.generateAndPlaceLocations();
        this.createAdjacencyLines();
        this.createPhysicalLocationCards();
        this.createCharacterCards();
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
        const currentAct = GameState.getInstance().currentAct;
        const backgroundName = this.background_by_act[currentAct] ?? 'styx_delta';
        const { width, height } = this.scene.scale;

        // Create the background image
        this.background = this.scene.add.image(width / 2, height / 2, backgroundName).setOrigin(0.5, 0.5);
        this.background.setScrollFactor(1);

        // Calculate scaling to cover the screen while maintaining aspect ratio
        const scaleX = width / this.background.width;
        const scaleY = height / this.background.height;
        const scale = Math.max(scaleX, scaleY);
        this.background.setScale(scale);

        // Apply the grayscale post-processing pipeline
        this.background.setPostPipeline('GrayscalePostFX');

        // Add to overlay
        this.overlay.add(this.background);
    }

    // Campaign Brief Status
    private createCampaignBriefStatus() {
        this.campaignBriefStatus = new CampaignBriefStatus(this.scene);
        this.campaignBriefStatus.setScrollFactor(0);
        this.campaignBriefStatus.setDepth(DepthManager.getInstance().UI_BASE);
        this.overlay.add(this.campaignBriefStatus);
    }

    // Generate and place locations
    public generateAndPlaceLocations(force: boolean = false) {
        if (GameState.getInstance().mapInitialized && !force) {
            return;
        }
        
        const locationData = this.locationManager.initializeLocations();
        GameState.getInstance().setLocations(locationData);

        this.adjacencyManager.enrichLocationsWithAdjacencies();
        this.spatialManager.enrichLocationsWithPositioning();
        const reachableLocations = this.locationManager.cullUnreachableRooms(locationData);
        GameState.getInstance().setLocations(reachableLocations);
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
            card.container.setDepth(depthManager.MAP_LOCATIONS);
            this.locationCards.push(card);
            this.overlay.add(card.container);
        });

        this.updatePlayerLocationIcon();
    }

    // Update Player Location Icon
    private updatePlayerLocationIcon() {
        const currentLocation = GameState.getInstance().getCurrentLocation();
        const targetCard = this.locationCards.find(card => (card.data as LocationCard).id === currentLocation?.id);
        
        if (!targetCard) return;

        if (!this.currentLocationIcon) {
            this.currentLocationIcon = this.scene.add.image(0, 0, 'old-wagon');
            const portraitWidth = targetCard.cardImage.displayWidth;
            const portraitHeight = targetCard.cardImage.displayHeight;
            this.currentLocationIcon.setDisplaySize(portraitWidth / 2, portraitHeight / 2);
            this.overlay.add(this.currentLocationIcon);

            // Set depth higher than MAP_LOCATIONS
            this.currentLocationIcon.setDepth(DepthManager.getInstance().MAP_LOCATIONS + 1);

            // Bring icon to top of the overlay container
            this.overlay.bringToTop(this.currentLocationIcon);
            
            // Set initial position
            const targetPos = this.getIconPositionForCard(targetCard);
            this.currentLocationIcon.setPosition(targetPos.x, targetPos.y);
        } else {
            // Get target position
            const targetPos = this.getIconPositionForCard(targetCard);
            
            // Start lerp animation
            this.isLocationTransitionInProgress = true;
            this.scene.tweens.add({
                targets: this.currentLocationIcon,
                x: targetPos.x,
                y: targetPos.y,
                duration: 1500,
                ease: 'Power2',
                onStart: () => {
                    // Bring icon to top at the start of the tween
                    if (this.currentLocationIcon) {
                        this.overlay.bringToTop(this.currentLocationIcon);
                    }
                },
                onUpdate: () => {
                    // Ensure depth remains higher during the tween
                    this.currentLocationIcon?.setDepth(DepthManager.getInstance().MAP_LOCATIONS + 1);
                },
                onComplete: () => {
                    this.isLocationTransitionInProgress = false;
                    if (currentLocation) {
                        currentLocation.OnLocationSelected(this.scene);
                    }
                }
            });
        }
    }

    private getIconPositionForCard(card: PhysicalCard): { x: number, y: number } {
        const worldPos = card.container.getWorldTransformMatrix();
        return {
            x: worldPos.tx,
            y: worldPos.ty - card.cardBackground.displayHeight / 4
        };
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
        const locations = GameState.getInstance().getLocations();
        this.adjacencyLineRenderer.renderAdjacencyLines(locations);
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
        // Clear glow effects on all location cards and breadcrumb highlights
        this.locationCards.forEach(card => {
            card.setGlow(false);
        });
        this.adjacencyLineRenderer.clearHighlights();
        
        const hoveredCard = TransientUiState.getInstance().hoveredCard;
        const currentLocation = GameState.getInstance().getCurrentLocation();

        if (hoveredCard && hoveredCard.data instanceof LocationCard) {
            // If we're hovering a location, highlight its connections
            hoveredCard.glowColor = 0x00ff00;
            hoveredCard.setGlow(true);
            this.adjacencyLineRenderer.highlightConnectionsForLocation(hoveredCard.data);
            
            // Also highlight adjacent locations
            hoveredCard.data.adjacentLocations?.forEach(loc => {
                const adjacentCard = this.locationCards.find(card => (card.data as LocationCard).id === loc.id);
                if (adjacentCard) {
                    adjacentCard.setGlow(true);
                }
            });
        } else if (currentLocation) {
            // If no location is hovered, highlight current location and its connections
            const currentLocationCard = this.locationCards.find(card => (card.data as LocationCard).id === currentLocation?.id);
            if (currentLocationCard) {
                currentLocationCard.glowColor = 0x00ff00;
                currentLocationCard.setGlow(true);
                this.adjacencyLineRenderer.highlightConnectionsForLocation(currentLocation);
            }
            
            const nextLocations = currentLocation?.adjacentLocations;
            nextLocations?.forEach(loc => {
                const nextLocationCard = this.locationCards.find(card => (card.data as LocationCard).id === loc.id);
                if (nextLocationCard) {
                    nextLocationCard.setGlow(true);
                }
            });
        }
    }

    // Setup Location Card Events
    private setupLocationCardEvents = (card: PhysicalCard) => {
        card.container.setInteractive();
        card.container.on('pointerdown', () => {
            if (this.isLocationTransitionInProgress) return; // Early return if transition is in progress
            
            if (card.data instanceof LocationCard) {
                const gameState = GameState.getInstance();
                gameState.setCurrentLocation(card.data);
                
                GameState.getInstance().relicsInventory.forEach(relic => {
                    relic.onLocationEntered(card.data as LocationCard)
                });

                // OnLocationSelected is now called after the lerp completes
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
            const scaleX = width / this.background.width;
            const scaleY = height / this.background.height;
            const scale = Math.max(scaleX, scaleY);
            this.background.setScale(scale);
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

    // Add new method to center camera on player location
    private centerCameraOnPlayerLocation(): void {
        const currentLocation = GameState.getInstance().getCurrentLocation();
        const targetCard = this.locationCards.find(card => (card.data as LocationCard).id === currentLocation?.id);
        
        if (!targetCard) return;

        // Get the world position of the target card
        const worldPos = targetCard.container.getWorldTransformMatrix();
        const { width, height } = this.scene.scale;

        // Calculate the scroll position needed to center on the target
        const scrollX = worldPos.tx - width / 2;
        const scrollY = worldPos.ty - height / 2;

        // Smoothly pan to the target position
        this.scene.tweens.add({
            targets: this.scene.cameras.main,
            scrollX: scrollX,
            scrollY: scrollY,
            duration: 1000,
            ease: 'Power2'
        });
    }

    // Modify the show method to center on player after showing
    public show(): void {
        if (this.isTransitioning || this.isVisible) return;
        this.isTransitioning = true;
        
        // Make visible but start off-screen
        this.overlay.setVisible(true);
        this.overlay.setPosition(this.SLIDE_DISTANCE, 0);
        
        // Tween into view
        this.scene.tweens.add({
            targets: this.overlay,
            x: 0,
            duration: this.TRANSITION_DURATION,
            ease: 'Power2',
            onComplete: () => {
                this.isVisible = true;
                this.isTransitioning = false;
                this.resetCameraPosition();
                UIContextManager.getInstance().setContext(UIContext.MAP);
                // Add slight delay before centering to ensure everything is properly positioned
                this.scene.time.delayedCall(100, () => {
                    this.centerCameraOnPlayerLocation();
                });
            }
        });
    }

    public hide(): void {
        if (this.isTransitioning || !this.isVisible) return;
        this.isTransitioning = true;
        
        // Tween out of view
        this.scene.tweens.add({
            targets: this.overlay,
            x: this.SLIDE_DISTANCE,
            duration: this.TRANSITION_DURATION,
            ease: 'Power2',
            onComplete: () => {
                this.overlay.setVisible(false);
                this.isVisible = false;
                this.isTransitioning = false;
                this.resetCameraPosition();
                UIContextManager.getInstance().setContext(UIContext.COMBAT);
                
                // Ensure the campaign brief status is properly updated when hiding
                if (this.campaignBriefStatus) {
                    this.scene.events.emit('propagateGameStateChangesToUi');
                }
            }
        });
    }

    public toggle(): void {
        if (this.isTransitioning) return;
        this.isVisible ? this.hide() : this.show();
    }

    // Modify resetCameraPosition to not interfere with our centering
    private resetCameraPosition(): void {
        // Only reset camera when hiding the map
        if (!this.isVisible) {
            this.scene.cameras.main.scrollX = 0;
            this.scene.cameras.main.scrollY = 0;
        }
    }

    private regenerateMap(force: boolean): void {
        // Clear existing location cards
        this.locationCards.forEach(card => {
            card.obliterate()
        });
        this.locationCards = [];

        if (this.background) {
            this.background.destroy();
            this.background = null;
        }

        // Recreate background
        this.createBackground();

        // Regenerate the map
        this.generateAndPlaceLocations(force);
        this.createAdjacencyLines();
        this.createPhysicalLocationCards();
    }
    
}
