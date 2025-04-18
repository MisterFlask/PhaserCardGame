import Phaser from 'phaser';
import { AbstractRelic } from '../relics/AbstractRelic';
import { RelicTooltipGenerator } from '../text/RelicTooltipGenerator';
import ImageUtils from '../utils/ImageUtils';
import { ShadowedImage } from './ShadowedImage';
import { TextBox } from './TextBox';
import { TooltipAttachment } from './TooltipAttachment';
import { UIContext } from './UIContextManager';

export class PhysicalRelic extends Phaser.GameObjects.Container {
    contextRelevant?: UIContext;
    relicImage: Phaser.GameObjects.Image;
    shadowImage: Phaser.GameObjects.Image;
    private tooltipAttachment: TooltipAttachment;
    priceBox?: TextBox;
    abstractRelic: AbstractRelic;
    private _isHighlighted: boolean = false;
    private obliterated: boolean = false;
    private baseSize: number;
    stacksBox?: Phaser.GameObjects.Text;
    private selectOverlay!: Phaser.GameObjects.Image;
    currentlyActivatable: boolean = false;

    constructor({
        scene,
        x = 0,
        y = 0,
        abstractRelic,
        price,
        baseSize = 64
    }: {
        scene: Phaser.Scene;
        x?: number;
        y?: number;
        abstractRelic: AbstractRelic;
        price?: number;
        baseSize: number;
    }) {
        super(scene, x, y);

        if (!scene){
            console.error("No scene provided to PhysicalRelic");
            throw new Error("No scene provided to PhysicalRelic");
        }
        console.log(`Initializing PhysicalRelic for: ${abstractRelic.getDisplayName()} at (${x}, ${y})`);

        this.abstractRelic = abstractRelic;
        
        this.baseSize = baseSize;

        const textureName = abstractRelic.imageName.length > 0 ? abstractRelic.imageName : this.getAbstractIcon(abstractRelic);
        if (!scene.textures.exists(textureName)) {
            console.error(`Texture not found for key: ${textureName}`);
        }

        const shadowedImage = new ShadowedImage({
            scene,
            texture: textureName,
            displaySize: baseSize,
            shadowOffset: 2,
            tint: abstractRelic.tint
        });
        this.add(shadowedImage);
        
        this.relicImage = shadowedImage.mainImage;
        this.shadowImage = shadowedImage.shadowImage;

        // Add select overlay
        this.selectOverlay = scene.add.image(0, 0, 'square');
        this.selectOverlay.setDisplaySize(baseSize, baseSize);
        this.selectOverlay.setVisible(abstractRelic.clickable);
        this.add(this.selectOverlay);

        // Add glow animation to select overlay
        if (abstractRelic.clickable && this.currentlyActivatable) {
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

        // Create tooltip using TooltipAttachment
        const tooltipText = RelicTooltipGenerator.getInstance().generateTooltip(abstractRelic);
        this.tooltipAttachment = new TooltipAttachment({
            scene,
            container: this.relicImage,
            tooltipText: tooltipText
        });

        this.priceBox = new TextBox({
            scene,
            text: `${price ?? 0}$`,
            width: 50,
            height: 25,
            y: this.baseSize / 2 + 15
        });
        this.add(this.priceBox);

        this.priceBox.setDepth(1)

        // Add stacks box if the relic has stacks
        if (abstractRelic.stackable) {
            this.stacksBox = scene.add.text(-this.baseSize / 2 + 10, -this.baseSize / 2 + 50, 
                `${abstractRelic.stacks}`, 
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
            this.stacksBox.setOrigin(0, 1);
            this.add(this.stacksBox);
            this.stacksBox.setDepth(2);
        }

        this.setupInteractivity();
    }

    private getAbstractIcon(abstractBuff: AbstractRelic) : string{
        return ImageUtils.getDeterministicAbstractPlaceholder(abstractBuff.getDisplayName());
    }

    
    setupInteractivity(): void {
        // Remove the container's interactivity and set it on the shadowed image's main image instead
        this.relicImage.setInteractive()
            .on('pointerdown', this.onPointerDown, this);

        // Scale effects for hover
        this.relicImage
            .on('pointerover', this.onPointerOver, this)
            .on('pointerout', this.onPointerOut, this);
    }

    private onPointerOver = (): void => {
        if (this.obliterated) return;

        // Scale up both the main image and shadow
        this.scene.tweens.add({
            targets: [this.relicImage, this.shadowImage],
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
            targets: [this.relicImage, this.shadowImage],
            displayWidth: this.baseSize,
            displayHeight: this.baseSize,
            duration: 200,
            ease: 'Power2'
        });
        
        this.parentContainer?.emit('pointerout');
    }

    private onPointerDown = (): void => {
        if (this.obliterated) return;
        console.log('PhysicalRelic: onPointerDown');
        if (this.currentlyActivatable){        
            this.abstractRelic.onClicked();
        }
        
        // Emit the event to parent
        this?.emit('relic_pointerdown', this);
        this.parentContainer?.emit('pointerdown', this);
    }

    highlight(): void {
        this._isHighlighted = true;
        this.relicImage.setTint(0x00ff00);
    }

    unhighlight(): void {
        this._isHighlighted = false;
        this.relicImage.clearTint();
    }

    obliterate(): void {
        if (this.obliterated) return;
        this.obliterated = true;
        this.destroy();
    }

    // Add lifecycle logging for debugging
    destroy(): void {
        console.log(`Destroying PhysicalRelic for: ${this.abstractRelic.getDisplayName()}`);
        this.stacksBox?.destroy();
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

    // Add method to update stacks display
    updateStacksDisplay(): void {
        if (this.stacksBox && this.abstractRelic.stacks !== undefined) {
            this.stacksBox.setText(`${this.abstractRelic.stacks}`);
        }
        
        // Update tooltip text
        const tooltipText = RelicTooltipGenerator.getInstance().generateTooltip(this.abstractRelic);
        this.tooltipAttachment.updateText(tooltipText);
    }
}