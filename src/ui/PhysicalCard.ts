// src/gamecharacters/PhysicalCard.ts
import Phaser from 'phaser';
import { AutomatedCharacterType, BaseCharacterType, PlayableCardType } from '../Types';
import { AbstractCard, IPhysicalCardInterface, PriceContext } from '../gamecharacters/AbstractCard';
import { AbstractIntent } from '../gamecharacters/AbstractIntent';
import { BurnEffect } from '../shaders/BurnEffect';
import { CardDescriptionGenerator } from '../text/CardDescriptionGenerator';
import { CardTooltipGenerator } from '../text/CardTooltipGenerator';
import { ResourceDisplayGenerator } from '../text/ResourceDisplayGenerator';
import type { CardConfig } from '../utils/CardGuiUtils';
import { CheapGlowEffect } from './CheapGlowEffect';
import { IncomingIntent } from "./IncomingIntent"; // Import the new class
import { PhysicalBuff } from './PhysicalBuff';
import { PhysicalIntent } from "./PhysicalIntent";
import { ShadowedImage } from './ShadowedImage'; // Add this import
import { TextBox } from "./TextBox"; // Ensure correct relative path
import { TooltipAttachment } from './TooltipAttachment';
import { TransientUiState } from './TransientUiState'; // Added import
import { UIContext } from './UIContextManager';

export class PhysicalCard implements IPhysicalCardInterface {
    private static readonly GLOW_SCALE_MULTIPLIER = 1.7;
    contextRelevant?: UIContext;

    cardConfig: CardConfig;

    container: Phaser.GameObjects.Container;
    cardBackgroundAsRectangle?: Phaser.GameObjects.Rectangle;
    cardBackground: Phaser.GameObjects.Image;
    cardImage: ShadowedImage;
    nameBox: TextBox;
    descBox: TextBox;
    tooltipBox: TextBox;
    hpBox: TextBox | null;
    data: AbstractCard;
    physicalBuffs: PhysicalBuff[];
    scene: Phaser.Scene;
    isSelected: boolean = false;

    private blockTooltip: TooltipAttachment;
    private wiggleTween: Phaser.Tweens.Tween | null = null;
    private hoverSound: Phaser.Sound.BaseSound | null = null;
    private cardContent: Phaser.GameObjects.Container;
    private obliterated: boolean = false;
    private physicalIntents: Map<string, PhysicalIntent> = new Map();
    private intentsContainer: Phaser.GameObjects.Container;
    private jsonModal: Phaser.GameObjects.Container | null = null;
    public get isHighlighted(): boolean {
        return this.glowEffect?.visible ?? false;
    }

    private blocksContainer: Phaser.GameObjects.Container;
    private blockIcon: Phaser.GameObjects.Image;
    public blockText: TextBox;
    private buffsContainer: Phaser.GameObjects.Container;
    private currentBuffs: Map<string, PhysicalBuff> = new Map();
    debugRectangle: any;
    private cardBorder: Phaser.GameObjects.Rectangle;
    private incomingIntentsContainer: Phaser.GameObjects.Container;
    private incomingIntents: Map<string, IncomingIntent> = new Map();
    public glowEffect?: CheapGlowEffect;
    private costBox: TextBox | null = null; // Add costBox property
    private priceBox!: TextBox; // Add this property
    private resourceScalingBox: TextBox | null = null; // Add this property

    // This should be false in production; used for debugging depth-related issues in cards
    depthDebug: boolean = false;
    priceContext: PriceContext = PriceContext.NONE;
    private transientUiState = TransientUiState.getInstance(); // Added

    private cardTypeBox: TextBox | null = null;

    constructor({
        scene,
        x,
        y,
        data,
        cardConfig
    }: {
        scene: Phaser.Scene;
        x: number;
        y: number;
        data: AbstractCard;
        cardConfig: CardConfig;
    }) {
        var {cardWidth, cardHeight} = cardConfig;
        this.scene = scene;
        this.data = data;
        if (!this.data.physicalCard){
            this.data.physicalCard = this;
        }else{
            console.warn("AbstractCard already has a physicalCard property set.");
        }
        this.physicalBuffs = [];
        this.cardConfig = cardConfig;
        
        // Create the main container
        this.container = scene.add.container(x, y);
        this.container.setSize(cardWidth, cardHeight);
        this.container.setInteractive(new Phaser.Geom.Rectangle(0, 0, cardWidth, cardHeight), Phaser.Geom.Rectangle.Contains);
        
        (this.container as any).physicalCard = this;
        
        // Create a new container for card content (excluding tooltip)
        this.cardContent = this.scene.add.container(0, 0);

        // Create cardBackground
        this.cardBackground = this.scene.add.image(0, 0, data.getCardBackgroundImageName())
            .setDisplaySize(cardWidth, cardHeight);

        // Create cardImage
        this.cardImage = new ShadowedImage({
            scene: this.scene,
            texture: this.data.getEffectivePortraitName(this.scene),
            displaySize: this.cardConfig.cardWidth,
            shadowOffset: 3
        });

        // Create nameBox
        this.nameBox = new TextBox({
            scene: this.scene,
            x: 0,
            y: cardHeight / 4,
            width: cardWidth + 40,
            height: 60,
            text: data.name,
            textBoxName: "nameBox:" + data.id,
            style: { fontSize: '22px', fontFamily: 'impact', color: '#000', wordWrap: { width: cardWidth - 10 } },
            bigTextOverVariableColors: true,
            strokeIsOn: true
        });

        // Create descBox
        this.descBox = new TextBox({
            scene: this.scene,
            x: -20,
            y: cardHeight / 2,
            width: cardWidth + 40,
            height: 60,
            text: data.description,
            textBoxName: "descBox:" + data.id,
            style: {
                fontSize: '17px',
                color: '#000',
                wordWrap: { width: cardWidth - 20 },
                align: 'center'
            },
            verticalExpand: 'down',
            horizontalExpand: 'center'
        });
        this.descBox.setVisible(false);

        this.cardContent.add([
            this.cardBackground,
            this.cardImage,
            this.nameBox,
            this.descBox
        ]);

        if (this.cardBackgroundAsRectangle){
            this.cardContent.add(this.cardBackgroundAsRectangle);
        }
        this.container.add(this.cardContent);

        // Create tooltipBox here instead
        this.tooltipBox = new TextBox({
            scene: this.scene,
            x: cardWidth + cardWidth / 2,
            y: 0,
            width: cardWidth + 100,
            height: cardHeight,
            text: data.tooltip || '',
            textBoxName: "tooltipBox:" + data.id,
            style: {
                fontSize: '20px',
                color: '#000',
                wordWrap: { width: cardWidth - 20 },
                align: 'left'
            }
        });
        this.tooltipBox.setVisible(false);
        
        // Add tooltip directly to the main container
        this.container.add(this.tooltipBox);

        // Add HP box if the card is a BaseCharacter
        if (this.data.isBaseCharacter()) {
            const baseCharacter = this.data as BaseCharacterType;
            const cardWidth = this.cardBackground.displayWidth;
            const cardHeight = this.cardBackground.displayHeight;
            this.hpBox = new TextBox({
                scene: this.scene,
                x: cardWidth / 2 + 10,
                y: -cardHeight / 2 + 10,
                width: 66,
                height: 30,
                text: `${baseCharacter.hitpoints}/${baseCharacter.maxHitpoints}`,
                style: { fontSize: '14px', color: '#ff0000', fontFamily: 'Arial' }
            });
            this.cardContent.add(this.hpBox);
        } else {
            this.hpBox = null;
        }

        // Add cost box if the card is a PlayableCard
        if (this.data.isPlayableCard()) {
            const playableCard = this.data as PlayableCardType;
            const cardWidth = this.cardBackground.displayWidth;
            const cardHeight = this.cardBackground.displayHeight;
            
            // Cost box setup remains the same
            this.costBox = new TextBox({
                scene: this.scene,
                x: cardWidth / 2 - 10,
                y: -cardHeight / 2 + 10,
                width: 30,
                height: 30,
                text: `${playableCard.energyCost}`,
                style: { fontSize: '14px', color: '#ffffff', fontFamily: 'Arial' },
                fillColor: 0x0000ff
            });
            
            // Add resource scaling box below cost box
            this.resourceScalingBox = new TextBox({
                scene: this.scene,
                x: cardWidth / 2 - 40,
                y: -cardHeight / 2 + 45, // Position it below the cost box
                width: 100,
                height: 30,
                text: '',
                style: { fontSize: '14px', color: '#ffffff', fontFamily: 'Arial' },
                fillColor: 0x000000
            });
            
            this.cardContent.add([this.costBox, this.resourceScalingBox]);
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
            width: 44,
            height: 30,
            text: `${this.data.block}`, // Assuming AbstractCard has a 'block' property
            style: { fontSize: '14px', color: '#ffffff', fontFamily: 'Arial' },
            fillColor: 0x0000ff,
            textBoxName: "blockText:" + data.id // Add unique identifier
        });

        // Add tooltip to block display
        this.blockTooltip = new TooltipAttachment({
            scene: this.scene,
            container: this.blockText,
            tooltipText: "Block: Reduces incoming damage",
            fillColor: 0x000044
        });

        this.blocksContainer.add(this.blockText);
        this.cardContent.add(this.blocksContainer);
        // Initialize the buffs container positioned to the left of the card
        this.buffsContainer = this.scene.add.container(
            -this.cardBackground.displayWidth / 2 - 100, // Adjust X position as needed
            40 // Position below the block textbox
        );
        this.container.add(this.buffsContainer);

        // Initialize buffs grid
        this.initBuffsGrid();

        // Create a black border around the card background
        this.cardBorder = this.scene.add.rectangle(
            0,
            0,
            this.cardBackground.displayWidth + 4,
            this.cardBackground.displayHeight + 4,
            0x000000
        );
        this.cardBorder.setStrokeStyle(2, 0x000000);

        // Add the border to the cardContent container, behind other elements
        this.cardContent.addAt(this.cardBorder, 0);

        // Initialize incoming intents container positioned to the left of the buffs
        this.incomingIntentsContainer = this.scene.add.container(
            -this.cardBackground.displayWidth / 2 - 60, // Adjust X position as needed
            this.buffsContainer.y // Align vertically with buffs
        );
        this.container.add(this.incomingIntentsContainer);

        // Initialize the targeting intents grid
        this.initTargetingIntentsGrid();

        this.priceBox = new TextBox({
            scene: this.scene,
            x: this.cardBackground.displayWidth / 2 + 20,
            y: 0,
            width: 80,
            height: 30,
            text: '',
            style: { 
                fontSize: '16px', 
                color: '#ffffff',
                fontFamily: 'Arial',
                align: 'left'
            },
            fillColor: 0x0000ff
        });
        this.priceBox.setVisible(false);
        this.cardContent.add(this.priceBox);

        this.updateVisuals();
        this.scene.events.on('update', this.updateVisuals, this);
        this.setupInteractivity();
        this.applyCardSize();
        this.updateIntents();

        if (!(this.data.isBaseCharacter())){
            this.blockText.setVisible(false);
        }
        this.scene.events.once('shutdown', this.obliterate, this);
        this.scene.events.once('destroy', this.obliterate, this);

        // Create glow effect (initially invisible)
        this.glowEffect = new CheapGlowEffect(scene);
        const scaledWidth = this.cardBackground.displayWidth * PhysicalCard.GLOW_SCALE_MULTIPLIER;
        const scaledHeight = this.cardBackground.displayHeight * PhysicalCard.GLOW_SCALE_MULTIPLIER;
        this.glowEffect.setDisplaySize(scaledWidth, scaledHeight);
        
        // Add glow effect first so it appears behind the card
        this.cardContent.addAt(this.glowEffect, 0);

        if (this.data.isPlayableCard()) {
            const playableCard = this.data as PlayableCardType;
            const cardWidth = this.cardBackground.displayWidth;
            const cardHeight = this.cardBackground.displayHeight;
            this.cardTypeBox = new TextBox({
                scene: this.scene,
                x: -cardWidth / 2,
                y: -cardHeight / 2,
                width: 70,
                height: 11,
                text: playableCard.cardType.displayName,
                style: { 
                    fontSize: '12px',
                    color: '#ffffff',
                    fontFamily: 'Arial',
                    align: 'center'
                }
            });
            this.cardContent.add(this.cardTypeBox);
        } else {
            this.cardTypeBox = null;
        }
    }
    setInteractive(isInteractive: boolean): Phaser.GameObjects.Container {
        this.container.setInteractive(isInteractive);
        return this.container;
    }

    public getShaderComponents(): Phaser.GameObjects.GameObject[] {
        const components: Phaser.GameObjects.GameObject[] = [];
        
        if (this.cardBackground) components.push(this.cardBackground);
        if (this.cardImage) components.push(this.cardImage);
        if (this.nameBox) components.push(this.nameBox);
        
        return components;
    }

    obliterate(): void {
        // Remove event listener
        this.scene.events.off('update', this.updateVisuals, this);
        this.data.physicalCard = undefined;
        
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

        if (this.blockTooltip) {
            this.blockTooltip.destroy();
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

        if (this.glowEffect) {
            this.glowEffect.destroy();
            this.glowEffect = undefined;
        }

        if (this.cardTypeBox) {
            this.cardTypeBox.destroy();
        }

        if (this.costBox) {
            this.costBox.destroy();
        }
        if (this.resourceScalingBox) {
            this.resourceScalingBox.destroy();
        }

        this.obliterated = true;
    }

    applyCardSize(): void {
        const scale = this.data.size.sizeModifier;
        this.cardContent.setScale(scale);

        if (this.data.portraitTargetLargestDimension){
            this.cardImage.setImageScale(this.data.portraitTargetLargestDimension);
        }
    }


    getRectangleBoundaries(container: Phaser.GameObjects.Container): Phaser.Geom.Rectangle {
        return new Phaser.Geom.Rectangle(
            -container.displayWidth / 2,
            -container.displayHeight / 2,
            container.displayWidth,
            container.displayHeight
        );
    }
    
    setupInteractivity(): this {
        this.container.setInteractive(this.getRectangleBoundaries(this.container), Phaser.Geom.Rectangle.Contains)
            .on('pointerover', this.onPointerOver_PhysicalCard, this)
            .on('pointerout', this.onPointerOut_PhysicalCard, this)
            .on('pointerdown', this.onPointerDown_PhysicalCard, this);
        return this;
    }

    onPointerOver_PhysicalCard = (): void => {
        TransientUiState.getInstance().setHoveredCard(this);

        if (this.obliterated) return;
        console.log(`Pointer over card: ${this.data.name}`);

        // Animate scaling up with a smooth transition
        this.scene.tweens.add({
            targets: this.cardContent,
            scale: this.data.size.sizeModifier * 1.1,
            duration: 200,
            ease: 'Power2',
            onUpdate: () => {
                
            }
        });

        this.descBox.setVisible(true);
        
        // Get tooltip text
        const tooltipText = CardTooltipGenerator.getInstance().generateTooltip(this.data);
        
        // Only show tooltip if it has meaningful content
        if (tooltipText && tooltipText.trim() !== '') {
            this.tooltipBox.setVisible(true);
            
            // Set tooltip text
            this.tooltipBox.setText(tooltipText);

            // Calculate tooltip dimensions
            const padding = 20;
            const requiredTooltipWidth = this.tooltipBox.width + padding * 2;
            const requiredTooltipHeight = this.tooltipBox.height + padding * 2;

            // Update tooltip size
            this.tooltipBox.setSize(requiredTooltipWidth, requiredTooltipHeight);

            // Determine tooltip position based on card's position
            const cardWidth = this.cardBackground.displayWidth * this.data.size.sizeModifier * 1.1; // Adjust for scaling
            const gameWidth = this.scene.scale.width;
            const cardCenterX = this.container.x;

            // Position tooltip with offset
            if (cardCenterX > gameWidth / 2) {
                // Card is on the right side, show tooltip on the left
                this.tooltipBox.setPosition(-cardWidth - requiredTooltipWidth / 2 - 10, 0);
            } else {
                // Card is on the left side, show tooltip on the right
                this.tooltipBox.setPosition(cardWidth + requiredTooltipWidth / 2 + 10, 0);
            }
        } else {
            this.tooltipBox.setVisible(false);
        }

        // Play hover sound
        if (this.hoverSound) {
            // this.hoverSound.play(); // Uncomment if desired
        }

        // Add wiggle animation
        if (!this.wiggleTween) {
            this.wiggleTween = this.scene.tweens.add({
                targets: this.cardContent,
                angle: { from: -1, to: 1 },
                duration: 88,
                repeat: 2,
                yoyo: true
            });
        }

        this.scene.events.emit("card:pointerover", this)

        TransientUiState.getInstance().setHoveredCard(this);
    }

    onPointerOut_PhysicalCard = (): void => {
        if (this.obliterated) {
            console.log("obliterated card, so ignoring pointer out: " + this.data.name);
            return;
        };

        console.log(`Pointer out card: ${this.data.name}`);

        // Animate scaling back to original size
        this.scene.tweens.add({
            targets: this.cardContent,
            scale: this.data.size.sizeModifier,
            duration: 200,
            ease: 'Power2',
            onUpdate: () => {
            }
        });

        this.descBox.setVisible(false);
        this.tooltipBox.setVisible(false);
        //this.container.setDepth(4);

        // Stop wiggle animation
        if (this.wiggleTween) {
            this.wiggleTween.stop();
            this.wiggleTween = null;
            this.cardContent.setAngle(0);
        }

        this.transientUiState.setHoveredCard(null); // Updated
        this.scene.events.emit("card:pointerout", this)
    }

    onPointerDown_PhysicalCard = (): void => {
        if (this.obliterated) return;
        console.log(`Clicked on card: ${this.data.name}`);
        const jsonData = this.data.createJsonRepresentation();
        console.log("jsonData of card clicked: " + jsonData);
        //this.showJsonModal(jsonData);
        const event = this.data.onClickLaunchEvent();
        if (event){
            this.scene.events.emit('abstractEvent:launch', event);
        }
        this.scene.events.emit("card:pointerdown", this)

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
            wordWrap: { width: modalWidth - 40 },
            resolution: 2, // Add this line
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
            fixedHeight: 30,
            resolution: 2, // Add this line
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
        // Update card background and border sizes
        this.cardBorder.setDisplaySize(this.cardConfig.cardWidth + 4, this.cardConfig.cardHeight + 4);
        this.cardBackground.setDisplaySize(this.cardConfig.cardWidth, this.cardConfig.cardHeight);
        this.cardBackgroundAsRectangle?.setDisplaySize(this.cardConfig.cardWidth, this.cardConfig.cardHeight);
        
        // Ensure the container's size bounds the entire card background
        this.container.setSize(this.cardConfig.cardWidth + 4, this.cardConfig.cardHeight + 4);

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

        // Update the name text to include depth information if debug is enabled
        if (this.depthDebug) {
            this.nameBox.setText(`${this.data.name} depth=[${this.container.depth}]`);
        } else {
            this.nameBox.setText(this.data.name);
        }

        const description = CardDescriptionGenerator.generateCardDescription(this.data);
        this.descBox.setText(description);

        // Update HP box if it exists
        if (this.hpBox && this.data.isBaseCharacter()) {
            const baseCharacter = this.data as BaseCharacterType;
            this.hpBox.setText(`${baseCharacter.hitpoints}/${baseCharacter.maxHitpoints}`);
        }

        if (this.data.isPlayableCard()) {
            const playableCard = this.data as PlayableCardType;
            this.nameBox.setBackgroundColor(playableCard.rarity.color);
        }

        // Update cost box and resource scaling if it exists
        if (this.costBox && this.resourceScalingBox && this.data.isPlayableCard()) {
            const playableCard = this.data as PlayableCardType;
            this.costBox.setText(`${playableCard.energyCost}`);
            
            // Position resource scaling box below the card type box
            if (this.cardTypeBox) {
                const cardTypeBottom = this.cardTypeBox.y + this.cardTypeBox.height / 2;
                this.resourceScalingBox.setPosition(
                    this.cardTypeBox.x + 22, 
                    cardTypeBottom + 22  
                );
            }
            
            // Update resource scaling display
            if (playableCard.resourceScalings && playableCard.resourceScalings.length > 0) {
                const scalingText = ResourceDisplayGenerator.getInstance().generateResourceScalingText(playableCard.resourceScalings);
                this.resourceScalingBox.setText(scalingText);
                this.resourceScalingBox.setVerticalExpand('down');
                this.resourceScalingBox.setHorizontalExpand('left');
                this.resourceScalingBox.setVisible(true);
            } else {
                this.resourceScalingBox.setVisible(false);
            }
        }

        // Update card image and portrait positioning
        const effectivePortraitName = this.data.getEffectivePortraitName(this.scene);
        const effectivePortraitTint = this.data.getEffectivePortraitTint(this.scene);
        
        const texture = this.scene.textures.get(effectivePortraitName);
        texture.setFilter(Phaser.Textures.LINEAR);
        
        // Update the ShadowedImage
        this.setDisplaySizeOfPortraitTexture(texture);
        this.cardImage.setPosition(this.data.portraitOffsetXOverride ?? 0, this.data.portraitOffsetYOverride ?? -this.cardBackground.displayHeight * 0.2);
        this.cardImage.setTint(effectivePortraitTint);

        if (this.cardBackground.scene?.sys){
            this.cardBackground.setTexture(this.data.getCardBackgroundImageName());
        }

        // Position nameBox just below the portraitBox
        const nameBoxY = this.cardImage.y + this.cardImage.displayHeight / 2 + this.nameBox.height / 2 + 10;
        this.nameBox.setPosition(0, nameBoxY);

        // Position descBox just below the nameBox
        const descBoxY = nameBoxY + this.nameBox.height / 2 + this.descBox.height / 2 + 10;
        this.descBox.setPosition(0, descBoxY);

        // Update block text and visibility
        this.blockText.setText(`${this.data.block}`);
        this.blockText.setVisible(this.data.block > 0 && this.data.isBaseCharacter());
        this.blockIcon?.setVisible(this.data.block > 0 && this.data.isBaseCharacter());

        this.updateIntents();

        if (!this.buffsContainer.scene?.sys) {
            console.warn('Scene is undefined in updateVisuals (FOR THE CARD BUFF SPECIFICALLY): ' + this.data.name);
            this.buffsContainer.scene = this.scene;
        } else {
            // Sync buffs each tick
            this.syncBuffs();
        }

        if (this.data.isBaseCharacter()) {
            const baseCharacter = this.data as BaseCharacterType;
            if (baseCharacter.hitpoints <= 0) {
                this.cardImage.setTint(0x808080);
            } else {
                this.cardImage.clearTint();
            }
        }

        // Sync incoming intents
        this.syncIncomingIntents();

         // Simplified price box logic
        if (this.priceContext !== PriceContext.NONE) {
            const priceText = this.data.getPriceDisplayText(this.priceContext);
            const priceColor = this.data.getPriceDisplayColor(this.priceContext);
            this.priceBox.setText(priceText);
            this.priceBox.setFillColor(priceColor);
            this.priceBox.setVisible(true);
        }else{
            this.priceBox.setVisible(false);
        }

        this.glowEffect?.update();

        if (this.cardTypeBox && this.data.isPlayableCard()) {
            const playableCard = this.data as PlayableCardType;
            this.cardTypeBox.setText(playableCard.cardType.displayName);
        }
    }

    private setDisplaySizeOfPortraitTexture(texture: Phaser.Textures.Texture) {
        const frame = texture.get();
        const aspectRatio = frame.width / frame.height;

        const availableWidth = this.data.portraitTargetLargestDimension ?? this.cardBackground.displayWidth * 0.9;
        const availableHeight = this.data.portraitTargetLargestDimension ? availableWidth / aspectRatio : this.cardBackground.displayHeight * 0.7;

        let newWidth = availableWidth;
        let newHeight = availableWidth / aspectRatio;

        if (newHeight > availableHeight) {
            newHeight = availableHeight;
            newWidth = availableHeight * aspectRatio;
        }

        this.cardImage.setDisplaySize(newWidth, newHeight);
    }

    updateIntents(): void {
        if (typeof (this.data as any).generateNewIntents !== 'function') {
            return;
        }
        const autoChar = this.data as AutomatedCharacterType;
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
        this.cardImage.destroy(); // ShadowedImage has its own destroy method
        this.container.destroy();
    }


    // Initialize buffs grid layout
    private initBuffsGrid(): void {
        // Any initial setup for the buffs grid can be done here
    }

    // Sync UI buffs with the underlying AbstractCard's buffs
    private syncBuffs(): void {
        const cardBuffsThatShouldExist = this.data.buffs
            .filter(buff => !buff.moveToMainDescription);

        // Create a set of current buff IDs
        const currentBuffIds = new Set(cardBuffsThatShouldExist
            .map(buff => buff.id));

        // Remove buffs that are no longer present
        this.currentBuffs.forEach((buffUI, id) => {
            if (!currentBuffIds.has(id)) {
                buffUI.destroy();
                this.currentBuffs.delete(id);
            }
        });

        // Add new buffs that are not currently displayed
        cardBuffsThatShouldExist.forEach(buff => {
            if (!this.currentBuffs.has(buff.id)) {
                const physicalBuff = new PhysicalBuff(this.scene, 0, 0, buff);
                this.buffsContainer.add(physicalBuff.container);
                this.currentBuffs.set(buff.id, physicalBuff);
            }
        });

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
            const col = (buffsPerRow - 1) - (index % buffsPerRow); // Change to expand to the left
            
            // Set the size of each buff
            buffUI.container.setSize(buffWidth, buffHeight);
            
            buffUI.container.setPosition(
                col * (buffWidth + padding),
                row * (buffHeight + padding)
            );

            buffUI.updateText();
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
        this.cardContent.add(this.buffsContainer);
    }

    /**
     * Initialize targeting intents grid layout
     */
    private initTargetingIntentsGrid(): void {
        // Any initial setup for the targeting intents grid can be done here
    }

    /**
     * Sync incoming intents with the underlying AbstractCard's incoming intents
     */
    private syncIncomingIntents(): void {
        if (!(this.data.isBaseCharacter())) {
            return;
        }
        const baseCharacter = this.data as BaseCharacterType;
        const targetedIntents = baseCharacter.getIntentsTargetingThisCharacter();
        const currentIntentIds = new Set(targetedIntents.map(intent => intent.id));

        // Remove intents that are no longer present
        this.incomingIntents.forEach((intentUI, id) => {
            if (!currentIntentIds.has(id)) {
                intentUI.destroy();
                this.incomingIntents.delete(id);
            }
            console.log("Removed incoming intent: " + id + " " + intentUI.intent.tooltipText());
        });

        // Add new intents
        targetedIntents.forEach(intent => {
            if (!this.incomingIntents.has(intent.id)) {
                const targetingIntent = new IncomingIntent(this.scene, intent, 0, 0);
                this.incomingIntents.set(intent.id, targetingIntent);
                this.incomingIntentsContainer.add(targetingIntent.getContainer());
            } else {
                this.incomingIntents.get(intent.id)?.updateIntent(intent);
            }
        });

        this.layoutTargetingIntents();
    }

    /**
     * Make the entire card glow or stop glowing with a dramatic and unmistakable effect.
     * @param isGlowing - True to make the card glow, false to stop glowing.
     */
    public setGlow(isGlowing: boolean): void {
        if (!this.glowEffect) return;
        
        if (isGlowing) {
            this.glowEffect.turnOn(true);
            
        } else {
            this.glowEffect.turnOff();
        }
    }

    
    /**
     * Layout the targeting intents in a row that expands leftward
     */
    private layoutTargetingIntents(): void {
        const intents = Array.from(this.incomingIntents.values());
        const spacing = 10;
        const totalIntents = intents.length;
        const totalWidth = totalIntents * IncomingIntent.WIDTH + (totalIntents - 1) * spacing;
        let currentX = 0;
    
        intents.forEach((targetingIntent) => {
            targetingIntent.setPosition(currentX, 0);
            currentX -= IncomingIntent.WIDTH + spacing;
        });
    
        // Position the container based on totalWidth to ensure all intents are visible
        this.incomingIntentsContainer.setPosition(
            -this.cardBackground.displayWidth / 2 - 60 + totalWidth,
            -this.cardBackground.displayHeight / 2
        );
    }

    /**
     * Sets the depth of all card components
     * @param depth The depth value to set
     */
    public setDepth(depth: number): void {
        console.log("Card component depth before setting:", {
            container: this.container.depth,
            descBox: this.descBox.depth,
            nameBox: this.nameBox.depth,
            tooltip: this.tooltipBox.depth,
            backgroundRect: this.cardBackgroundAsRectangle?.depth,
            background: this.cardBackground.depth,
            border: this.cardBorder.depth
        });
        
        // Set depth for main containers
        this.container.setDepth(depth);
        this.cardContent.setDepth(depth);
        
        // Set depth for all major components
        if (this.cardBackgroundAsRectangle) {
            this.cardBackgroundAsRectangle.setDepth(depth - 2);
        }
        this.cardBackground.setDepth(depth - 2);
        this.cardImage.setDepth(depth - 1 );
        this.nameBox.setDepth(depth);
        this.descBox.setDepth(depth);
        this.tooltipBox.setDepth(depth + 1); // Tooltip should be above other elements
        
        // Set depth for optional components
        if (this.hpBox) {
            this.hpBox.setDepth(depth);
        }
        if (this.costBox) {
            this.costBox.setDepth(depth);
        }
        if (this.resourceScalingBox) {
            this.resourceScalingBox.setDepth(depth);
        }
        
        // Set depth for containers and their contents
        this.intentsContainer.setDepth(depth);
        this.physicalIntents.forEach(intent => intent.getContainer().setDepth(depth));
        
        this.blocksContainer.setDepth(depth);
        this.blockText.setDepth(depth);
        
        this.buffsContainer.setDepth(depth);
        this.currentBuffs.forEach(buff => buff.container.setDepth(depth));
        
        this.incomingIntentsContainer.setDepth(depth);
        this.incomingIntents.forEach(intent => intent.getContainer().setDepth(depth));
        
        if (this.cardBorder) {
            this.cardBorder.setDepth(depth - 1); // Border should be behind the card
        }

        if (this.cardTypeBox) {
            this.cardTypeBox.setDepth(depth);
        }

        console.log("Card component depth after setting:", {
            container: this.container.depth,
            descBox: this.descBox.depth,
            nameBox: this.nameBox.depth,
            tooltip: this.tooltipBox.depth,
            backgroundRect: this.cardBackgroundAsRectangle?.depth,
            background: this.cardBackground.depth,
            border: this.cardBorder.depth
        });
    }

    public set glowColor(color: number){
        if (this.glowEffect) {
            this.glowEffect.setTint(color);
        }
    }

    public burnUp(onComplete?: () => void): void {
        // Create burn effect
        const burnEffect = new BurnEffect(this.scene);
        burnEffect.setBurnAmount(0);
        burnEffect.apply(this.container);

        // Create tween to animate burn effect
        this.scene.tweens.add({
            targets: { amt: 0 },
            amt: 1,
            duration: 1000,
            ease: 'Linear',
            onUpdate: (tween) => {
                burnEffect.setBurnAmount(tween.getValue() as number);
            },
            onComplete: () => {
                // Clean up
                this.container.setVisible(false);
                burnEffect.destroy();
                if (onComplete) {
                    onComplete();
                }
            }
        });
    }
    
}

