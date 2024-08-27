import Phaser from 'phaser';
import { AbstractCard, PhysicalCard, CardType, CardScreenLocation } from '../gamecharacters/PhysicalCard';
import { CardGuiUtils } from '../utils/CardGuiUtils';

export class LocationCard extends AbstractCard {
    constructor({ name, description, portraitName, tooltip }: { name: string; description: string; portraitName?: string; tooltip?: string }) {
        super({
            name,
            description,
            portraitName,
            cardType: CardType.CHARACTER,
            tooltip
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

    constructor() {
        super('MapScene');
    }

    create() {
        this.createLocationCards();
        this.createCharacterCards();

        this.scale.on('resize', this.resize, this);
        this.resize();
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
        // Assuming we have 3 selected characters for this run
        const characters = [
            new AbstractCard({ name: 'Warrior', description: 'A strong fighter', cardType: CardType.CHARACTER }),
            new AbstractCard({ name: 'Mage', description: 'A powerful spellcaster', cardType: CardType.CHARACTER }),
            new AbstractCard({ name: 'Rogue', description: 'A stealthy assassin', cardType: CardType.CHARACTER })
        ];

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
        this.positionLocationCards(width, height);
        this.positionCharacterCards(width, height);
    }

    positionLocationCards(width: number, height: number) {
        const centerY = height / 2;
        const cardSpacing = width * 0.2;
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
