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
    nameBackground: Phaser.GameObjects.Rectangle;
    nameText: Phaser.GameObjects.Text;
    descText: Phaser.GameObjects.Text;
    descBackground: Phaser.GameObjects.Rectangle;
    tooltipBackground: Phaser.GameObjects.Rectangle;
    tooltipText: Phaser.GameObjects.Text;
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
        nameBackground,
        nameText,
        descText,
        tooltipBackground,
        tooltipText,
        descBackground,
        data,
        cardLocation,
        visualTags
    }: {
        scene: Phaser.Scene;
        container: Phaser.GameObjects.Container;
        cardBackground: Phaser.GameObjects.Image;
        cardImage: Phaser.GameObjects.Image;
        nameBackground: Phaser.GameObjects.Rectangle;
        nameText: Phaser.GameObjects.Text;
        descText: Phaser.GameObjects.Text;
        tooltipBackground: Phaser.GameObjects.Rectangle;
        tooltipText: Phaser.GameObjects.Text;
        descBackground: Phaser.GameObjects.Rectangle;
        data: AbstractCard;
        cardLocation: CardScreenLocation;
        visualTags: PhysicalCardVisualTag[];
    }) {
        this.scene = scene;
        this.container = container;
        this.cardBackground = cardBackground;
        this.cardImage = cardImage;
        this.nameBackground = nameBackground;
        this.nameText = nameText;
        this.descText = descText;
        this.descBackground = descBackground;
        this.tooltipBackground = tooltipBackground;
        this.tooltipText = tooltipText;
        this.data = data;
        this.cardLocation = cardLocation;
        this.visualTags = [];

        // Create a new container for card content (excluding tooltip)
        this.cardContent = this.scene.add.container();
        this.cardContent.add([this.cardBackground, this.cardImage, this.nameBackground, this.nameText, this.descBackground, this.descText]);
        this.container.add(this.cardContent);

        // Add tooltip elements directly to the main container
        this.container.add([this.tooltipBackground, this.tooltipText]);

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
        this.descText.setVisible(true);
        this.descBackground.setVisible(true);
        this.tooltipText.setVisible(true);
        this.tooltipBackground.setVisible(true);
        this.container.setDepth(1000);

        // Determine tooltip position based on card's position
        const cardWidth = this.cardBackground.displayWidth * this.data.size;
        const gameWidth = this.scene.scale.width;
        const cardCenterX = this.container.x;

        // Set tooltip text
        this.tooltipText.setText(this.data.tooltip);

        // Calculate tooltip dimensions
        const padding = 10;
        const tooltipWidth = this.tooltipText.width + padding * 2;
        const tooltipHeight = this.tooltipText.height + padding * 2;

        // Update tooltip background
        this.tooltipBackground.setSize(tooltipWidth, tooltipHeight);

        if (cardCenterX > gameWidth / 2) {
            // Card is on the right side, show tooltip on the left
            this.tooltipBackground.setPosition(-cardWidth - tooltipWidth / 2, 0);
            this.tooltipText.setPosition(-cardWidth - tooltipWidth + padding, -tooltipHeight / 2 + padding);
        } else {
            // Card is on the left side, show tooltip on the right
            this.tooltipBackground.setPosition(cardWidth + tooltipWidth / 2, 0);
            this.tooltipText.setPosition(cardWidth + padding, -tooltipHeight / 2 + padding);
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
        this.descText.setVisible(false);
        this.descBackground.setVisible(false);
        this.tooltipText.setVisible(false);
        this.tooltipBackground.setVisible(false);
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

        this.nameText.setText(this.data.name);
        this.descText.setText(this.data.description);
        this.tooltipText.setText(this.data.tooltip);

        // Check if the texture exists before setting it
        if (this.scene.textures.exists(this.data.portraitName)) {
            this.cardImage.setTexture(this.data.portraitName);
        } else {
            console.warn(`Texture '${this.data.portraitName}' not found. Using fallback texture.`);
            //this.cardImage.setTexture('fallback_texture'); // Ensure you have a fallback texture
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