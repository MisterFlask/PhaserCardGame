import { BaseCharacter } from "./CharacterClasses";

export enum CardScreenLocation {
    BATTLEFIELD,
    HAND,
    CHARACTER_ROSTER,
    SHOP,
    DRAW_PILE,
    DISCARD_PILE
}

export enum CardType {
    CHARACTER = "CHARACTER",
    PLAYABLE = "PLAYABLE",
    STORE = "STORE",
    LOCATION = "LOCATION"
}

export enum CardSize {
    SMALL = 1,
    MEDIUM = 1.5,
    LARGE = 2
}

export class TextBox {
    background: Phaser.GameObjects.Rectangle;
    text: Phaser.GameObjects.Text;
    outline: Phaser.GameObjects.Rectangle;

    constructor(scene: Phaser.Scene, x: number = 0, y: number = 0, width: number = 100, height: number = 50, text: string = '', style: Phaser.Types.GameObjects.Text.TextStyle = { fontSize: '16px', color: '#000' }) {
        this.background = scene.add.rectangle(x, y, width, height, 0xffffff);
        this.outline = scene.add.rectangle(x, y, width, height).setStrokeStyle(2, 0x000000);
        this.text = scene.add.text(x, y, text, style);
        this.text.setOrigin(0.5);
    }

    setPosition(x: number, y: number): void {
        this.background.setPosition(x, y);
        this.outline.setPosition(x, y);
        this.text.setPosition(x, y);
    }

    setSize(width: number, height: number): void {
        this.background.setSize(width, height);
        this.outline.setSize(width, height);
    }

    setText(text: string): void {
        this.text.setText(text);
    }

    setVisible(visible: boolean): void {
        this.background.setVisible(visible);
        this.outline.setVisible(visible);
        this.text.setVisible(visible);
    }

    destroy(): void {
        this.background.destroy();
        this.outline.destroy();
        this.text.destroy();
    }
}

export class AbstractCard {
    name: string
    description: string
    portraitName: string
    cardType: CardType
    tooltip: string
    characterData: BaseCharacter | null
    size: CardSize

    constructor({ name, description, portraitName, cardType, tooltip, characterData, size }: { name: string; description: string; portraitName?: string, cardType?: CardType, tooltip?: string, characterData?: BaseCharacter, size?: CardSize }) {
        this.name = name
        this.description = description
        this.portraitName = portraitName || "flamer1"
        this.cardType = cardType || CardType.PLAYABLE
        this.tooltip = tooltip || "Lorem ipsum dolor sit amet"
        this.characterData = characterData || null
        this.size = size || CardSize.SMALL
    }

    IsPerformableOn(targetCard: PhysicalCard) {
        if (this.cardType == CardType.PLAYABLE) {
            return false
        }
        return true
    }

    Action(targetCard: PhysicalCard) {
        console.log("Action performed on " + targetCard.data.name + " by  " + this.name)
    }
}

export class PhysicalCard {
    container: Phaser.GameObjects.Container;
    cardBackground: Phaser.GameObjects.Image;
    cardImage: Phaser.GameObjects.Image;
    nameBox: TextBox;
    descBox: TextBox;
    tooltipBox: TextBox;
    hpBox: TextBox | null;
    data: AbstractCard;
    cardLocation: CardScreenLocation;
    visualTags: PhysicalCardVisualTag[];
    scene: Phaser.Scene;
    isSelected: boolean = false;
    private wiggleTween: Phaser.Tweens.Tween | null = null;
    private hoverSound: Phaser.Sound.BaseSound | null = null;
    private cardContent: Phaser.GameObjects.Container;

    constructor({
        scene,
        container,
        cardBackground,
        cardImage,
        nameBox,
        descBox,
        tooltipBox,
        data,
        cardLocation,
        visualTags
    }: {
        scene: Phaser.Scene;
        container: Phaser.GameObjects.Container;
        cardBackground: Phaser.GameObjects.Image;
        cardImage: Phaser.GameObjects.Image;
        nameBox: TextBox;
        descBox: TextBox;
        tooltipBox: TextBox;
        data: AbstractCard;
        cardLocation: CardScreenLocation;
        visualTags: PhysicalCardVisualTag[];
    }) {
        this.scene = scene;
        this.container = container;
        this.cardBackground = cardBackground;
        this.cardImage = cardImage;
        this.nameBox = nameBox;
        this.descBox = descBox;
        this.tooltipBox = tooltipBox;
        this.data = data;
        this.cardLocation = cardLocation;
        this.visualTags = [];

        // Create a new container for card content (excluding tooltip)
        this.cardContent = this.scene.add.container();
        this.cardContent.add([this.cardBackground, this.cardImage, this.nameBox.background, this.nameBox.outline, this.nameBox.text, this.descBox.background, this.descBox.outline, this.descBox.text]);
        this.container.add(this.cardContent);

        // Add tooltip elements directly to the main container
        this.container.add([this.tooltipBox.background, this.tooltipBox.outline, this.tooltipBox.text]);

        // Add HP box if the card is a BaseCharacter
        if (this.data instanceof BaseCharacter) {
            const cardWidth = this.cardBackground.displayWidth;
            const cardHeight = this.cardBackground.displayHeight;
            this.hpBox = new TextBox(
                this.scene,
                cardWidth / 2 - 20,
                -cardHeight / 2 + 20,
                40,
                20,
                `${this.data.hitpoints}/${this.data.maxHitpoints}`,
                { fontSize: '12px', color: '#000' }
            );
            this.cardContent.add([this.hpBox.background, this.hpBox.outline, this.hpBox.text]);
        } else {
            this.hpBox = null;
        }

        // Load the rollover sound if it's not already loaded
        if (!this.scene.cache.audio.exists('rollover6')) {
            const baseUrl = 'https://raw.githubusercontent.com/MisterFlask/PhaserCardGame/master/resources/';
            this.scene.load.audio('rollover6', baseUrl + 'Sounds/Effects/rollover6.ogg');
            this.scene.load.once('complete', () => {
                if (this.scene.cache.audio.exists('rollover6')) {
                    this.hoverSound = this.scene.sound.add('rollover6');
                } else {
                    console.error('Failed to load rollover6 sound from the server');
                }
            });
            this.scene.load.start();
        } else {
            this.hoverSound = this.scene.sound.add('rollover6');
        }

        this.updateVisuals();
        this.scene.events.on('update', this.updateVisuals, this);
        this.setupInteractivity();
        this.applyCardSize();
    }

    applyCardSize(): void {
        const scale = this.data.size;
        this.cardContent.setScale(scale);
    }

    setupInteractivity(): void {
        this.container.setInteractive()
            .on('pointerover', this.onPointerOver, this)
            .on('pointerout', this.onPointerOut, this);
    }

    onPointerOver(): void {
        this.cardContent.setScale(this.data.size * 1.1);
        this.descBox.setVisible(true);
        this.tooltipBox.setVisible(true);
        this.container.setDepth(1000);

        // Determine tooltip position based on card's position
        const cardWidth = this.cardBackground.displayWidth * this.data.size;
        const gameWidth = this.scene.scale.width;
        const cardCenterX = this.container.x;

        // Set tooltip text
        this.tooltipBox.setText(this.data.tooltip);

        // Calculate tooltip dimensions
        const padding = 10;
        const tooltipWidth = this.tooltipBox.text.width + padding * 2;
        const tooltipHeight = this.tooltipBox.text.height + padding * 2;

        // Update tooltip background
        this.tooltipBox.setSize(tooltipWidth, tooltipHeight);

        if (cardCenterX > gameWidth / 2) {
            // Card is on the right side, show tooltip on the left
            this.tooltipBox.setPosition(-cardWidth - tooltipWidth / 2, 0);
        } else {
            // Card is on the left side, show tooltip on the right
            this.tooltipBox.setPosition(cardWidth + tooltipWidth / 2, 0);
        }

        // Play hover sound
        if (this.hoverSound) {
            // this.hoverSound.play(); //tbd i now find this annoying
        }
        // Add wiggle animation
        if (!this.wiggleTween) {
            this.wiggleTween = this.scene.tweens.add({
                targets: this.cardContent,
                angle: { from: -1, to: 1 },
                duration: 80,
                repeat: 1,
                yoyo: true,
                onComplete: () => {
                    this.cardContent.setAngle(0);
                    this.wiggleTween = null;
                }
            });
        }
    }

    onPointerOut(): void {
        this.cardContent.setScale(this.data.size);
        this.descBox.setVisible(false);
        this.tooltipBox.setVisible(false);
        this.container.setDepth(0);

        // Stop wiggle animation if it's still running
        if (this.wiggleTween) {
            this.wiggleTween.stop();
            this.wiggleTween = null;
            this.cardContent.setAngle(0);
        }
    }

    updateVisuals(): void {
        if (!this.scene || !this.scene.sys) {
            console.warn('Scene is undefined in updateVisuals');
            return;
        }
        if (!this.cardImage.scene || !this.cardImage.scene.sys) {
            console.warn('Scene is undefined in updateVisuals (BUT FOR THE CARDIMAGE SPECIFICALLY): ' + this.data.name);
            this.cardImage.scene = this.scene;
            return;
        }

        this.nameBox.setText(this.data.name);
        this.descBox.setText(this.data.description);
        this.tooltipBox.setText(this.data.tooltip);

        // Check if the texture exists before setting it
        if (this.scene.textures.exists(this.data.portraitName)) {
            this.cardImage.setTexture(this.data.portraitName);
        } else {
            console.warn(`Texture '${this.data.portraitName}' not found. Using fallback texture.`);
            //this.cardImage.setTexture('fallback_texture'); // Ensure you have a fallback texture
        }

        // Update HP box if it exists
        if (this.hpBox && this.data instanceof BaseCharacter) {
            this.hpBox.setText(`${this.data.hitpoints}/${this.data.maxHitpoints}`);
        }

        this.updateVisualTags();
    }

    addVisualTag(tag: PhysicalCardVisualTag): void {
        this.visualTags.push(tag);
        this.cardContent.add([tag.image, tag.text]);
        tag.tag.updateVisuals(tag.image, tag.text);
    }

    removeVisualTag(tag: PhysicalCardVisualTag): void {
        const index = this.visualTags.indexOf(tag);
        if (index > -1) {
            this.visualTags.splice(index, 1);
            this.cardContent.remove(tag.image);
            this.cardContent.remove(tag.text);
            tag.image.destroy();
            tag.text.destroy();
        }
    }

    updateVisualTags(): void {
        this.visualTags.forEach(tag => {
            tag.tag.updateVisuals(tag.image, tag.text);
        });
    }

    destroy(): void {
        this.scene.events.off('update', this.updateVisuals, this);
        if (this.wiggleTween) {
            this.wiggleTween.stop();
            this.wiggleTween = null;
        }
        this.container.destroy();
    }
}

export interface PhysicalCardVisualTag {
    image: Phaser.GameObjects.Image;
    text: Phaser.GameObjects.Text;
    tag: AbstractCardVisualTag;
}

export abstract class AbstractCardVisualTag {
    abstract getText(): string;
    abstract updateVisuals(image: Phaser.GameObjects.Image, text: Phaser.GameObjects.Text): void;
}