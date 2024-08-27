import Phaser from 'phaser';
import { AbstractCard, PhysicalCard, CardType, CardScreenLocation, CardSize } from '../gamecharacters/PhysicalCard';
import { CardGuiUtils } from '../utils/CardGuiUtils';
import { GameState } from './gamestate';

export class LocationCard extends AbstractCard {
    constructor({ name, description, portraitName, tooltip }: { name: string; description: string; portraitName?: string; tooltip?: string }) {
        super({
            name,
            description,
            portraitName,
            cardType: CardType.CHARACTER,
            tooltip,
            size: CardSize.MEDIUM
        });
    }

    OnLocationSelected(): void {
        console.log(`Location ${this.name} selected`);
        // Implementation to be added later
    }
}

export default class MapScene extends Phaser.Scene {
    private locationCards: PhysicalCard[] = [];
    private characterCards: PhysicalCard[] = [];
    private background: Phaser.GameObjects.Image | null = null;

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

        this.scale.on('resize', this.resize, this);
        this.resize();
    }

    createBackground() {
        this.background = this.add.image(0, 0, 'mapbackground1');
        this.background.setOrigin(0, 0);
        this.resizeBackground();
    }

    createLocationCards() {
        const locations = [
            new LocationCard({ name: 'Forest', description: 'A dense, mysterious forest' }),
            new LocationCard({ name: 'Mountain', description: 'A treacherous mountain range' }),
            new LocationCard({ name: 'Castle', description: 'An ancient, fortified castle' })
        ];

        locations.forEach((location, index) => {
            const card = new CardGuiUtils().createCard({
                scene: this,
                x: 0,
                y: 0,
                data: location,
                location: CardScreenLocation.BATTLEFIELD,
                eventCallback: this.setupLocationCardEvents
            });
            this.locationCards.push(card);
        });
    }

    createCharacterCards() {
        const gameState = GameState.getInstance();
        const characters = gameState.getCurrentRunCharacters();

        characters.forEach((character, index) => {
            const card = new CardGuiUtils().createCard({
                scene: this,
                x: 0,
                y: 0,
                data: character,
                location: CardScreenLocation.BATTLEFIELD,
                eventCallback: this.setupCharacterCardEvents
            });
            this.characterCards.push(card);
        });
    }

    setupLocationCardEvents = (card: PhysicalCard) => {
        card.container.setInteractive();
        card.container.on('pointerdown', () => {
            if (card.data instanceof LocationCard) {
                card.data.OnLocationSelected();
            }
        });
    }

    setupCharacterCardEvents = (card: PhysicalCard) => {
        // Character card events can be set up here if needed
    }

    resize() {
        const { width, height } = this.scale;
        this.resizeBackground();
        this.positionLocationCards(width, height);
        this.positionCharacterCards(width, height);
    }

    resizeBackground() {
        const { width, height } = this.scale;
        if (this.background) {
            this.background.setDisplaySize(width, height);
        }
    }

    positionLocationCards(width: number, height: number) {
        const centerY = height / 2;
        const cardSpacing = width * 0.25; // Increased spacing for larger cards
        const startX = width / 2 - cardSpacing;

        this.locationCards.forEach((card, index) => {
            card.container.setPosition(startX + index * cardSpacing, centerY);
        });
    }

    positionCharacterCards(width: number, height: number) {
        const rightEdge = width - 100;
        const cardSpacing = height * 0.25;
        const startY = height * 0.25;

        this.characterCards.forEach((card, index) => {
            card.container.setPosition(rightEdge, startY + index * cardSpacing);
        });
    }
}
