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
        this.positionAbortButton(width, height);
        this.positionCampaignStatusText(width, height);
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
