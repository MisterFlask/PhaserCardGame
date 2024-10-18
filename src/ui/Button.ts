import { TextBox } from './TextBox';

export class TextBoxButton extends TextBox {
    private isEnabled: boolean = true;
    private normalColor: number;
    private hoverColor: number;
    private disabledColor: number;
    private clickCallback: (() => void) | null = null;
    private normalScale: number = 1.0;
    private hoverScale: number = 1.1;

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
        if (this.initialized) {
            return this;
        }


        this.setInteractive(this.background, Phaser.Geom.Rectangle.Contains)
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
            this.zoomIn();
        }
    }

    private onPointerOut(): void {
        if (this.isEnabled) {
            this.setFillColor(this.normalColor);
            this.zoomOut();
        }
    }

    private onPointerDown(): void {
        if (this.isEnabled && this.clickCallback) {
            this.clickCallback();
        }
    }

    private zoomIn(): void {
        this.scene.tweens.add({
            targets: this,
            scale: this.hoverScale,
            duration: 200,
            ease: 'Power2'
        });
    }

    private zoomOut(): void {
        this.scene.tweens.add({
            targets: this,
            scale: this.normalScale,
            duration: 200,
            ease: 'Power2'
        });
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

    public setZoomScales(normalScale: number, hoverScale: number): this {
        this.normalScale = normalScale;
        this.hoverScale = hoverScale;
        this.setScale(this.normalScale);
        return this;
    }
}
