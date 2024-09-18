import Phaser from 'phaser';
import { EncounterData, EncounterManager } from '../encounters/Encounters';
import { AbstractCard } from '../gamecharacters/AbstractCard';
import { CardSize, CardType } from '../gamecharacters/Primitives';
import { GameState } from '../rules/GameState';
import { PhysicalCard, } from '../ui/PhysicalCard';
import { CardGuiUtils } from '../utils/CardGuiUtils';

export class LocationCard extends AbstractCard {
    encounter: EncounterData;
    public adjacentLocations: LocationCard[] = []; // New property for adjacency

    constructor({ name, description, portraitName, tooltip }: { name: string; description: string; portraitName?: string; tooltip?: string }) {
        const encounter = EncounterManager.getInstance().getRandomEncounter();
        const encounterDescription = `Encounter: ${encounter.enemies.map(e => e.name).join(', ')}`;
        const fullDescription = `${description}\n\n${encounterDescription}`;

        super({
            name,
            description: fullDescription,
            portraitName,
            cardType: CardType.CHARACTER,
            tooltip,
            size: CardSize.SMALL
        });

        this.encounter = encounter;
    }

    setAdjacent(location: LocationCard) {
        this.adjacentLocations.push(location);
    }

    OnLocationSelected(scene: Phaser.Scene): void {
        console.log(`Location ${this.id} selected with encounter: ${this.encounter.enemies.map(e => e.name).join(', ')}`);
        
        GameState.getInstance().eliminatePhysicalCardsBetweenScenes();
        scene.scene.start('CombatScene', { encounter: this.encounter });
    }
}

export default class MapScene extends Phaser.Scene {
    private locationCards: PhysicalCard[] = [];
    private characterCards: PhysicalCard[] = [];
    private background: Phaser.GameObjects.Image | null = null;
    private abortButton: Phaser.GameObjects.Container | null = null;
    private campaignStatusText: Phaser.GameObjects.Text | null = null;

    constructor() {
        super('MapScene');
    }

    preload() {
        this.load.image('mapbackground1', 'https://raw.githubusercontent.com/MisterFlask/PhaserCardGame/master/resources/Sprites/Backgrounds/mapbackground1.png');
    }

    create() {
        this.createBackground();
        this.createLocationCards();
        this.createCharacterCards();
        this.createAbortButton();
        this.createCampaignStatusText();

        this.scale.on('resize', this.resize, this);
        this.resize();
    }

    createBackground() {
        this.background = this.add.image(this.scale.width / 2, this.scale.height / 2, 'mapbackground1'); // Center the background
        this.background.setOrigin(0.5, 0.5);
        this.resizeBackground();
    }

    createLocationCards() {
        const { width, height } = this.scale;

        const locationData = [
            { 
                card: new LocationCard({ name: 'Entrance', description: 'The entrance to the dungeon' }),
                position: { x: 0, y: -200 }
            },
            { 
                card: new LocationCard({ name: 'North Wing', description: 'The northern section of the dungeon' }),
                position: { x: -150, y: -100 }
            },
            { 
                card: new LocationCard({ name: 'East Wing', description: 'The eastern section of the dungeon' }),
                position: { x: 150, y: -100 }
            },
            { 
                card: new LocationCard({ name: 'West Wing', description: 'The western section of the dungeon' }),
                position: { x: -150, y: 100 }
            },
            { 
                card: new LocationCard({ name: 'South Wing', description: 'The southern section of the dungeon' }),
                position: { x: 150, y: 100 }
            },
            { 
                card: new LocationCard({ name: 'Boss Room', description: 'The final challenge awaits' }),
                position: { x: 0, y: 200 }
            }
        ];

        // Define adjacency
        locationData[0].card.setAdjacent(locationData[1].card); // Entrance -> North Wing
        locationData[0].card.setAdjacent(locationData[2].card); // Entrance -> East Wing
        locationData[0].card.setAdjacent(locationData[3].card); // Entrance -> West Wing
        locationData[0].card.setAdjacent(locationData[4].card); // Entrance -> South Wing
        locationData[4].card.setAdjacent(locationData[5].card); // South Wing -> Boss Room

        GameState.getInstance().setLocations(locationData.map(ld => ld.card));
        GameState.getInstance().setCurrentLocation(locationData[0].card); // Set Entrance as starting location

        locationData.forEach((ld) => {
            const card = CardGuiUtils.getInstance().createCard({
                scene: this,
                x: ld.position.x + width / 2, // Adjusted X position
                y: ld.position.y + height / 2, // Adjusted Y position
                data: ld.card,
                eventCallback: this.setupLocationCardEvents
            });
            this.locationCards.push(card);
        });

        // Add player location icon
        const currentLocation = GameState.getInstance().getCurrentLocation();
        const currentLocationCard = this.locationCards.find(card => card.data === currentLocation);
        if (currentLocationCard) {
            // Get the dimensions of the card portrait
            const portraitWidth = currentLocationCard.cardImage.displayWidth;
            const portraitHeight = currentLocationCard.cardImage.displayHeight;

            // Create a new image with the same dimensions as the card portrait
            const currentLocationIcon = this.add.image(0, -currentLocationCard.cardBackground.displayHeight / 4, 'cursed-star');
            currentLocationIcon.setDisplaySize(portraitWidth, portraitHeight);
            currentLocationIcon.setDepth(1);
            currentLocationCard.container.add(currentLocationIcon);

            // Optionally, add a glow effect to make it stand out
            const glowFX = currentLocationIcon.preFX?.addGlow(0xffff00, 4, 0, false, 0.1, 16);
        }
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
        const buttonWidth = 300;
        const buttonHeight = 80;
        const buttonX = this.scale.width / 2;
        const buttonY = this.scale.height - 60;

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
        const padding = 20;
        const x = this.scale.width - padding;
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
                } else {
                    console.log('Cannot move to non-adjacent location.');
                }
            }
        });
    }

    setupCharacterCardEvents = (card: PhysicalCard) => {
        // Character card events can be set up here if needed
    }

    resize() {
        const { width, height } = this.scale;
        this.resizeBackground();
        this.positionCharacterCards(width, height);
        this.positionAbortButton(width, height);
        this.positionCampaignStatusText(width, height);
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
}
