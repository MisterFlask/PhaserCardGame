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
import { IncomingIntent } from "./IncomingIntent";
import { PhysicalBuff } from './PhysicalBuff';
import { PhysicalIntent } from "./PhysicalIntent";
import { ShadowedImage } from './ShadowedImage';
import { TextBox } from "./TextBox";
import { TooltipAttachment } from './TooltipAttachment';
import { TransientUiState } from './TransientUiState';
import { UIContext } from './UIContextManager';

/**
 * physicalcard shows a single card on screen. 
 * this refactor introduces two main containers:
 *   - a "visualContainer" that holds scalable elements (portrait, background, glow)
 *   - a "uiContainer" that holds text, buffs, intents, and other elements that should remain fixed-size
 * only the visualContainer is scaled according to card scaling, keeping text and other ui at a consistent size.
 */
export class PhysicalCard implements IPhysicalCardInterface {

    private static readonly GLOW_SCALE_MULTIPLIER = 1.7;
    contextRelevant?: UIContext;
    disableInternalTooltip: boolean = false;

    cardConfig: CardConfig;

    container: Phaser.GameObjects.Container;    // main container
    visualContainer: Phaser.GameObjects.Container; // scalable: background, portrait, glow
    uiContainer: Phaser.GameObjects.Container;     // fixed-scale: text, buffs, intents, etc

    cardBackground: Phaser.GameObjects.Image;
    cardBorder: Phaser.GameObjects.Rectangle;
    cardImage: ShadowedImage;

    nameBox: TextBox;
    descBox: TextBox;
    tooltipBox: TextBox;
    hpBox: TextBox | null;
    costBox: TextBox | null = null;
    resourceScalingBox: TextBox | null = null;
    cardTypeBox: TextBox | null = null;
    priceBox!: TextBox;

    data: AbstractCard;
    scene: Phaser.Scene;

    physicalBuffs: PhysicalBuff[] = [];
    private currentBuffs: Map<string, PhysicalBuff> = new Map();

    private physicalIntents: Map<string, PhysicalIntent> = new Map();
    private incomingIntents: Map<string, IncomingIntent> = new Map();

    private obliterated: boolean = false;
    private wiggleTween: Phaser.Tweens.Tween | null = null;
    private hoverSound: Phaser.Sound.BaseSound | null = null;
    private blockTooltip!: TooltipAttachment;

    private blocksContainer: Phaser.GameObjects.Container;
    private buffsContainer: Phaser.GameObjects.Container;
    private intentsContainer: Phaser.GameObjects.Container;
    private incomingIntentsContainer: Phaser.GameObjects.Container;

    private blockIcon!: Phaser.GameObjects.Image;
    public blockText!: TextBox;

    public glowEffect?: CheapGlowEffect;
    depthDebug: boolean = false;
    priceContext: PriceContext = PriceContext.NONE;

    private transientUiState = TransientUiState.getInstance();

    isSelected: boolean = false;
    private jsonModal: Phaser.GameObjects.Container | null = null;

    public get isHighlighted(): boolean {
        return this.glowEffect?.visible ?? false;
    }

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
        this.scene = scene;
        this.data = data;
        this.cardConfig = cardConfig;
        if (!this.data.physicalCard) {
            this.data.physicalCard = this;
        } else {
            console.warn("AbstractCard already has a physicalCard property set.");
        }

        const { cardWidth, cardHeight } = cardConfig;

        // main container
        this.container = scene.add.container(x, y);
        this.container.setSize(cardWidth, cardHeight);
        (this.container as any).physicalCard = this;

        // two-layer structure: visualContainer (scaled) and uiContainer (fixed)
        this.visualContainer = this.scene.add.container(0, 0);
        this.uiContainer = this.scene.add.container(0, 0);

        // background
        this.cardBackground = this.scene.add.image(0, 0, data.getCardBackgroundImageName())
            .setDisplaySize(cardWidth, cardHeight);
        this.visualContainer.add(this.cardBackground);

        // portrait image
        this.cardImage = new ShadowedImage({
            scene: this.scene,
            texture: this.data.getEffectivePortraitName(this.scene),
            displaySize: this.cardConfig.cardWidth,
            shadowOffset: 3
        });
        this.visualContainer.add(this.cardImage);

        // glow effect (behind card)
        this.glowEffect = new CheapGlowEffect(scene);
        this.visualContainer.addAt(this.glowEffect, 0);

        // border
        this.cardBorder = this.scene.add.rectangle(
            0,
            0,
            this.cardBackground.displayWidth + 4,
            this.cardBackground.displayHeight + 4,
            0x000000
        );
        this.cardBorder.setStrokeStyle(2, 0x000000);
        this.visualContainer.addAt(this.cardBorder, 0);

        // textboxes: name, desc, tooltip
        this.nameBox = this.createNameBox(data, cardWidth, cardHeight);
        this.descBox = this.createDescBox(data, cardWidth, cardHeight);
        this.tooltipBox = this.createTooltipBox(data, cardWidth, cardHeight);

        // hp / cost / resource scaling / card type boxes
        this.hpBox = this.maybeCreateHpBox(data);
        this.maybeCreateCostAndResourceScalingBoxes(data);
        this.maybeCreateCardTypeBox(data);

        // price box
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
        this.uiContainer.add(this.priceBox);

        // containers for blocks, buffs, intents, etc.
        this.blocksContainer = this.createBlockContainer();
        this.buffsContainer = this.createBuffsContainer();
        this.intentsContainer = this.scene.add.container(0, -this.cardBackground.displayHeight / 2 - 40);
        this.incomingIntentsContainer = this.createIncomingIntentsContainer();

        // add everything appropriately
        // visual first
        this.container.add(this.visualContainer);
        // ui after
        this.uiContainer.add([this.nameBox, this.descBox, this.tooltipBox, this.blocksContainer, this.buffsContainer, this.intentsContainer, this.incomingIntentsContainer]);
        if (this.hpBox) this.uiContainer.add(this.hpBox);
        if (this.costBox) this.uiContainer.add(this.costBox);
        if (this.resourceScalingBox) this.uiContainer.add(this.resourceScalingBox);
        if (this.cardTypeBox) this.uiContainer.add(this.cardTypeBox);
        this.container.add(this.uiContainer);

        this.initBuffsGrid();

        this.setupHoverSound();

        this.updateVisuals();
        this.scene.events.on('update', this.updateVisuals, this);

        if (!(this.data.isBaseCharacter())) {
            this.blockText?.setVisible(false);
        }

        this.scene.events.once('shutdown', this.obliterate, this);
        this.scene.events.once('destroy', this.obliterate, this);
        this.setupInteractivity();

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

    // main cleanup
    obliterate(): void {
        this.scene.events.off('update', this.updateVisuals, this);
        
        this.data.physicalCard = undefined;

        if (this.wiggleTween) {
            this.wiggleTween.stop();
            this.wiggleTween.remove();
            this.wiggleTween = null;
        }

        this.hoverSound?.destroy();

        this.nameBox.destroy();
        this.descBox.destroy();
        this.tooltipBox.destroy();
        this.hpBox?.destroy();
        this.blockTooltip.destroy();
        this.cardImage?.destroy();
        this.cardBackground?.destroy();
        this.visualContainer?.destroy();
        this.uiContainer?.destroy();
        this.container?.destroy();
        this.buffsContainer?.destroy();
        this.blocksContainer?.destroy();
        this.intentsContainer?.destroy();
        this.glowEffect?.destroy();
        this.cardTypeBox?.destroy();
        this.costBox?.destroy();
        this.resourceScalingBox?.destroy();

        this.obliterated = true;
    }

    /**
     * Apply scaling to the visual container only, so that portrait & background scale
     * up or down while text remains the same size.
     */
    private applyVisualScaling(): void {
        if(!this.cardBorder){
            console.warn("cardBorder not found");
            return;
        };
        const scale = this.data.size.sizeModifier;
        const newWidth = this.cardConfig.cardWidth * scale;
        const newHeight = this.cardConfig.cardHeight * scale;

        // scale background & border
        this.cardBackground.setDisplaySize(newWidth, newHeight);
        this.cardBorder.setSize(newWidth + 4, newHeight + 4)
        
        // scale portrait
        if (this.data.portraitTargetLargestDimension) {
            this.cardImage.setImageScale(this.data.portraitTargetLargestDimension * scale);
        } else {
            this.cardImage.setDisplaySize(newWidth, newHeight);
        }

        const scaledWidth = newWidth * PhysicalCard.GLOW_SCALE_MULTIPLIER;
        const scaledHeight = newHeight * PhysicalCard.GLOW_SCALE_MULTIPLIER;
        // scale highlight if it exists
        if (this.glowEffect) {
            this.glowEffect.setDisplaySize(scaledWidth + 8, scaledHeight + 8);
        }

        // update container dimensions & hitarea
        this.container.setSize(newWidth + 4, newHeight + 4);

        this.container.setInteractive(this.getHitArea(), Phaser.Geom.Rectangle.Contains);

    }

    
    updateVisuals(): void {
        if (this.obliterated) return;
        if (!this.scene.sys) return;

        if (!this.cardBorder.geom){
            console.warn("card geom not found");
            this.obliterate();
            return;
        }
        // update card content
        this.applyVisualScaling();

        if (this.data.isAutomatedCharacter()){
            // eliminate background of card, it's just an unsightly distraction
            this.cardBackground.setVisible(false);
            this.cardBorder.setVisible(false);
        }

        const scale = this.data.size.sizeModifier;
        const newWidth = this.cardConfig.cardWidth * scale;
        const newHeight = this.cardConfig.cardHeight * scale;
    
        // ensure hpBox always stays at top-right corner:
        if (this.hpBox) {
            this.hpBox.setPosition(newWidth / 2 + 10, -newHeight / 2 + 10);
        }
    
        // ensure intents stay at top-center:
        this.intentsContainer.setPosition(0, -newHeight / 2 - 40);
        
        // name debug info
        if (this.depthDebug) {
            this.nameBox.setText(`${this.data.name} depth=[${this.container.depth}]`);
        } else {
            this.nameBox.setText(this.data.name);
        }

        // Update portrait position and properties
        const effectivePortraitName = this.data.getEffectivePortraitName(this.scene);
        const effectivePortraitTint = this.data.getEffectivePortraitTint(this.scene);
        const texture = this.scene.textures.get(effectivePortraitName);
        texture.setFilter(Phaser.Textures.LINEAR);
        this.updatePortraitDisplaySize(texture);
        this.cardImage.setPosition(
            this.data.portraitOffsetXOverride ?? 0,
            this.data.portraitOffsetYOverride ?? -this.cardBackground.displayHeight * 0.2
        );
        this.cardImage.setTint(effectivePortraitTint);

        // Position name box just below portrait
        const portraitBottom = this.cardImage.y + this.cardImage.displayHeight / 2;
        const nameBoxY = portraitBottom + this.nameBox.height / 2 + 5; // 5px gap
        this.nameBox.setPosition(0, nameBoxY);

        // Position description box below name
        const description = CardDescriptionGenerator.generateCardDescription(this.data);
        this.descBox.setText(description);
        const descBoxY = nameBoxY + this.nameBox.height / 2 + this.descBox.height / 2 + 5; // 5px gap
        this.descBox.setPosition(0, descBoxY);
        
        // Update tooltip text
        const tooltipText = CardTooltipGenerator.getInstance().generateTooltip(this.data);
        this.tooltipBox.setText(tooltipText);

        if (this.hpBox && this.data.isBaseCharacter()) {
            const baseCharacter = this.data as BaseCharacterType;
            this.hpBox.setText(`${baseCharacter.hitpoints}/${baseCharacter.maxHitpoints}`);
        }

        if (this.data.isPlayableCard()) {
            const playableCard = this.data as PlayableCardType;
            this.nameBox.setBackgroundColor(playableCard.rarity.color);
            this.costBox?.setText(`${playableCard.energyCost}`);
            this.updateResourceScalingBox(playableCard);
            if (this.cardTypeBox) {
                this.cardTypeBox.setText(playableCard.cardType.displayName);
            }
        }

        this.updateIntentsUI();
        this.syncBuffs();
        this.syncIncomingIntents();

        if (this.data.isBaseCharacter()) {
            const baseCharacter = this.data as BaseCharacterType;
            if (baseCharacter.hitpoints <= 0) {
                this.cardImage.setTint(0x808080);
            } else {
                this.cardImage.setTint(effectivePortraitTint);
            }
        }

        this.blockText?.setText(`${this.data.block}`);

        this.updatePriceBox();
        this.glowEffect?.update();
    }

    private updatePortraitDisplaySize(texture: Phaser.Textures.Texture): void {
        const frame = texture.get();
        const aspectRatio = frame.width / frame.height;
        const availableWidth = this.data.portraitTargetLargestDimension ?? this.cardBackground.displayWidth * 0.9;
        const availableHeight = this.data.portraitTargetLargestDimension
            ? availableWidth / aspectRatio
            : this.cardBackground.displayHeight * 0.7;

        let newWidth = availableWidth;
        let newHeight = availableWidth / aspectRatio;

        if (newHeight > availableHeight) {
            newHeight = availableHeight;
            newWidth = availableHeight * aspectRatio;
        }

        this.cardImage.setDisplaySize(newWidth, newHeight);
    }

    private updateResourceScalingBox(playableCard: PlayableCardType): void {
        if (this.resourceScalingBox) {
            if (playableCard.resourceScalings && playableCard.resourceScalings.length > 0) {
                const scalingText = ResourceDisplayGenerator.getInstance().generateResourceScalingText(playableCard.resourceScalings);
                this.resourceScalingBox.setText(scalingText);
                this.resourceScalingBox.setVisible(true);
            } else {
                this.resourceScalingBox.setVisible(false);
            }
        }
    }

    // intent handling
    private updateIntentsUI(): void {
        if (typeof (this.data as any).generateNewIntents !== 'function') return;
        const autoChar = this.data as AutomatedCharacterType;
        const currentIntents = autoChar.intents;
        const currentIntentIds = new Set(currentIntents.map((intent: AbstractIntent) => intent.id));

        // remove old
        this.physicalIntents.forEach((physicalIntent, id) => {
            if (!currentIntentIds.has(id)) {
                physicalIntent.destroy();
                this.physicalIntents.delete(id);
            }
        });
        // add/update new
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

    private layoutIntents(): void {
        const intents = Array.from(this.physicalIntents.values());
        const spacing = 10;
        let currentX = 0;
        intents.forEach((physicalIntent) => {
            const intentContainer = physicalIntent.getContainer();
            intentContainer.setPosition(currentX, 0);
            currentX += intentContainer.width + spacing;
        });
        this.intentsContainer.setPosition(-currentX / 2, this.intentsContainer.y);
    }

    // buffs
    private initBuffsGrid(): void { /* no-op, but here for clarity */ }

    private syncBuffs(): void {
        const cardBuffsThatShouldExist = this.data.buffs.filter(buff => !buff.moveToMainDescription);
        const currentBuffIds = new Set(cardBuffsThatShouldExist.map(buff => buff.id));

        // remove old
        this.currentBuffs.forEach((buffUI, id) => {
            if (!currentBuffIds.has(id)) {
                buffUI.destroy();
                this.currentBuffs.delete(id);
            }
        });

        // add new
        cardBuffsThatShouldExist.forEach(buff => {
            if (!this.currentBuffs.has(buff.id)) {
                const physicalBuff = new PhysicalBuff(this.scene, 0, 0, buff);
                this.buffsContainer.add(physicalBuff.container);
                this.currentBuffs.set(buff.id, physicalBuff);
            }
        });

        this.layoutBuffs();
    }

    private layoutBuffs(): void {
        const buffsPerRow = 3;
        const padding = 10;
        const buffWidth = 30;
        const buffHeight = 30;
        let index = 0;

        this.currentBuffs.forEach(buffUI => {
            const row = Math.floor(index / buffsPerRow);
            const col = (buffsPerRow - 1) - (index % buffsPerRow);
            buffUI.container.setSize(buffWidth, buffHeight);
            buffUI.container.setPosition(col * (buffWidth + padding), row * (buffHeight + padding));
            buffUI.updateText();
            index++;
        });

        const totalRows = Math.ceil(this.currentBuffs.size / buffsPerRow);
        const totalCols = Math.min(this.currentBuffs.size, buffsPerRow);
        const containerWidth = totalCols * (buffWidth + padding) - padding;
        const containerHeight = totalRows * (buffHeight + padding) - padding;
        this.buffsContainer.setSize(containerWidth, containerHeight);
    }

    // incoming intents (for targets)
    private syncIncomingIntents(): void {
        if (!(this.data.isBaseCharacter())) return;
        const baseCharacter = this.data as BaseCharacterType;
        const targetedIntents = baseCharacter.getIntentsTargetingThisCharacter();
        const currentIntentIds = new Set(targetedIntents.map(intent => intent.id));

        this.incomingIntents.forEach((intentUI, id) => {
            if (!currentIntentIds.has(id)) {
                intentUI.destroy();
                this.incomingIntents.delete(id);
            }
        });

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

        this.incomingIntentsContainer.setPosition(
            -this.cardBackground.displayWidth / 2 - 60 + totalWidth,
            -this.cardBackground.displayHeight / 2
        );
    }

    public setGlow(isGlowing: boolean): void {
        if (!this.glowEffect) return;
        if (isGlowing) {
            this.glowEffect.turnOn(true);
        } else {
            this.glowEffect.turnOff();
        }
    }

    public set glowColor(color: number) {
        if (this.glowEffect) {
            this.glowEffect.setTint(color);
        }
    }

    public burnUp(onComplete?: () => void): void {
        const burnEffect = new BurnEffect(this.scene);
        burnEffect.setBurnAmount(0);
        burnEffect.apply(this.container);

        this.scene.tweens.add({
            targets: { amt: 0 },
            amt: 1,
            duration: 1000,
            ease: 'Linear',
            onUpdate: (tween) => {
                burnEffect.setBurnAmount(tween.getValue() as number);
            },
            onComplete: () => {
                this.container.setVisible(false);
                burnEffect.destroy();
                if (onComplete) {
                    onComplete();
                }
            }
        });
    }

    public setDepth(depth: number): void {
        this.container.setDepth(depth);
        this.visualContainer.setDepth(depth);
        this.uiContainer.setDepth(depth + 1); // ui above visuals

        // no complicated per-element depth logic; containers now handle relative stacking
    }

    private getHitArea(): Phaser.Geom.Rectangle {
        // Base interactive area based on cardBackground
        const baseWidth = this.cardBackground.displayWidth + 4;
        const baseHeight = this.cardBackground.displayHeight + 4;
        
        // If descBox exists and is positioned below the cardBackground, extend the height
        let extraHeight = 0;
        if (this.descBox && this.descBox.visible) {
            // Assuming descBox.y is relative to the container's origin
            const descBoxBottom = this.descBox.y + this.descBox.height;
            // Extend hit area if descBox extends below the base area
            if (descBoxBottom > baseHeight) {
                extraHeight = descBoxBottom - baseHeight + 10; // add a 10px margin
            }
        }

        return new Phaser.Geom.Rectangle(0, 0, baseWidth, baseHeight + extraHeight);
    }

    private setupInteractivity(): this {
        const backgroundHitArea = this.getHitArea();
    
        this.container
            .off('pointerover', this.onPointerOver_PhysicalCard, this)
            .off('pointerout', this.onPointerOut_PhysicalCard, this)
            .off('pointerdown', this.onPointerDown_PhysicalCard, this)
            .setInteractive(backgroundHitArea, Phaser.Geom.Rectangle.Contains)
            .on('pointerover', this.onPointerOver_PhysicalCard, this)
            .on('pointerout', this.onPointerOut_PhysicalCard, this)
            .on('pointerdown', this.onPointerDown_PhysicalCard, this);
    
        return this;
    }
    
    

    private onPointerOver_PhysicalCard(): void {
        if (!this.obliterated) {
            this.setGlow(true);
            if (!this.disableInternalTooltip) {
                this.positionTooltipBox();
                this.tooltipBox.setVisible(true);
                if (this.tooltipBox.parentContainer) {
                    this.tooltipBox.parentContainer.bringToTop(this.tooltipBox);
                }
                this.descBox.setVisible(true);
            }
            if (this.hoverSound) {
                this.hoverSound.play();
            }
        }
    }

    private onPointerOut_PhysicalCard(): void {
        if (!this.obliterated) {
            // Only remove glow if the card is NOT selected
            if (!this.isSelected) {
                this.setGlow(false);
            }
            if (!this.disableInternalTooltip) {
                this.tooltipBox.setVisible(false);
                this.descBox.setVisible(false);
            }
        }
    }

    onPointerDown_PhysicalCard = (): void => {
        if (this.obliterated) return;
        const event = this.data.onClickLaunchEvent();
        if (event) {
            this.scene.events.emit('abstractEvent:launch', event);
        }
        this.scene.events.emit("card:pointerdown", this);
    }

    private setupHoverSound(): void {
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
    }

    private createNameBox(data: AbstractCard, cardWidth: number, cardHeight: number): TextBox {
        return new TextBox({
            scene: this.scene,
            x: 0,
            y: 0,  // Will be positioned in updateVisuals
            width: cardWidth + 40,
            height: 30,  // Reduced height since we're tightening the layout
            text: data.name,
            textBoxName: "nameBox:" + data.id,
            style: { fontSize: '22px', fontFamily: 'impact', color: '#000', wordWrap: { width: cardWidth - 10 } },
            bigTextOverVariableColors: true,
            strokeIsOn: true
        });
    }

    private createDescBox(data: AbstractCard, cardWidth: number, cardHeight: number): TextBox {
        const box = new TextBox({
            scene: this.scene,
            x: 0,  // Centered horizontally
            y: 0,  // Will be positioned in updateVisuals
            width: cardWidth - 20,  // Slightly narrower than card for better readability
            height: 60,
            text: data.description,
            textBoxName: "descBox:" + data.id,
            style: {
                fontSize: '17px',
                color: '#000',
                wordWrap: { width: cardWidth - 30 },
                align: 'center'
            },
            verticalExpand: 'down',
            horizontalExpand: 'center'
        });
        box.setVisible(false);
        return box;
    }

    private createTooltipBox(data: AbstractCard, cardWidth: number, cardHeight: number): TextBox {
        const tooltipText = CardTooltipGenerator.getInstance().generateTooltip(data);
        const box = new TextBox({
            scene: this.scene,
            x: -20,
            y: cardHeight / 2,
            width: cardWidth + 40,
            height: 60,
            text: tooltipText,
            textBoxName: "tooltipBox:" + data.id,
            style: {
                fontSize: '17px',
                color: '#ffffff',
                wordWrap: { width: cardWidth - 20 },
                align: 'center'
            },
            fillColor: 0x000000,
            verticalExpand: 'down',
            horizontalExpand: 'center'
        });
        box.setVisible(false);
        return box;
    }

    private maybeCreateHpBox(data: AbstractCard): TextBox | null {
        if (data.isBaseCharacter()) {
            const baseCharacter = data as BaseCharacterType;
            return new TextBox({
                scene: this.scene,
                x: this.cardBackground.displayWidth / 2 + 10,
                y: -this.cardBackground.displayHeight / 2 + 10,
                width: 66,
                height: 30,
                text: `${baseCharacter.hitpoints}/${baseCharacter.maxHitpoints}`,
                style: { fontSize: '14px', color: '#ff0000', fontFamily: 'Arial' }
            });
        }
        return null;
    }

    private maybeCreateCostAndResourceScalingBoxes(data: AbstractCard) {
        if (!data.isPlayableCard()) return;
        const playableCard = data as PlayableCardType;
        const cw = this.cardBackground.displayWidth;
        const ch = this.cardBackground.displayHeight;
        this.costBox = new TextBox({
            scene: this.scene,
            x: cw / 2 - 10,
            y: -ch / 2 + 10,
            width: 30,
            height: 30,
            text: `${playableCard.energyCost}`,
            style: { fontSize: '14px', color: '#ffffff', fontFamily: 'Arial' },
            fillColor: 0x0000ff
        });

        this.resourceScalingBox = new TextBox({
            scene: this.scene,
            x: cw / 2 - 40,
            y: -ch / 2 + 45,
            width: 100,
            height: 30,
            text: '',
            style: { fontSize: '14px', color: '#ffffff', fontFamily: 'Arial' },
            fillColor: 0x000000
        });
    }

    private maybeCreateCardTypeBox(data: AbstractCard) {
        if (data.isPlayableCard()) {
            const playableCard = data as PlayableCardType;
            const cw = this.cardBackground.displayWidth;
            const ch = this.cardBackground.displayHeight;
            this.cardTypeBox = new TextBox({
                scene: this.scene,
                x: -cw / 2,
                y: -ch / 2,
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
        }
    }

    private createBlockContainer(): Phaser.GameObjects.Container {
        const container = this.scene.add.container(-this.cardBackground.displayWidth / 2 - 40, 0);
        this.blockIcon = this.scene.add.image(0, 0, 'block_icon');
        this.blockText = new TextBox({
            scene: this.scene,
            x: this.blockIcon.x + this.blockIcon.displayWidth / 2 + 5,
            y: 0,
            width: 44,
            height: 30,
            text: `${this.data.block}`,
            style: { fontSize: '14px', color: '#ffffff', fontFamily: 'Arial' },
            fillColor: 0x0000ff,
            textBoxName: "blockText:" + this.data.id
        });
        container.add(this.blockText);

        this.blockTooltip = new TooltipAttachment({
            scene: this.scene,
            container: this.blockText,
            tooltipText: "Block: Reduces incoming damage",
            fillColor: 0x000044
        });
        return container;
    }

    private createBuffsContainer(): Phaser.GameObjects.Container {
        // position to the left; text doesn't scale
        const container = this.scene.add.container(
            -this.cardBackground.displayWidth / 2 - 100,
            40
        );
        return container;
    }

    private createIncomingIntentsContainer(): Phaser.GameObjects.Container {
        const container = this.scene.add.container(
            -this.cardBackground.displayWidth / 2 - 60,
            this.buffsContainer.y
        );
        return container;
    }

    private positionTooltipBox(): void {
        const tooltipBox = this.tooltipBox;
        const padding = 20;
        const requiredTooltipWidth = tooltipBox.width + padding * 2;
        const requiredTooltipHeight = tooltipBox.height + padding * 2;
        tooltipBox.setSize(requiredTooltipWidth, requiredTooltipHeight);

        const cardWidth = this.cardBackground.displayWidth * this.data.size.sizeModifier * 1.1;
        const gameWidth = this.scene.scale.width;
        const cardCenterX = this.container.x;

        if (cardCenterX > gameWidth / 2) {
            tooltipBox.setPosition(-cardWidth - requiredTooltipWidth / 2 - 10, 0);
        } else {
            tooltipBox.setPosition(cardWidth + requiredTooltipWidth / 2 + 10, 0);
        }
    }

    private updatePriceBox() {
        if (this.priceContext !== PriceContext.NONE) {
            const priceText = this.data.getPriceDisplayText(this.priceContext);
            const priceColor = this.data.getPriceDisplayColor(this.priceContext);
            this.priceBox.setText(priceText);
            this.priceBox.setFillColor(priceColor);
            this.priceBox.setVisible(true);
        } else {
            this.priceBox.setVisible(false);
        }
    }


    public addGrowAndShrinkAnimationOnHoverLerps(): this {
        this.container.setInteractive({
            hitArea: this.getHitArea()
        }).on('pointerover', () => {
            this.container.setScale(1.2);
        }).on('pointerout', () => {
            this.container.setScale(1.0);
        });
        return this;
    }
}
