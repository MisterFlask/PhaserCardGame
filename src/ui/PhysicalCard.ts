// src/gamecharacters/PhysicalCard.ts
import Phaser from 'phaser';
import { AbstractCard } from "../gamecharacters/AbstractCard";
import { AbstractIntent } from '../gamecharacters/AbstractIntent';
import { AutomatedCharacter } from '../gamecharacters/AutomatedCharacter';
import { BaseCharacter } from "../gamecharacters/BaseCharacter";
import { PhysicalBuff } from './PhysicalBuff';
import { PhysicalIntent } from "./PhysicalIntent";
import { TextBox } from "./TextBox"; // Ensure correct relative path

export class PhysicalCard {
    container: Phaser.GameObjects.Container;
    cardBackground: Phaser.GameObjects.Rectangle | Phaser.GameObjects.Image;
    cardImage: Phaser.GameObjects.Image;
    nameBox: TextBox;
    descBox: TextBox;
    tooltipBox: TextBox;
    hpBox: TextBox | null;
    data: AbstractCard;
    physicalBuffs: PhysicalBuff[];
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
    private blocksContainer: Phaser.GameObjects.Container;
    private blockIcon: Phaser.GameObjects.Image;
    public blockText: TextBox;
    private buffsContainer: Phaser.GameObjects.Container;
    private currentBuffs: Map<string, PhysicalBuff> = new Map();
    debugRectangle: any;
    private cardBorder: Phaser.GameObjects.Rectangle;

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
        cardBackground: Phaser.GameObjects.Rectangle | Phaser.GameObjects.Image;
        cardImage: Phaser.GameObjects.Image;
        nameBox: TextBox;
        descBox: TextBox;
        tooltipBox: TextBox;
        data: AbstractCard;
        visualTags: PhysicalBuff[];
    }) {
        this.scene = scene;
        this.container = container;
        this.cardBackground = cardBackground;
        this.cardImage = cardImage;
        this.nameBox = nameBox;
        this.descBox = descBox;
        this.tooltipBox = tooltipBox;
        this.data = data;
        (this.data as any).physicalCard = this;
        this.physicalBuffs = [];

        // Create a new container for card content (excluding tooltip)
        this.cardContent = this.scene.add.container(0, 0);
        this.cardContent.add([
            this.cardBackground,
            this.cardImage,
            this.nameBox.background!!,
            // No need to add outline separately as it's part of TextBox
            this.nameBox.text,
            this.descBox.background!!,
            this.descBox.text
        ]);
        this.container.add(this.cardContent);

        // Add tooltip elements directly to the main container
        this.container.add([
            this.tooltipBox.background!!,
            this.tooltipBox.text
        ]);

        // Add HP box if the card is a BaseCharacter
        if (this.data instanceof BaseCharacter) {
            const baseCharacter = this.data as BaseCharacter;
            const cardWidth = this.cardBackground.displayWidth;
            const cardHeight = this.cardBackground.displayHeight;
            this.hpBox = new TextBox({
                scene: this.scene,
                x: cardWidth / 2 - 10,
                y: -cardHeight / 2 + 10,
                width: 60,
                height: 30,
                text: `${baseCharacter.hitpoints}/${baseCharacter.maxHitpoints}`,
                style: { fontSize: '14px', color: '#ff0000', fontFamily: 'Arial' }
            });
            this.cardContent.add([this.hpBox.background!!, this.hpBox.text]);
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
        this.intentsContainer = this.scene.add.container(0, -this.cardBackground.displayHeight / 2 - 40);
        this.cardContent.add(this.intentsContainer);

        // Initialize block container
        this.blocksContainer = this.scene.add.container(-this.cardBackground.displayWidth / 2 - 40, 0); // Position to the left
        this.blockIcon = this.scene.add.image(0, 0, 'block_icon'); // Ensure 'block_icon' texture is loaded
        this.blockText = new TextBox({
            scene: this.scene,
            x: this.blockIcon.x + this.blockIcon.displayWidth / 2 + 5,
            y: 0,
            width: 50,
            height: 30,
            text: `${this.data.block}`, // Assuming AbstractCard has a 'block' property
            style: { fontSize: '14px', color: '#ffffff', fontFamily: 'Arial' },
            fillColor: 0x0000ff
        });
        this.blocksContainer.add([/*this.blockIcon,*/ this.blockText.background!!, this.blockText.text]);
        this.cardContent.add(this.blocksContainer);
        // Initialize the buffs container positioned to the left of the card
        this.buffsContainer = this.scene.add.container(
            -this.cardBackground.displayWidth / 2 - 50, // Adjust X position as needed
            40 // Position below the block textbox
        );
        this.container.add(this.buffsContainer);

        // Initialize buffs grid
        this.initBuffsGrid();

        // Create a black border around the card background
        this.cardBorder = this.scene.add.rectangle(
            0,
            0,
            this.cardBackground.displayWidth + 4, // Slightly larger than the background
            this.cardBackground.displayHeight + 4,
            0x000000 // Black color
        );
        this.cardBorder.setStrokeStyle(2, 0x000000); // 2px thick black border

        // Add the border to the cardContent container, behind other elements
        this.cardContent.addAt(this.cardBorder, 0);

        this.updateVisuals();
        this.scene.events.on('update', this.updateVisuals, this);
        this.setupInteractivity();
        this.applyCardSize();
        this.updateIntents();

        if (!(this.data instanceof BaseCharacter)){
            this.blockText.setVisible(false);
        }
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

        if (this.buffsContainer){
            this.buffsContainer.destroy();
        }

        if (this.blocksContainer){
            this.blocksContainer.destroy();
        }

        if (this.intentsContainer){
            this.intentsContainer.destroy();
        }

        this.obliterated = true;
    }

    applyCardSize(): void {
        const scale = this.data.size.sizeModifier;
        this.cardContent.setScale(scale);
    }

    setupInteractivity(): void {
        this.container.setInteractive()
            .on('pointerover', this.onPointerOver_PhysicalCard, this)
            .on('pointerout', this.onPointerOut_PhysicalCard, this)
            .on('pointerdown', this.onPointerDown_PhysicalCard, this);
    }

    onPointerOver_PhysicalCard = (): void => {
        // Bring the card to the top within its parent container
        if (this.container.parentContainer) {
            this.container.parentContainer.bringToTop(this.container);
        }

        if (this.obliterated) return;
        console.log(`Pointer over card: ${this.data.name}`);

        // Animate scaling up with a smooth transition
        this.scene.tweens.add({
            targets: this.cardContent,
            scale: this.data.size.sizeModifier * 1.1,
            duration: 200,
            ease: 'Power2'
        });

        this.descBox.setVisible(true);
        this.tooltipBox.setVisible(true);
        this.container.setDepth(1000);

        // Determine tooltip position based on card's position
        const cardWidth = this.cardBackground.displayWidth * this.data.size.sizeModifier * 1.1; // Adjust for scaling
        const gameWidth = this.scene.scale.width;
        const cardCenterX = this.container.x;

        // Set tooltip text
        this.tooltipBox.setText(this.data.id);

        // Calculate tooltip dimensions
        const padding = 20;
        const requiredTooltipWidth = this.tooltipBox.text.width + padding * 2;
        const requiredTooltipHeight = this.tooltipBox.text.height + padding * 2;

        // Update tooltip size
        this.tooltipBox.setSize(requiredTooltipWidth, requiredTooltipHeight);

        // Position tooltip with offset
        if (cardCenterX > gameWidth / 2) {
            // Card is on the right side, show tooltip on the left
            this.tooltipBox.setPosition(-cardWidth - requiredTooltipWidth / 2 - 10, 0);
        } else {
            // Card is on the left side, show tooltip on the right
            this.tooltipBox.setPosition(cardWidth + requiredTooltipWidth / 2 + 10, 0);
        }

        // Play hover sound
        if (this.hoverSound) {
            // this.hoverSound.play(); // Uncomment if desired
        }

        // Add wiggle animation
        if (!this.wiggleTween) {
            this.wiggleTween = this.scene.tweens.add({
                targets: this.cardContent,
                angle: { from: -2, to: 2 },
                duration: 100,
                repeat: 2,
                yoyo: true
            });
        }
    }

    onPointerOut_PhysicalCard = (): void => {
        if (this.obliterated) return;
        console.log(`Pointer out card: ${this.data.name}`);

        // Animate scaling back to original size
        this.scene.tweens.add({
            targets: this.cardContent,
            scale: this.data.size,
            duration: 200,
            ease: 'Power2'
        });

        this.descBox.setVisible(false);
        this.tooltipBox.setVisible(false);
        this.container.setDepth(0);

        // Stop wiggle animation
        if (this.wiggleTween) {
            this.wiggleTween.stop();
            this.wiggleTween = null;
            this.cardContent.setAngle(0);
        }
    }

    onPointerDown_PhysicalCard = (): void => {
        if (this.obliterated) return;
        console.log(`Clicked on card: ${this.data.name}`);
        const jsonData = this.data.createJsonRepresentation();
        console.log("jsonData of card clicked: " + jsonData);
        //this.showJsonModal(jsonData);
    }

    showJsonModal(jsonData: string): void {
        if (this.jsonModal) {
            this.jsonModal.destroy();
        }

        const modalWidth = this.scene.scale.width * 0.8;
        const modalHeight = this.scene.scale.height * 0.8;

        const background = this.scene.add.rectangle(0, 0, modalWidth, modalHeight, 0x000000, 0.85).setOrigin(0.5);
        background.setStrokeStyle(2, 0xffffff);

        const text = this.scene.add.text(0, 0, jsonData, {
            fontSize: '16px',
            color: '#ffffff',
            fontFamily: 'Courier',
            wordWrap: { width: modalWidth - 40 }
        });
        text.setPosition(-modalWidth / 2 + 20, -modalHeight / 2 + 20);
        text.setOrigin(0, 0);

        const closeButton = this.scene.add.text(modalWidth / 2 - 70, modalHeight / 2 - 40, 'Close', {
            fontSize: '20px',
            color: '#ff5555',
            fontFamily: 'Arial',
            backgroundColor: '#333333',
            padding: { x: 10, y: 5 },
            fixedWidth: 80,
            fixedHeight: 30
        }).setOrigin(0.5);
        closeButton.setInteractive({ useHandCursor: true });

        closeButton.on('pointerover', () => {
            closeButton.setStyle({ backgroundColor: '#555555' });
        });

        closeButton.on('pointerout', () => {
            closeButton.setStyle({ backgroundColor: '#333333' });
        });

        closeButton.on('pointerdown', () => {
            if (this.jsonModal) {
                this.jsonModal.destroy();
                this.jsonModal = null;
            }
        });

        this.jsonModal = this.scene.add.container(
            this.scene.scale.width / 2,
            this.scene.scale.height / 2,
            [background, text, closeButton]
        );
    }

    updateVisuals(): void {
        if (this.obliterated) return;
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
            const availableWidth = this.cardBackground.displayWidth * 0.8; // 80% of card width
            const availableHeight = this.cardBackground.displayHeight * 0.5; // 50% of card height

            let newWidth = availableWidth;
            let newHeight = availableWidth / aspectRatio;

            if (newHeight > availableHeight) {
                newHeight = availableHeight;
                newWidth = availableHeight * aspectRatio;
            }

            this.cardImage.setDisplaySize(newWidth, newHeight);

            // Center the image on the card
            this.cardImage.setPosition(0, -this.cardBackground.displayHeight * 0.2); // Move image slightly upwards
        } else {
            console.warn(`Texture '${this.data.portraitName}' not found. Using fallback texture.`);
            // this.cardImage.setTexture('fallback_texture'); // Ensure you have a fallback texture
        }

        // Position nameBox just below the portraitBox
        const nameBoxY = this.cardImage.y + this.cardImage.displayHeight / 2 + this.nameBox.background!!.displayHeight / 2 + 10;
        this.nameBox.setPosition(0, nameBoxY);

        // Position descBox just below the nameBox
        const descBoxY = nameBoxY + this.nameBox.background!!.displayHeight / 2 + this.descBox.background!!.displayHeight / 2 + 10;
        this.descBox.setPosition(0, descBoxY);

        // Update HP box if it exists
        if (this.hpBox && this.data instanceof BaseCharacter) {
            const baseCharacter = this.data as BaseCharacter;
            this.hpBox.setText(`${baseCharacter.hitpoints}/${baseCharacter.maxHitpoints}`);
        }

        // Update block text
        this.blockText.setText(`${this.data.block}`);

        this.updateIntents();
        this.updateHighlightVisual();

        if (!this.buffsContainer.scene?.sys) {
            console.warn('Scene is undefined in updateVisuals (FOR THE CARD BUFF SPECIFICALLY): ' + this.data.name);
            this.buffsContainer.scene = this.scene;
        }else{
            // Sync buffs each tick
            this.syncBuffs();
        }

        // Update the border size to match the card background
        this.cardBorder.setDisplaySize(
            this.cardBackground.displayWidth + 4,
            this.cardBackground.displayHeight + 4
        );

        if (this.data instanceof BaseCharacter) {
            if (this.data.hitpoints <= 0) {
                this.cardImage.setTint(0x808080); // Apply greyscale tint
            } else {
                this.cardImage.clearTint(); // Remove tint if HP is above 0
            }
        }
    }

    private updateHighlightVisual(): void {
        const highlightBorder = this.container.getByName('highlightBorder') as Phaser.GameObjects.Rectangle;
        if (highlightBorder) {
            highlightBorder.setVisible(this._isHighlighted);
        }
    }

    updateIntents(): void {
        if (!(this.data instanceof AutomatedCharacter)) {
            return;
        }
        const autoChar = this.data as AutomatedCharacter;
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
                physicalIntent = new PhysicalIntent(this.scene, intent, 0, 0);
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

    /**
     * Highlights the card by changing its appearance.
     */
    highlight(): void {
        this.isHighlighted = true
        console.log("highlightBorder: " + this._isHighlighted);
    }

    /**
     * Removes the highlight from the card.
     */
    unhighlight(): void {
        this.isHighlighted = false
        console.log("highlightBorder: " + this._isHighlighted);
    }

    // Initialize buffs grid layout
    private initBuffsGrid(): void {
        // Any initial setup for the buffs grid can be done here
    }

    // Sync UI buffs with the underlying AbstractCard's buffs
    private syncBuffs(): void {
        const characterBuffs = this.data.buffs; // Assuming AbstractCard has a 'buffs' property

        // Create a set of current buff IDs
        const currentBuffIds = new Set(characterBuffs.map(buff => buff.id));

        // Remove buffs that are no longer present
        this.currentBuffs.forEach((buffUI, id) => {
            if (!currentBuffIds.has(id)) {
                buffUI.destroy();
                this.currentBuffs.delete(id);
            }
        });

        // Add new buffs that are not currently displayed
        characterBuffs.forEach(buff => {
            if (!this.currentBuffs.has(buff.id)) {
                const physicalBuff = new PhysicalBuff(this.scene, 0, 0, buff);
                this.buffsContainer.add(physicalBuff.container);
                this.currentBuffs.set(buff.id, physicalBuff);
            }
        });

        // Optionally, layout the buffs in a grid
        this.layoutBuffs();
    }
    // Layout buffs in an expandable grid
    private layoutBuffs(): void {
        const buffsPerRow = 3; // Adjust as needed
        const padding = 10;
        const buffWidth = 30; // Set a fixed width for each buff
        const buffHeight = 30; // Set a fixed height for each buff
        let index = 0;

        this.currentBuffs.forEach(buffUI => {
            const row = Math.floor(index / buffsPerRow);
            const col = index % buffsPerRow;
            
            // Set the size of each buff
            buffUI.container.setSize(buffWidth, buffHeight);
            
            buffUI.container.setPosition(
                col * (buffWidth + padding),
                row * (buffHeight + padding)
            );
            index++;
        });

        // Adjust the size of buffsContainer based on the number of buffs
        const totalRows = Math.ceil(this.currentBuffs.size / buffsPerRow);
        const totalCols = Math.min(this.currentBuffs.size, buffsPerRow);
        const containerWidth = totalCols * (buffWidth + padding) - padding;
        const containerHeight = totalRows * (buffHeight + padding) - padding;
        this.buffsContainer.setSize(containerWidth, containerHeight);

        // Create a debugging rectangle around the buff grid
        if (this.debugRectangle) {
            this.debugRectangle.destroy();
        }
        /*
        this.debugRectangle = this.scene.add.rectangle(
            this.buffsContainer.x,
            this.buffsContainer.y,
            containerWidth,
            containerHeight,
            0xff0000,
            0.3
        );
        this.debugRectangle.setOrigin(0, 0);
        this.cardContent.add(this.debugRectangle);
        */
        this.cardContent.add(this.buffsContainer);
    }
}

export abstract class AbstractCombatEvent{

}