import Phaser from 'phaser';
import { AbstractRelic } from '../relics/AbstractRelic';
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
        
        const baseSize = 64;
        this.baseSize = baseSize;

        // Create shadow image first (so it appears behind)
        this.shadowImage = scene.add.image(2, 2, abstractRelic.portraitName ?? "placeholder");
        this.shadowImage.setDisplaySize(baseSize, baseSize);
        this.shadowImage.setTint(0x000000);
        this.add(this.shadowImage);

        // Create main relic image
        this.relicImage = scene.add.image(0, 0, abstractRelic.portraitName ?? "placeholder");
        this.relicImage.setDisplaySize(baseSize, baseSize);
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