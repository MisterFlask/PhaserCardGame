import { AbstractCard } from "./AbstractCard";
import { BaseCharacter } from "./BaseCharacter"
import { AbstractIntent } from "./AbstractIntent";
import { PhysicalIntent } from "./PhysicalIntent";
import { safeStringify } from '../utils/JsonUtils';

export class TextBox {
    background: Phaser.GameObjects.Rectangle | Phaser.GameObjects.Image | null;
    text: Phaser.GameObjects.Text;
    outline: Phaser.GameObjects.Rectangle;
    textBoxName?: string
    constructor(params: {
        scene: Phaser.Scene,
        x?: number,
        y?: number,
        width?: number,
        height?: number,
        text?: string,
        style?: Phaser.Types.GameObjects.Text.TextStyle,
        backgroundImage?: string,
        textBoxName?: string
    }) {
        const {
            scene,
            x = 0,
            y = 0,
            width = 100,
            height = 50,
            text = '',
            style = { fontSize: '16px', color: '#000' },
            backgroundImage,
            textBoxName
        } = params;
        this.textBoxName = textBoxName ?? "anonymousTextBox";

        if (backgroundImage) {
            this.background = scene.add.image(x, y, backgroundImage).setDisplaySize(width, height);
        } else {
            this.background = scene.add.rectangle(x, y, width, height, 0xffffff);
        }
        this.outline = scene.add.rectangle(x, y, width, height).setStrokeStyle(2, 0x000000);
        this.text = scene.add.text(x, y, text, style);
        this.text.setOrigin(0.5);
        // Enforce text wrapping within bounds
        this.text.setWordWrapWidth(width - 2); // Subtract padding
        this.text.setAlign('center');

        // Adjust text size if it overflows
        const originalFontSize = parseInt(style.fontSize as string);
        let currentFontSize = originalFontSize;
        while ((this.text.height > height - 1 || this.text.width > width - 1) && currentFontSize > 8) { // Minimum font size of 8
            currentFontSize--;
            this.text.setFontSize(currentFontSize);
            this.text.setWordWrapWidth(width - 10);
        }
    }

    setPosition(x: number, y: number): void {
        if (this.background === null) {
            return;
        }
        this.background.setPosition(x, y);
        this.outline.setPosition(x, y);
        this.text.setPosition(x, y);
    }

    setSize(width: number, height: number): void {
        if (this.background === null) {
            return;
        }
        if (this.background instanceof Phaser.GameObjects.Rectangle) {
            this.background.setSize(width, height);
        } else {
            this.background.setDisplaySize(width, height);
        }
        this.outline.setSize(width, height);
    }

    setText(text: string): void {
        if (this.text.scene === null) {
            return;
        }
        if (this.background == null){
            return;
        }
        if ((this.text.frame as any)?.data) {
            // we do this because there are circumstances where data is not available
            // and it crashes the whole game.  Caused by if the container gets
            // destroyed without the listeners getting destroyed.
            this.text.setText(text);
        }else{
            console.log("text frame data is null for " + this.textBoxName);
        }
    }

    setVisible(visible: boolean): void {
        if (this.background === null) {
            return;
        }
        this.background.setVisible(visible);
        this.outline.setVisible(visible);
        this.text.setVisible(visible);
    }
    destroy(): void {
        if (this.background) {
            this.background.destroy();
        }
        this.background = null;
    }
}
import Phaser from 'phaser';
import { AutomatedCharacter } from "./AutomatedCharacter";

export class PhysicalCard {
    container: Phaser.GameObjects.Container;
    cardBackground: Phaser.GameObjects.Image;
    cardImage: Phaser.GameObjects.Image;
    nameBox: TextBox;
    descBox: TextBox;
    tooltipBox: TextBox;
    hpBox: TextBox | null;
    data: AbstractCard;
    visualTags: PhysicalCardVisualTag[];
    scene: Phaser.Scene;
    isSelected: boolean = false;
    private wiggleTween: Phaser.Tweens.Tween | null = null;
    private hoverSound: Phaser.Sound.BaseSound | null = null;
    private cardContent: Phaser.GameObjects.Container;
    private obliterated: boolean = false;
    private physicalIntents: Map<string, PhysicalIntent> = new Map();
    private intentsContainer: Phaser.GameObjects.Container;
    private jsonModal: Phaser.GameObjects.Container | null = null;
    private _isHighlighted: boolean = false;

    constructor({
        scene,
        container,
        cardBackground,
        cardImage,
        nameBox,
        descBox,
        tooltipBox,
        data,
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
        this.data.physicalCard = this;
        this.visualTags = [];

        // Create a new container for card content (excluding tooltip)
        this.cardContent = this.scene.add.container();
        this.cardContent.add([this.cardBackground, this.cardImage, this.nameBox.background!!, this.nameBox.outline, this.nameBox.text, this.descBox.background!!, this.descBox.outline, this.descBox.text]);
        this.container.add(this.cardContent);

        // Add tooltip elements directly to the main container
        this.container.add([this.tooltipBox.background!!, this.tooltipBox.outline, this.tooltipBox.text]);

        // Add HP box if the card is a BaseCharacter
        if (this.data instanceof BaseCharacter) {
            const baseCharacter = this.data as BaseCharacter;
            const cardWidth = this.cardBackground.displayWidth;
            const cardHeight = this.cardBackground.displayHeight;
            this.hpBox = new TextBox({
                scene: this.scene,
                x: cardWidth / 2 - 20,
                y: -cardHeight / 2 + 20,
                width: 40,
                height: 20,
                text: `${baseCharacter.hitpoints}/${baseCharacter.maxHitpoints}`,
                style: { fontSize: '12px', color: '#000' }
            });
            this.cardContent.add([this.hpBox.background!!, this.hpBox.outline, this.hpBox.text]);
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

        // Create a new container for intents
        this.intentsContainer = this.scene.add.container(0, -this.cardBackground.displayHeight / 2 - 30);
        this.cardContent.add(this.intentsContainer);

        this.updateVisuals();
        this.scene.events.on('update', this.updateVisuals, this);
        this.setupInteractivity();
        this.applyCardSize();
        this.updateIntents();
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
        this.nameBox.destroy();
        this.descBox.destroy();
        this.tooltipBox.destroy();
        if (this.hpBox) {
            this.hpBox.destroy();
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
            .on('pointerout', this.onPointerOut_PhysicalCard, this)
            .on('pointerdown', this.onPointerDown_PhysicalCard, this);
    }

    onPointerOver_PhysicalCard = (): void => {
        if (this.obliterated) {
            return;
        }
        console.log(`Pointer over card: ${this.data.name}`);
        this.cardContent.setScale(this.data.size * 1.1);
        this.descBox.setVisible(true);
        this.tooltipBox.setVisible(true);
        this.container.setDepth(1000);

        // Determine tooltip position based on card's position
        const cardWidth = this.cardBackground.displayWidth * this.data.size;
        const gameWidth = this.scene.scale.width;
        const cardCenterX = this.container.x;

        // Set tooltip text
        this.tooltipBox.setText(this.data.id);

        // Calculate tooltip dimensions
        const padding = 20;
        const requiredTooltipWidth = this.tooltipBox.text.width + padding * 2;
        const requiredTooltipHeight = this.tooltipBox.text.height + padding * 2;

        // Update tooltip background
        this.tooltipBox.setSize(requiredTooltipWidth, requiredTooltipHeight);

        if (cardCenterX > gameWidth / 2) {
            // Card is on the right side, show tooltip on the left
            this.tooltipBox.setPosition(-cardWidth - requiredTooltipWidth / 2, 0);
        } else {
            // Card is on the left side, show tooltip on the right
            this.tooltipBox.setPosition(cardWidth + requiredTooltipWidth / 2, 0);
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

    onPointerDown_PhysicalCard = (): void => {
        if (this.obliterated) {
            return;
        }
        console.log(`Clicked on card: ${this.data.name}`);
        const jsonData = this.data.createJsonRepresentation();
        this.showJsonModal(jsonData);
    }

    showJsonModal(jsonData: string): void {
        if (this.jsonModal) {
            this.jsonModal.destroy();
        }

        const modalWidth = this.scene.scale.width * 0.8;
        const modalHeight = this.scene.scale.height * 0.8;

        const background = this.scene.add.rectangle(0, 0, modalWidth, modalHeight, 0x000000, 0.8);
        const text = this.scene.add.text(0, 0, jsonData, {
            fontSize: '16px',
            color: '#ffffff',
            wordWrap: { width: modalWidth - 40 }
        });

        this.jsonModal = this.scene.add.container(
            this.scene.scale.width / 2,
            this.scene.scale.height / 2,
            [background, text]
        );

        text.setPosition(-modalWidth / 2 + 20, -modalHeight / 2 + 20);

        const closeButton = this.scene.add.text(modalWidth / 2 - 40, -modalHeight / 2 + 10, 'Close', {
            fontSize: '20px',
            color: '#ffffff'
        }).setInteractive();

        closeButton.on('pointerdown', () => {
            if (this.jsonModal) {
                this.jsonModal.destroy();
                this.jsonModal = null;
            }
        });

        this.jsonModal.add(closeButton);
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

        this.nameBox.setText(this.data.name);
        this.descBox.setText(this.data.description);

        // Update card image
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

        // Position nameBox just below the portraitBox
        const nameBoxY = this.cardImage.y + this.cardImage.displayHeight / 2 + this.nameBox.background!!.displayHeight / 2;
        this.nameBox.setPosition(0, nameBoxY);

        // Position descBox just below the nameBox
        const descBoxY = nameBoxY + this.nameBox.background!!.displayHeight / 2 + this.descBox.background!!.displayHeight / 2;
        this.descBox.setPosition(0, descBoxY);

        // Update HP box if it exists
        if (this.hpBox && this.data instanceof BaseCharacter) {
            const baseCharacter = this.data as BaseCharacter;
            this.hpBox.setText(`${baseCharacter.hitpoints}/${baseCharacter.maxHitpoints}`);
        }
        this.updateVisualTags();
        this.updateIntents();
        this.updateHighlightVisual();
    }

    private updateHighlightVisual(): void {
        const highlightBorder = this.container.getByName('highlightBorder') as Phaser.GameObjects.Rectangle;
        if (highlightBorder) {
            highlightBorder.setVisible(this._isHighlighted);
        }
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

    updateIntents(): void {
        if (!(this.data instanceof AutomatedCharacter)) {
            return;
        }
        var autoChar = this.data as AutomatedCharacter;
        const currentIntents = autoChar.intents;
        const currentIntentIds = new Set(currentIntents.map((intent: AbstractIntent) => intent.id));

        // Remove PhysicalIntents that are no longer needed
        this.physicalIntents.forEach((physicalIntent, id) => {
            if (!currentIntentIds.has(id)) {
                physicalIntent.destroy();
                this.physicalIntents.delete(id);
            }
        });

        // Add or update PhysicalIntents
        currentIntents.forEach((intent: AbstractIntent) => {
            let physicalIntent = this.physicalIntents.get(intent.id);
            if (!physicalIntent) {
                physicalIntent = new PhysicalIntent(this.scene, intent, 0, 0, this.data as BaseCharacter);
                this.physicalIntents.set(intent.id, physicalIntent);
                this.intentsContainer.add(physicalIntent.getContainer());
            } else {
                physicalIntent.updateIntent(intent);
            }
        });

        this.layoutIntents();
    }

    layoutIntents(): void {
        const intents = Array.from(this.physicalIntents.values());
        const spacing = 10;
        let currentX = 0;

        intents.forEach((physicalIntent, index) => {
            const intentContainer = physicalIntent.getContainer();
            intentContainer.setPosition(currentX, 0);
            currentX += intentContainer.width + spacing;
        });

        // Center the intents container
        this.intentsContainer.setPosition(-currentX / 2, this.intentsContainer.y);
    }

    destroy(): void {
        this.scene.events.off('update', this.updateVisuals, this);
        if (this.wiggleTween) {
            this.wiggleTween.stop();
            this.wiggleTween = null;
        }
        this.container.destroy();
    }

    get isHighlighted(): boolean {
        return this._isHighlighted;
    }

    set isHighlighted(value: boolean) {
        this._isHighlighted = value;
        this.updateHighlightVisual();
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




