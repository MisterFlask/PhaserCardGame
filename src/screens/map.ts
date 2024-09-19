// src/scenes/MapScene.ts

import Phaser from 'phaser';
import { AdjacencyManager } from '../maplogic/AdjacencyManager';
import { LocationCard } from '../maplogic/LocationCard';
import { LocationManager } from '../maplogic/LocationManager';
import { SpatialManager } from '../maplogic/SpatialManager';
import { GameState } from '../rules/GameState';
import { PhysicalCard } from '../ui/PhysicalCard';
import { CardGuiUtils } from '../utils/CardGuiUtils';

export default class MapScene extends Phaser.Scene {
    private locationCards: PhysicalCard[] = [];
    private characterCards: PhysicalCard[] = [];
    private background: Phaser.GameObjects.Image | null = null;
    private abortButton: Phaser.GameObjects.Container | null = null;
    private campaignStatusText: Phaser.GameObjects.Text | null = null;

    // Managers
    private locationManager: LocationManager;
    private spatialManager: SpatialManager;
    private adjacencyManager: AdjacencyManager;

    // Graphics for adjacency lines
    private adjacencyGraphics: Phaser.GameObjects.Graphics | null = null;

    constructor() {
        super('MapScene');
        this.locationManager = new LocationManager();
        this.spatialManager = new SpatialManager(800, 600); // Initial dummy values, will update in create()
        this.adjacencyManager = new AdjacencyManager(0.3, 1); // Adjust sparseness and minConnections here
    }

    preload() {
        this.load.image('mapbackground1', 'https://raw.githubusercontent.com/MisterFlask/PhaserCardGame/master/resources/Sprites/Backgrounds/mapbackground1.png');
        this.load.image('cursed-star', 'path_to_cursed_star_image.png'); // Ensure you have this asset
    }

    create() {        

        // Update spatial manager with actual dimensions
        const { width, height } = this.scale;
        this.spatialManager.updateDimensions(width, height);

        this.createBackground();
        this.createAdjacencyGraphics();
        this.generateAndPlaceLocations();
        this.createPhysicalLocationCards();
        this.createCharacterCards();
        this.createAdjacencyLines();
        this.createAbortButton();
        this.createCampaignStatusText();

        this.scale.on('resize', this.resize, this);
        this.resize();
        // Call the update function
        this.events.on('update', this.update, this);
    }

    createAdjacencyGraphics() {
        this.adjacencyGraphics = new Phaser.GameObjects.Graphics(this, { lineStyle: { width: 2, color: 0xffffff } });
        this.add.existing(this.adjacencyGraphics!);
    }

    generateAndPlaceLocations() {
        this.locationManager.initializeLocations();

        const allLocations = GameState.getInstance().locations;
        const selectedLocations = Phaser.Math.RND.shuffle(allLocations.slice()).slice(0, 9);
        GameState.getInstance().setLocations(selectedLocations);
        this.spatialManager.arrangeLocations(selectedLocations);
        this.adjacencyManager.generateAdjacencies(selectedLocations);
        GameState.getInstance().setCurrentLocation(selectedLocations[0]); // Set Entrance as starting location
    }

    createBackground() {
        this.background = this.add.image(this.scale.width / 2, this.scale.height / 2, 'mapbackground1'); // Center the background
        this.background.setOrigin(0.5, 0.5);
        this.resizeBackground();
    }

    createPhysicalLocationCards() {
        const { width, height } = this.scale;
        const locations = GameState.getInstance().getLocations();

        locations.forEach(location => {
            const card = CardGuiUtils.getInstance().createCard({
                scene: this,
                x: location.xPos,
                y: location.yPos,
                data: location,
                eventCallback: this.setupLocationCardEvents
            });
            card.container.setDepth(10); // Increased depth to ensure visibility
            this.locationCards.push(card);
        });

        // Add player location icon
        this.updatePlayerLocationIcon();
    }

    updatePlayerLocationIcon() {
        const currentLocation = GameState.getInstance().getCurrentLocation();
        const currentLocationCard = this.locationCards.find(card => card.data.id === currentLocation?.id);
        if (currentLocationCard) {
            // Remove existing icons if any
            currentLocationCard.container.list.forEach(child => {
                if (child.name === "currentLocationIcon") {
                    child.destroy();
                }
            });

            // Get the dimensions of the card portrait
            const portraitWidth = currentLocationCard.cardImage.displayWidth;
            const portraitHeight = currentLocationCard.cardImage.displayHeight;

            // Create a new image with the same dimensions as the card portrait
            const currentLocationIcon = this.add.image(0, -currentLocationCard.cardBackground.displayHeight / 4, 'cursed-star');
            currentLocationIcon.setDisplaySize(portraitWidth / 2, portraitHeight / 2); // Adjust size as needed
            currentLocationIcon.setDepth(1);
            currentLocationIcon.setName("currentLocationIcon");
            currentLocationCard.container.add(currentLocationIcon);

            // Optionally, add a glow effect to make it stand out
            // Note: Phaser doesn't have a built-in glow effect. You might need a shader or use a plugin.
        }
    }

    createAdjacencyLines() {
        this.adjacencyGraphics!.clear();
        this.adjacencyGraphics!.lineStyle(2, 0xaaaaaa, 1);

        const locations = GameState.getInstance().getLocations();

        locations.forEach(location => {
            const fromX = location.xPos;
            const fromY = location.yPos;

            location.adjacentLocations.forEach(adj => {
                // To prevent drawing duplicate lines, only draw if adj's id is greater
                if (adj.id > location.id) {
                    const toX = adj.xPos;
                    const toY = adj.yPos;
                    this.adjacencyGraphics!.strokeLineShape(new Phaser.Geom.Line(fromX, fromY, toX, toY));
                }
            });
        });
    }

    createCharacterCards() {
        const gameState = GameState.getInstance();
        const characters = gameState.getCurrentRunCharacters();

        characters.forEach((character, index) => {
            const card = CardGuiUtils.getInstance().createCard({
                scene: this,
                x: 0,
                y: 0,
                data: character,
                eventCallback: this.setupCharacterCardEvents
            });
            this.characterCards.push(card);
        });
    }

    createAbortButton() {
        const { width, height } = this.scale;
        const buttonWidth = 300;
        const buttonHeight = 80;
        const buttonX = width / 2;
        const buttonY = height - 60;

        const button = this.add.rectangle(0, 0, buttonWidth, buttonHeight, 0xff0000);
        const abortText = this.add.text(0, -15, 'ABORT MISSION', { fontSize: '32px', color: '#ffffff' }).setOrigin(0.5);
        const feeText = this.add.text(0, 20, '(fee: 50% of current revenues)', { fontSize: '16px', color: '#ffffff' }).setOrigin(0.5);

        this.abortButton = this.add.container(buttonX, buttonY, [button, abortText, feeText]);
        this.abortButton.setSize(buttonWidth, buttonHeight);
        this.abortButton.setInteractive({ useHandCursor: true })
            .on('pointerover', () => button.setFillStyle(0xff3333))
            .on('pointerout', () => button.setFillStyle(0xff0000))
            .on('pointerdown', () => this.onAbortMission());
    }

    createCampaignStatusText() {
        const { width, height } = this.scale;
        const padding = 20;
        const x = width - padding;
        const y = padding;
        this.campaignStatusText = this.add.text(x, y, this.getCampaignStatusText(), {
            fontSize: '18px',
            color: '#ffffff',
            align: 'right'
        }).setOrigin(1, 0);
    }

    getCampaignStatusText(): string {
        return [
            this.getMissionStatusText(),
            this.getTeamStatusText(),
            this.getResourceStatusText()
        ].join('\n\n');
    }

    getMissionStatusText(): string {
        // TODO: Implement actual mission status logic
        return 'Mission Status:\nIn Progress - Day 3 of 7';
    }

    getTeamStatusText(): string {
        const gameState = GameState.getInstance();
        const characters = gameState.getCurrentRunCharacters();
        return `Team Status:\n${characters.length} Characters Active`;
    }

    getResourceStatusText(): string {
        // TODO: Implement actual resource status logic
        return 'Resources:\nGold: 1000\nSupplies: 75%';
    }

    onAbortMission() {
        console.log('Mission aborted');
        // Implement abort mission logic here
    }

    setupLocationCardEvents = (card: PhysicalCard) => {
        card.container.setInteractive();
        card.container.on('pointerdown', () => {
            if (card.data instanceof LocationCard) {
                const gameState = GameState.getInstance();
                const currentLocation = gameState.getCurrentLocation();
                if (currentLocation?.adjacentLocations.includes(card.data)) {
                    gameState.setCurrentLocation(card.data);
                    card.data.OnLocationSelected(this);
                    this.updatePlayerLocationIcon();
                } else {
                    console.log('Cannot move to non-adjacent location.');
                }
            }
        });
    }

    update() {
        this.resize();

    }

    setupCharacterCardEvents = (card: PhysicalCard) => {
        // Character card events can be set up here if needed
    }

    resize() {
        const { width, height } = this.scale;
        this.resizeBackground();
        this.spatialManager.updateDimensions(width, height);
        this.positionCharacterCards(width, height);
        this.positionAbortButton(width, height);
        this.positionCampaignStatusText(width, height);
        this.spatialManager.placePositions(GameState.getInstance().getLocations());
        this.createAdjacencyLines();
    }

    resizeBackground() {
        const { width, height } = this.scale;
        if (this.background) {
            this.background.setDisplaySize(width, height);
        }
    }

    positionCharacterCards(width: number, height: number) {
        const rightEdge = width - 100;
        const cardSpacing = height * 0.25;
        const startY = height * 0.25;

        this.characterCards.forEach((card, index) => {
            card.container.setPosition(rightEdge, startY + index * cardSpacing);
        });
    }

    positionAbortButton(width: number, height: number) {
        if (this.abortButton) {
            this.abortButton.setPosition(width / 2, height - 60);
        }
    }

    positionCampaignStatusText(width: number, height: number) {
        if (this.campaignStatusText) {
            const padding = 20;
            this.campaignStatusText.setPosition(width - padding, padding);
        }
    }

    arrangeLocationCards() {
        const locations = GameState.getInstance().getLocations();
        const { width, height } = this.scale; // Ensure correct dimensions

        locations.forEach(location => {
            const card = this.locationCards.find(c => c.data === location);
            if (card) {
                card.container.setPosition(
                    Phaser.Math.Clamp(location.xPos, 0, width), // Clamp xPos
                    Phaser.Math.Clamp(location.yPos, 0, height) // Clamp yPos
                );
                
            }
        });
    }
}
