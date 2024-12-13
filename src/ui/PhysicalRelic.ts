import Phaser from 'phaser';
import { AbstractRelic } from '../relics/AbstractRelic';
import { ShadowedImage } from './ShadowedImage';
import { TextBox } from './TextBox';
import { UIContext } from './UIContextManager';

export class PhysicalRelic extends Phaser.GameObjects.Container {
    contextRelevant?: UIContext;
    relicImage: Phaser.GameObjects.Image;
    shadowImage: Phaser.GameObjects.Image;
    tooltipBox: TextBox;
    priceBox?: TextBox;
    abstractRelic: AbstractRelic;
    private _isHighlighted: boolean = false;
    private obliterated: boolean = false;
    private baseSize: number;
    stacksBox?: Phaser.GameObjects.Text;

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

        const textureName = abstractRelic.imageName ?? "placeholder";
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

        // Create tooltip without specifying y position yet
        this.tooltipBox = new TextBox({
            scene,
            text: `${abstractRelic.getDisplayName()}\n${abstractRelic.getDescription()}`,
            width: 200
        });
        this.tooltipBox.setVisible(false);
        this.add(this.tooltipBox);

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
            this.stacksBox = scene.add.text(-this.baseSize / 2 + 10, -this.baseSize / 2 + 10, 
                `${abstractRelic.stacks}`, 
                {
                    fontSize: '20px',
                    padding: { x: 5, y: 5 },
                    fixedWidth: 30,
                    fixedHeight: 25,
                    align: 'center'
                }
            );
            this.add(this.stacksBox);
            this.stacksBox.setDepth(1);
        }

        this.setupInteractivity();
    }

    setupInteractivity(): void {
        // Remove the container's interactivity and set it on the shadowed image's main image instead
        this.relicImage.setInteractive()
            .on('pointerover', this.onPointerOver, this)
            .on('pointerout', this.onPointerOut, this)
            .on('pointerdown', this.onPointerDown, this);
    }

    private onPointerOver = (): void => {
        if (this.obliterated) return;
        console.log('PhysicalRelic: onPointerOver');

        this.tooltipBox.setVisible(true);

        const globalY = this.y + (this.parentContainer?.y ?? 0);
        const screenHeight = this.scene.scale.height;
        const isCloserToTop = globalY < screenHeight / 2;

        const tooltipBounds = this.tooltipBox.getBounds();
        const tooltipHeight = tooltipBounds.height;

        this.tooltipBox.y = isCloserToTop ? 
            (this.baseSize + 10) + 100 :
            -(tooltipHeight + 10);

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

        this.tooltipBox.setVisible(false);
        
        this.parentContainer?.emit('pointerout');
    }

    private onPointerDown = (): void => {
        if (this.obliterated) return;
        console.log('PhysicalRelic: onPointerDown');
        
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
    }
}