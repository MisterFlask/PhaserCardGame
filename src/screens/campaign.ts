import Phaser from 'phaser';
import { AbstractCard, CardType, PhysicalCard, CardLocation } from '../gamecharacters/PhysicalCard';
import { BaseCharacterClass, DiabolistClass, BlackhandClass, BaseCharacter } from '../gamecharacters/CharacterClasses';
import { CardGuiUtils } from '../utils/CardGuiUtils';
import GameImageLoader from '../utils/ImageUtils';

export default class CampaignScene extends Phaser.Scene {
    private characterRoster: PhysicalCard[] = [];
    private characterSlots: Phaser.GameObjects.Rectangle[] = [];
    private selectedCharacters: PhysicalCard[] = [];
    private embarkButton!: Phaser.GameObjects.Text;

    constructor() {
        super('campaign');
    }

    preload() {
        new GameImageLoader().loadAllImages(this.load);
    }

    create() {
        this.add.text(400, 50, 'Campaign Management', { fontSize: '32px', color: '#ffffff' }).setOrigin(0.5);

        // Create character roster
        this.add.text(100, 100, 'Character Roster', { fontSize: '24px', color: '#ffffff' });
        this.createCharacterRoster();

        // Create character slots
        this.add.text(600, 100, 'Selected Characters', { fontSize: '24px', color: '#ffffff' });
        this.createCharacterSlots();

        // Create Embark button
        this.embarkButton = this.add.text(400, 550, 'Embark!', { fontSize: '24px', color: '#ffffff', backgroundColor: '#4a4a4a', padding: { x: 10, y: 5 } })
            .setOrigin(0.5)
            .setInteractive()
            .on('pointerdown', this.onEmbarkClicked, this);

        // Set up drag and drop
        this.input.on('drag', this.onDrag, this);
        this.input.on('dragstart', this.onDragStart, this);
        this.input.on('dragend', this.onDragEnd, this);
    }

    createCharacterRoster() {
        const classes: BaseCharacterClass[] = [new DiabolistClass(), new BlackhandClass()];
        for (let i = 0; i < 5; i++) {
            const randomClass = classes[Math.floor(Math.random() * classes.length)];
            const character = new BaseCharacter({ name: `Character ${i + 1}`, portraitName: `flamer1`, characterClass: randomClass });
            const randomCard = character.characterClass.availableCards[Math.floor(Math.random() * character.characterClass.availableCards.length)];
            const card = new CardGuiUtils().createCard(this, 100, 150 + i * 80, randomCard, CardLocation.BATTLEFIELD, this.setupCardEvents);
            this.characterRoster.push(card);
        }
    }

    public setupCardEvents(card: PhysicalCard): void {
        card.container.on('pointerover', () => {
            card.descText.setVisible(true);
            card.descBackground.setVisible(true);
            card.tooltipText.setVisible(true);
            card.tooltipBackground.setVisible(true);
            card.container.setDepth(1000);
        });
        card.container.on('pointerout', () => {
            card.descText.setVisible(false);
            card.descBackground.setVisible(false);
            card.tooltipText.setVisible(false);
            card.tooltipBackground.setVisible(false);
            card.container.setDepth((card.container as any).originalDepth);
        });
    }

    createCharacterSlots() {
        for (let i = 0; i < 3; i++) {
            const slot = this.add.rectangle(600, 150 + i * 100, 220, 80, 0x666666).setOrigin(0);
            this.characterSlots.push(slot);
        }
    }

    onDrag(pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.Container, dragX: number, dragY: number) {
        gameObject.x = dragX;
        gameObject.y = dragY;
    }

    onDragStart(pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.Container) {
        this.children.bringToTop(gameObject);
    }

    onDragEnd(pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.Container) {
        const droppedSlot = this.characterSlots.find(slot => Phaser.Geom.Intersects.RectangleToRectangle(gameObject.getBounds(), slot.getBounds()));
        
        if (droppedSlot && this.selectedCharacters.length < 3) {
            const cardIndex = this.characterRoster.findIndex(card => card.container === gameObject);
            if (cardIndex !== -1) {
                const [selectedCard] = this.characterRoster.splice(cardIndex, 1);
                this.selectedCharacters.push(selectedCard);
                gameObject.setPosition(droppedSlot.x + 10, droppedSlot.y + 10);
                this.updateCharacterRoster();
            }
        } else {
            const originalCard = this.characterRoster.find(card => card.container === gameObject) || this.selectedCharacters.find(card => card.container === gameObject);
            if (originalCard) {
                gameObject.setPosition(originalCard.container.x, originalCard.container.y);
            }
        }
    }

    updateCharacterRoster() {
        this.characterRoster.forEach((card, index) => {
            card.container.setPosition(100, 150 + index * 80);
        });
    }

    onEmbarkClicked() {
        if (this.selectedCharacters.length === 3) {
            console.log('Embarking on adventure with:', this.selectedCharacters.map(card => card.data.name));
            // Here you would transition to the next scene or start the game
        } else {
            console.log('Please select 3 characters before embarking');
        }
    }
}
