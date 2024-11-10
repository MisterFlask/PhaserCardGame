import Phaser from 'phaser';
import { AbstractRelic } from '../relics/AbstractRelic';
import { TextBox } from './TextBox';
import { UIContext } from './UIContextManager';

export class PhysicalRelic extends Phaser.GameObjects.Container {
    contextRelevant?: UIContext;
    relicImage: Phaser.GameObjects.Image;
    tooltipBox: TextBox;
    priceBox?: TextBox;
    abstractRelic: AbstractRelic;
    private _isHighlighted: boolean = false;
    private obliterated: boolean = false;
    private baseSize: number;

    constructor({
        scene,
        x = 0,
        y = 0,
        abstractRelic,
        price,
    }: {
        scene: Phaser.Scene;
        x?: number;
        y?: number;
        abstractRelic: AbstractRelic;
        price?: number;
    }) {
        super(scene, x, y);

        console.log(`Initializing PhysicalRelic for: ${abstractRelic.getName()} at (${x}, ${y})`);

        this.abstractRelic = abstractRelic;
        
        // Create relic image using portraitName from AbstractRelic
        if (!scene.textures.exists(abstractRelic.portraitName)) {
            console.error(`Texture not found for key: ${abstractRelic.portraitName}`);
        }
        this.relicImage = scene.add.image(0, 0, abstractRelic.portraitName ?? "placeholder");
        const baseSize = 64;
        this.relicImage.setDisplaySize(baseSize, baseSize);
        this.baseSize = baseSize;
        this.add(this.relicImage);

        // Create tooltip without specifying y position yet
        this.tooltipBox = new TextBox({
            scene,
            text: `${abstractRelic.getName()}\n${abstractRelic.getDescription()}`,
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

        this.setupInteractivity();
    }

    setupInteractivity(): void {
        // Set the container as interactive with a specific hit area rectangle
        this.setInteractive(new Phaser.Geom.Rectangle(0, 0, this.baseSize, this.baseSize), 
            Phaser.Geom.Rectangle.Contains)
            .on('pointerover', this.onPointerOver, this)
            .on('pointerout', this.onPointerOut, this)
            .on('pointerdown', this.onPointerDown, this);
    }

    private onPointerOver = (): void => {
        if (this.obliterated) return;
        console.log('PhysicalRelic: onPointerOver');

        // Show tooltip first so its dimensions are calculated
        this.tooltipBox.setVisible(true);

        // Determine tooltip position based on screen position
        const globalY = this.y + (this.parentContainer?.y ?? 0);
        const screenHeight = this.scene.scale.height;
        const isCloserToTop = globalY < screenHeight / 2;

        // Get the actual tooltip height after text is set and rendered
        const tooltipBounds = this.tooltipBox.getBounds();
        const tooltipHeight = tooltipBounds.height;

        // Position tooltip above or below the relic
        this.tooltipBox.y = isCloserToTop ? 
            (this.baseSize + 10) + 100 :  // Below the relic
            -(tooltipHeight + 10);  // Above the relic, accounting for actual tooltip height

        // Scale up using displaySize instead of scale
        this.scene.tweens.add({
            targets: this.relicImage,
            displayWidth: this.baseSize * 1.1,
            displayHeight: this.baseSize * 1.1,
            duration: 200,
            ease: 'Power2'
        });
        
        // Emit the event to parent
        this.parentContainer?.emit('pointerover');
    }

    private onPointerOut = (): void => {
        if (this.obliterated) return;

        // Scale back using displaySize
        this.scene.tweens.add({
            targets: this.relicImage,
            displayWidth: this.baseSize,
            displayHeight: this.baseSize,
            duration: 200,
            ease: 'Power2'
        });

        // Hide tooltip
        this.tooltipBox.setVisible(false);
        
        // Emit the event to parent
        this.parentContainer?.emit('pointerout');
    }

    private onPointerDown = (): void => {
        if (this.obliterated) return;
        this.abstractRelic.onRelicClicked();
        
        // Emit the event to parent
        this.parentContainer?.emit('pointerdown');
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
        console.log(`Destroying PhysicalRelic for: ${this.abstractRelic.getName()}`);
        super.destroy();
    }

    setVisible(isVisible: boolean): this {
        return super.setVisible(isVisible);
    }

    setAlpha(alpha: number): this {
        return super.setAlpha(alpha);
    }
}