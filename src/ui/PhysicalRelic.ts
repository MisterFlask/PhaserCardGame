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

    constructor({
        scene,
        x = 0,
        y = 0,
        relicImage,
        abstractRelic,
        price,
    }: {
        scene: Phaser.Scene;
        x?: number;
        y?: number;
        relicImage: Phaser.GameObjects.Image;
        abstractRelic: AbstractRelic;
        price?: number;
    }) {
        super(scene, x, y);
        scene.add.existing(this);

        this.abstractRelic = abstractRelic;
        this.relicImage = relicImage;
        this.add(this.relicImage);

        // Create tooltip
        this.tooltipBox = new TextBox({
            scene,
            text: `${abstractRelic.getName()}\n${abstractRelic.getDescription()}`,
            width: 200,
            expandDirection: 'up'
        });
        this.tooltipBox.setVisible(false);
        this.add(this.tooltipBox);

        // Optional price display
        if (price !== undefined) {
            this.priceBox = new TextBox({
                scene,
                text: `${price}g`,
                width: 50,
                height: 25,
                y: this.relicImage.height / 2 + 15
            });
            this.add(this.priceBox);
        }

        this.setupInteractivity();
    }

    setupInteractivity(): void {
        this.relicImage.setInteractive()
            .on('pointerover', this.onPointerOver, this)
            .on('pointerout', this.onPointerOut, this)
            .on('pointerdown', this.onPointerDown, this);
    }

    private onPointerOver = (): void => {
        if (this.obliterated) return;

        // Scale up slightly
        this.scene.tweens.add({
            targets: this.relicImage,
            scale: 1.1,
            duration: 200,
            ease: 'Power2'
        });

        // Show tooltip
        this.tooltipBox.setVisible(true);
    }

    private onPointerOut = (): void => {
        if (this.obliterated) return;

        // Scale back to normal
        this.scene.tweens.add({
            targets: this.relicImage,
            scale: 1,
            duration: 200,
            ease: 'Power2'
        });

        // Hide tooltip
        this.tooltipBox.setVisible(false);
    }

    private onPointerDown = (): void => {
        if (this.obliterated) return;
        this.abstractRelic.onRelicClicked();
    }

    setInteractive(isInteractive: boolean): this {
        this.relicImage.setInteractive(isInteractive);
        return this;
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
}