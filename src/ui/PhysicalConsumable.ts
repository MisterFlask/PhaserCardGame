import Phaser from 'phaser';
import { AbstractConsumable } from '../consumables/AbstractConsumable';
import { BaseCharacter } from '../gamecharacters/BaseCharacter';
import ImageUtils from '../utils/ImageUtils';
import { ShadowedImage } from './ShadowedImage';
import { TextBox } from './TextBox';
import { TooltipAttachment } from './TooltipAttachment';
import { TransientUiState } from './TransientUiState';
import { UIContext } from './UIContextManager';

export class PhysicalConsumable extends Phaser.GameObjects.Container {
    contextRelevant?: UIContext;
    consumableImage: Phaser.GameObjects.Image;
    shadowImage: Phaser.GameObjects.Image;
    private tooltipAttachment: TooltipAttachment;
    priceBox?: TextBox;
    abstractConsumable: AbstractConsumable;
    private _isHighlighted: boolean = false;
    private obliterated: boolean = false;
    private baseSize: number;
    usesLeft?: number;
    private selectOverlay!: Phaser.GameObjects.Image;
    currentlyActivatable: boolean = false;
    private target?: BaseCharacter;
    private isDragging: boolean = false;
    private dragStartPosition: { x: number, y: number } | null = null;
    private transientUiState: TransientUiState;

    constructor({
        scene,
        x = 0,
        y = 0,
        abstractConsumable,
        price,
        baseSize = 64
    }: {
        scene: Phaser.Scene;
        x?: number;
        y?: number;
        abstractConsumable: AbstractConsumable;
        price?: number;
        baseSize: number;
    }) {
        super(scene, x, y);

        if (!scene) {
            console.error("No scene provided to PhysicalConsumable");
            throw new Error("No scene provided to PhysicalConsumable");
        }
        console.log(`Initializing PhysicalConsumable for: ${abstractConsumable.getDisplayName()} at (${x}, ${y})`);

        this.abstractConsumable = abstractConsumable;
        this.baseSize = baseSize;
        this.usesLeft = abstractConsumable.uses;
        this.transientUiState = TransientUiState.getInstance();

        const textureName = abstractConsumable.imageName.length > 0 ? abstractConsumable.imageName : this.getAbstractIcon(abstractConsumable);
        if (!scene.textures.exists(textureName)) {
            console.error(`Texture not found for key: ${textureName}`);
        }

        const shadowedImage = new ShadowedImage({
            scene,
            texture: textureName,
            displaySize: baseSize,
            shadowOffset: 2,
            tint: abstractConsumable.tint
        });
        this.add(shadowedImage);
        
        this.consumableImage = shadowedImage.mainImage;
        this.shadowImage = shadowedImage.shadowImage;

        // Add select overlay
        this.selectOverlay = scene.add.image(0, 0, 'square');
        this.selectOverlay.setDisplaySize(baseSize, baseSize);
        this.selectOverlay.setVisible(abstractConsumable.clickable);
        this.add(this.selectOverlay);

        // Add glow animation to select overlay
        if (abstractConsumable.clickable && this.currentlyActivatable) {
            scene.tweens.add({
                targets: this.selectOverlay,
                tint: { from: 0xffffff, to: 0xffa500 },
                alpha: { from: 0.8, to: 1 },
                duration: 1500,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        }

        // Create tooltip
        const tooltipText = this.generateTooltip(abstractConsumable);
        this.tooltipAttachment = new TooltipAttachment({
            scene,
            container: this.consumableImage,
            tooltipText: tooltipText
        });

        // Add price box if needed
        this.priceBox = new TextBox({
            scene,
            text: `${price ?? abstractConsumable.basePrice}$`,
            width: 50,
            height: 25,
            y: this.baseSize / 2 + 15
        });
        this.add(this.priceBox);
        this.priceBox.setDepth(1);

        // Add uses counter if needed
        if (this.usesLeft && this.usesLeft > 1) {
            this.updateUsesDisplay();
        }

        this.setupInteractivity();
    }

    private getAbstractIcon(abstractConsumable: AbstractConsumable): string {
        return ImageUtils.getDeterministicAbstractPlaceholder(abstractConsumable.getDisplayName());
    }

    private generateTooltip(abstractConsumable: AbstractConsumable): string {
        return `[color=#gold]${abstractConsumable.getDisplayName()}[/color]\n${abstractConsumable.getDescription()}`;
    }
    
    setupInteractivity(): void {
        // Set up pointer events on the consumable image
        this.consumableImage
            .setInteractive()
            .on('pointerdown', this.onPointerDown, this)
            .on('pointerup', this.onPointerUp, this)
            .on('pointerover', this.onPointerOver, this)
            .on('pointerout', this.onPointerOut, this)
            .on('pointermove', this.onPointerMove, this);
    }

    disableInteractive(): this {
        this.consumableImage.disableInteractive();
        return this;
    }

    setInteractive(): this {
        this.setupInteractivity();
        return this;
    }

    private onPointerDown = (pointer: Phaser.Input.Pointer): void => {
        if (this.obliterated || !this.currentlyActivatable) return;
        console.log('PhysicalConsumable: onPointerDown');

        // Store the start position for dragging
        this.dragStartPosition = { x: this.x, y: this.y };

        // Start dragging
        this.isDragging = true;
        this.transientUiState.setDraggedConsumable(this);

        // Notify input handler that this consumable drag has started (pass the object and pointer)
        this.scene.events.emit('consumabledragstart', this, pointer);

        // Emit events
        this.emit('consumable_dragstart', this, pointer);
        this.parentContainer?.emit('pointerdown', this);
    }
    
    private onPointerUp = (pointer: Phaser.Input.Pointer): void => {
        if (this.obliterated) return;
        
        console.log('PhysicalConsumable: onPointerUp');
        
        // Check if we were dragging
        if (this.isDragging) {
            this.isDragging = false;
            this.emit('consumable_dragend', this, pointer);
        } else {
            // Handle as a click if we weren't dragging
            this.handleClick(pointer);
        }
        
        // Clear the dragged consumable in TransientUiState
        this.transientUiState.setDraggedConsumable(null);
    }
    
    private onPointerMove = (pointer: Phaser.Input.Pointer): void => {
        if (this.obliterated) return;
        
        // If we're dragging, emit the drag event
        if (this.isDragging) {
            this.emit('consumable_drag', this, pointer);
        }
    }

    private handleClick(pointer: Phaser.Input.Pointer): void {
        // Check if we have a hovered card as a potential target
        const hovered = this.transientUiState.hoveredCard;
        
        // If we have a hovered card (potential target) and it's a character, use it as target
        if (hovered && hovered.data && hovered.data.typeTag === "BaseCharacter" && 'isDead' in hovered.data) {
            const targetCharacter = hovered.data as BaseCharacter;
            console.log(`Selected target for consumable: ${targetCharacter.name}`);
            this.target = targetCharacter;
        }
        
        // If we have a target set, try using the consumable
        if (this.currentlyActivatable && this.target) {
            const used = this.abstractConsumable.onUse(this.target);
            if (used) {
                this.usesLeft = Math.max(0, (this.usesLeft || 0) - 1);
                this.updateUsesDisplay();
                
                if (this.usesLeft <= 0) {
                    // Handle depleted consumable
                    this.consumableImage.setAlpha(0.5);
                    this.currentlyActivatable = false;
                }
                
                // Clear target after use
                this.target = undefined;
            }
        }
    }

    private onPointerOver = (): void => {
        if (this.obliterated) return;

        // Scale up both the main image and shadow
        this.scene.tweens.add({
            targets: [this.consumableImage, this.shadowImage],
            displayWidth: this.baseSize * 1.1,
            displayHeight: this.baseSize * 1.1,
            duration: 200,
            ease: 'Power2'
        });
        
        this.parentContainer?.emit('pointerover');
    }

    private onPointerOut = (): void => {
        if (this.obliterated) return;

        // Scale back both the main image and shadow
        this.scene.tweens.add({
            targets: [this.consumableImage, this.shadowImage],
            displayWidth: this.baseSize,
            displayHeight: this.baseSize,
            duration: 200,
            ease: 'Power2'
        });
        
        this.parentContainer?.emit('pointerout');
    }

    highlight(): void {
        this._isHighlighted = true;
        this.consumableImage.setTint(0x00ff00);
    }

    unhighlight(): void {
        this._isHighlighted = false;
        this.consumableImage.clearTint();
    }

    obliterate(): void {
        if (this.obliterated) return;
        this.obliterated = true;
        this.destroy();
    }

    // Add lifecycle logging for debugging
    destroy(): void {
        console.log(`Destroying PhysicalConsumable for: ${this.abstractConsumable.getDisplayName()}`);
        this.selectOverlay?.destroy();
        this.tooltipAttachment?.destroy(); // Destroy tooltip attachment
        super.destroy();
    }

    setVisible(isVisible: boolean): this {
        return super.setVisible(isVisible);
    }

    setAlpha(alpha: number): this {
        return super.setAlpha(alpha);
    }

    setTarget(target: BaseCharacter): void {
        this.target = target;
    }

    getOriginalPosition(): { x: number, y: number } | null {
        return this.dragStartPosition;
    }

    // Update the uses display
    updateUsesDisplay(): void {
        // Remove existing uses text if it exists
        this.getAll().forEach(child => {
            if ((child as any).type === 'Text' && (child as any).__usesText) {
                child.destroy();
            }
        });

        // Add uses text if needed
        if (this.usesLeft && this.usesLeft > 0) {
            const usesText = this.scene.add.text(
                -this.baseSize / 2 + 10, 
                -this.baseSize / 2 + 10, 
                `${this.usesLeft}`,
                {
                    fontSize: '19px',
                    color: '#ffffff',
                    fontFamily: 'Arial',
                    align: 'left',
                    stroke: '#000000',
                    strokeThickness: 3,
                    fixedWidth: 30,
                    fixedHeight: 25
                }
            );
            (usesText as any).__usesText = true;
            usesText.setOrigin(0, 0);
            this.add(usesText);
            usesText.setDepth(2);
        }
        
        // Update tooltip
        const tooltipText = this.generateTooltip(this.abstractConsumable);
        this.tooltipAttachment.updateText(tooltipText);
    }
} 