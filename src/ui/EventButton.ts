import { TextBoxButton } from './Button';

export class EventButton extends TextBoxButton {
    constructor(params: {
        scene: Phaser.Scene,
        x?: number,
        y?: number,
        width?: number,
        height?: number,
        text?: string,
    }) {
        super({
            ...params,
            fillColor: 0x2a2a2a,
            style: {
                fontSize: '20px',
                color: '#e0d5c0',
                fontFamily: 'serif',
                padding: { x: 20, y: 10 }
            }
        });

        // Force origin to center for consistent positioning
        this.setOrigin(0.5);

        // Add a subtle glow effect that exactly matches the button size
        const glow = this.scene.add.rectangle(
            0,
            0,
            this.width,
            this.height,
            0xc0a875,
            0.2
        );
        glow.setOrigin(0.5);  // Match the button's origin
        this.add(glow);
        glow.setDepth(-1);

        // Ensure the background and hitbox match exactly
        if (this.background) {
            this.background.setOrigin(0.5);
            // Remove any existing interaction zone
            this.removeInteractive();
            // Set the interactive zone to exactly match the background
            this.setInteractive(this.background, Phaser.Geom.Rectangle.Contains);
        }

        // Customize hover behavior
        this.setZoomScales(1.0, 1.02);
    }

    // Override setSize to ensure hitbox updates with size changes
    public setSize(width: number, height: number): this {
        super.setSize(width, height);
        if (this.background) {
            this.removeInteractive();
            this.setInteractive(this.background, Phaser.Geom.Rectangle.Contains);
        }
        return this;
    }

    // Override setPosition to ensure consistent positioning behavior
    public setPosition(x: number, y: number): this {
        super.setPosition(x, y);
        // Ensure all children maintain their relative positions
        this.list.forEach(child => {
            if (child instanceof Phaser.GameObjects.Rectangle) {
                child.setOrigin(0.5);
            }
        });
        return this;
    }

    public setButtonEnabled(isEnabled: boolean): this {
        super.setButtonEnabled(isEnabled);
        if (!isEnabled) {
            this.setAlpha(0.5);
        } else {
            this.setAlpha(1);
        }
        return this;
    }
} 