import { AbstractCard } from "./AbstractCard";
import { BaseCharacter } from "./BaseCharacter"
import RexUIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin.js';

export class PhysicalCard {
    container: Phaser.GameObjects.Container;
    cardBackground: Phaser.GameObjects.Image;
    cardImage: Phaser.GameObjects.Image;
    nameLabel: RexUIPlugin.Label;
    descLabel: RexUIPlugin.Label;
    tooltipLabel: RexUIPlugin.Label;
    hpLabel: RexUIPlugin.Label | null;
    data: AbstractCard;
    visualTags: PhysicalCardVisualTag[];
    scene: Phaser.Scene;
    isSelected: boolean = false;
    private wiggleTween: Phaser.Tweens.Tween | null = null;
    private hoverSound: Phaser.Sound.BaseSound | null = null;
    private cardContent: Phaser.GameObjects.Container;
    private obliterated: boolean = false;

    constructor({
        scene,
        container,
        cardBackground,
        cardImage,
        nameLabel,
        descLabel,
        tooltipLabel,
        data,
        visualTags
    }: {
        scene: Phaser.Scene;
        container: Phaser.GameObjects.Container;
        cardBackground: Phaser.GameObjects.Image;
        cardImage: Phaser.GameObjects.Image;
        nameLabel: RexUIPlugin.Label;
        descLabel: RexUIPlugin.Label;
        tooltipLabel: RexUIPlugin.Label;
        data: AbstractCard;
        visualTags: PhysicalCardVisualTag[];
    }) {
        this.scene = scene;
        this.container = container;
        this.cardBackground = cardBackground;
        this.cardImage = cardImage;
        this.nameLabel = nameLabel;
        this.descLabel = descLabel;
        this.tooltipLabel = tooltipLabel;
        this.data = data;
        this.data.physicalCard = this;
        this.visualTags = [];

        // Create a new container for card content (excluding tooltip)
        this.cardContent = this.scene.add.container();
        this.cardContent.add([this.cardBackground, this.cardImage, this.nameLabel, this.descLabel]);
        this.container.add(this.cardContent);

        // Add tooltip elements directly to the main container
        this.container.add([this.tooltipLabel]);

        // Add HP label if the card is a BaseCharacter
        if (this.data instanceof BaseCharacter) {
            const baseCharacter = this.data as BaseCharacter;
            const cardWidth = this.cardBackground.displayWidth;
            const cardHeight = this.cardBackground.displayHeight;
            this.hpLabel = this.scene.rexUI.add.label({
                x: cardWidth / 2 - 20,
                y: -cardHeight / 2 + 20,
                width: 40,
                text: scene.add.text(0, 0, `${baseCharacter.hitpoints}/${baseCharacter.maxHitpoints}`, { fontSize: '12px', color: '#000' }),
                space: { left: 2, right: 2, top: 2, bottom: 2 },
                align: 'center'
            });
            if (this.hpLabel!=null){
                this.cardContent.add(this.hpLabel);
            }
        } else {
            this.hpLabel = null;
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

    obliterate(): void {
        // Remove event listener
        this.scene.events.off('update', this.updateVisuals, this);

        // Stop and remove the wiggle tween if it exists
        if (this.wiggleTween) {
            this.wiggleTween.stop();
            this.wiggleTween.remove();
            this.wiggleTween = null;
        }

        // Destroy the hover sound if it exists
        if (this.hoverSound) {
            this.hoverSound.destroy();
        }

        // Destroy all TextBox components
        this.nameLabel.destroy();
        this.descLabel.destroy();
        this.tooltipLabel.destroy();
        if (this.hpLabel) {
            this.hpLabel.destroy();
        }

        // Destroy the card image
        if (this.cardImage) {
            this.cardImage.destroy();
        }

        // Destroy the card background
        if (this.cardBackground) {
            this.cardBackground.destroy();
        }

        // Destroy containers
        if (this.cardContent) {
            this.cardContent.destroy();
        }
        if (this.container) {
            this.container.destroy();
        }
        this.obliterated = true;
    }

    applyCardSize(): void {
        const scale = this.data.size;
        this.cardContent.setScale(scale);
    }

    setupInteractivity(): void {
        this.container.setInteractive()
            .on('pointerover', this.onPointerOver_PhysicalCard, this)
            .on('pointerout', this.onPointerOut_PhysicalCard, this);
    }

    onPointerOver_PhysicalCard = (): void => {
        if (this.obliterated) {
            return;
        }
        console.log(`Pointer over card: ${this.data.name}`);
        this.cardContent.setScale(this.data.size * 1.1);
        this.descLabel.setVisible(true);
        this.tooltipLabel.setVisible(true);
        this.container.setDepth(1000);

        // Determine tooltip position based on card's position
        const cardWidth = this.cardBackground.displayWidth * this.data.size;
        const gameWidth = this.scene.scale.width;
        const cardCenterX = this.container.x;

        // Set tooltip text
        this.tooltipLabel.text = this.data.tooltip;

        // Calculate tooltip dimensions
        const padding = 10;
        const tooltipWidth = this.tooltipLabel.width + padding * 2;
        const tooltipHeight = this.tooltipLabel.height + padding * 2;

        // Update tooltip background
        this.tooltipLabel.setSize(tooltipWidth, tooltipHeight);

        if (cardCenterX > gameWidth / 2) {
            // Card is on the right side, show tooltip on the left
            this.tooltipLabel.setPosition(-cardWidth - tooltipWidth / 2, 0);
        } else {
            // Card is on the left side, show tooltip on the right
            this.tooltipLabel.setPosition(cardWidth + tooltipWidth / 2, 0);
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

    onPointerOut_PhysicalCard = (): void => {
        if (this.obliterated) {
            return;
        }
        console.log(`Pointer out card: ${this.data.name}`);
        this.cardContent.setScale(this.data.size);
        this.descLabel.setVisible(false);
        this.tooltipLabel.setVisible(false);
        this.container.setDepth(0);

        // Stop wiggle animation if it's still running
        if (this.wiggleTween) {
            this.wiggleTween.stop();
            this.wiggleTween = null;
            this.cardContent.setAngle(0);
        }
    }

    updateVisuals(): void {
        if (this.obliterated) {
            return;
        }
        if (!this.scene || !this.scene.sys) {
            console.warn('Scene is undefined in updateVisuals');
            return;
        }
        if (!this.cardImage.scene || !this.cardImage.scene.sys) {
            console.warn('Scene is undefined in updateVisuals (BUT FOR THE CARDIMAGE SPECIFICALLY): ' + this.data.name);
            this.cardImage.scene = this.scene;
            return;
        }

        this.nameLabel.text = this.data.name;
        this.descLabel.text = this.data.description;
        this.tooltipLabel.text = this.data.tooltip;

        // Check if the texture exists before setting it
        if (this.scene.textures.exists(this.data.portraitName)) {
            // Maintain aspect ratio
            const texture = this.scene.textures.get(this.data.portraitName);
            texture.setFilter(Phaser.Textures.LINEAR);
            this.cardImage.setTexture(this.data.portraitName);
            this.cardImage.texture.setFilter(Phaser.Textures.LINEAR);
            const frame = texture.get();
            const aspectRatio = frame.width / frame.height;
            
            // Assuming the card background defines the available space
            const availableWidth = this.cardBackground.displayWidth * 0.9; // 90% of card width
            const availableHeight = this.cardBackground.displayHeight * 0.6; // 60% of card height
            
            let newWidth = availableWidth;
            let newHeight = availableWidth / aspectRatio;
            
            if (newHeight > availableHeight) {
                newHeight = availableHeight;
                newWidth = availableHeight * aspectRatio;
            }
            
            this.cardImage.setDisplaySize(newWidth, newHeight);
            
            // Center the image on the card
            this.cardImage.setPosition(0, -this.cardBackground.displayHeight * 0.25); // Move image to top quarter of card
        } else {
            console.warn(`Texture '${this.data.portraitName}' not found. Using fallback texture.`);
            // this.cardImage.setTexture('fallback_texture'); // Ensure you have a fallback texture
        }

        // Update HP label if it exists
        if (this.hpLabel && this.data instanceof BaseCharacter) {
            const baseCharacter = this.data as BaseCharacter;
            this.hpLabel.text = `${baseCharacter.hitpoints}/${baseCharacter.maxHitpoints}`;
        }

        this.tooltipLabel.text = this.data.id;

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

export { AbstractCard };
