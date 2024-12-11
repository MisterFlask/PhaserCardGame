import Phaser from 'phaser';

export class ShadowedImage extends Phaser.GameObjects.Container {
    mainImage: Phaser.GameObjects.Image;
    shadowImage: Phaser.GameObjects.Image;

    constructor({
        scene,
        x = 0,
        y = 0,
        texture,
        displaySize,
        shadowOffset = 2,
        tint,
        shadowTint = 0x000000
    }: {
        scene: Phaser.Scene;
        x?: number;
        y?: number;
        texture: string;
        displaySize: number;
        shadowOffset?: number;
        tint?: number;
        shadowTint?: number;
    }) {
        super(scene, x, y);

        // Create shadow image first (so it appears behind)
        this.shadowImage = scene.add.image(shadowOffset, shadowOffset, texture);
        this.shadowImage.setDisplaySize(displaySize, displaySize);
        this.shadowImage.setTint(shadowTint);
        this.shadowImage.setDepth(0);
        this.add(this.shadowImage);

        // Create main image with input enabled
        this.mainImage = scene.add.image(0, 0, texture);
        this.mainImage.setDisplaySize(displaySize, displaySize);
        this.mainImage.setDepth(1);
        if (tint) {
            this.mainImage.setTint(tint);
        }
        this.add(this.mainImage);

        // Set the container's size to match the display size
        this.setSize(displaySize, displaySize);
    }

    setImageScale(scale: number): this {
        this.mainImage.setScale(scale);
        this.shadowImage.setScale(scale);
        return this;
    }

    setDisplaySize(width: number, height: number): this {
        this.mainImage.setDisplaySize(width, height);
        this.shadowImage.setDisplaySize(width, height);
        // Update container size when display size changes
        this.setSize(width, height);
        return this;
    }

    setImage(name: string): this {
        this.mainImage.setTexture(name);
        this.shadowImage.setTexture(name);
        return this;
    }

    setTint(tint: number): this {
        this.mainImage.setTint(tint);
        return this;
    }

    clearTint(): this {
        this.mainImage.clearTint();
        return this;
    }
} 