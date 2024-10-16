import { TextBox } from './TextBox';

export class TextBoxButton extends TextBox {
    private isEnabled: boolean = true;
    private normalColor: number;
    private hoverColor: number;
    private disabledColor: number;
    private clickCallback: (() => void) | null = null;

    private initialized = false;
    constructor(params: {
        scene: Phaser.Scene,
        x?: number,
        y?: number,
        width?: number,
        height?: number,
        text?: string,
        style?: Phaser.Types.GameObjects.Text.TextStyle,
        backgroundImage?: string,
        textBoxName?: string,
        fillColor?: number,
        expandDirection?: 'up' | 'down'
    }) {
        super(params);
        this.normalColor = params.fillColor ?? 0x555555;
        this.hoverColor = 0x777777;
        this.disabledColor = 0x888888;
    }

    private addButtonBehavior(): this {
        console.log("addButtonBehavior called on ", this.textBoxName);
        // Get the dimensions of the background
        const bounds = this.background?.getBounds();
        
        let width: number;
        let height: number;

        if (bounds) {
            width = bounds.width;
            height = bounds.height;
        } else if (this.backgroundImage) {
            // Use the backgroundImage's dimensions if available
            width = this.backgroundImage.width;
            height = this.backgroundImage.height;
        } else {
            // Fallback to the text's dimensions if no background or image
            const textBounds = this.text?.getBounds();
            width = textBounds?.width ?? 100;  // Default width if all else fails
            height = textBounds?.height ?? 50; // Default height if all else fails
        }

        // Set the interactive area
        this.setInteractive(new Phaser.Geom.Rectangle(0, 0, width, height), Phaser.Geom.Rectangle.Contains)
            .on('pointerover', this.onPointerOver, this)
            .on('pointerout', this.onPointerOut, this)
            .on('pointerdown', this.onPointerDown, this);
        
        this.initialized = true;

        return this;
    }

    public setButtonEnabled(isEnabled: boolean): this {
        this.isEnabled = isEnabled;
        if (isEnabled) {
            this.setFillColor(this.normalColor);
            this.setInteractive();
        } else {
            this.setFillColor(this.disabledColor);
            this.disableInteractive();
        }
        return this;
    }

    public onClick(callback: () => void): this {
        if (!this.initialized) {
            this.addButtonBehavior();
        }
        this.clickCallback = callback;
        return this;
    }

    private onPointerOver(): void {
        if (this.isEnabled) {
            this.setFillColor(this.hoverColor);
        }
    }

    private onPointerOut(): void {
        if (this.isEnabled) {
            this.setFillColor(this.normalColor);
        }
    }

    private onPointerDown(): void {
        if (this.isEnabled && this.clickCallback) {
            this.clickCallback();
        }
    }

    public setFillColor(color: number): void {
        if (this.background) {
            this.background.setFillStyle(color);
        }
    }

    public pulseColor(color: number): void {
        if (this.background) {
            const originalColor = this.background.fillColor;
            this.scene.tweens.add({
                targets: this.background,
                fillColor: { from: originalColor, to: color },
                duration: 100,
                yoyo: true,
                repeat: 3,
                onComplete: () => {
                    this.background?.setFillStyle(originalColor);
                }
            });
        }
    }

    public pulseGreenBriefly(): void {
        this.pulseColor(0x00ff00);
    }

    public pulseRedBriefly(): void {
        this.pulseColor(0xff0000);
    }
}
