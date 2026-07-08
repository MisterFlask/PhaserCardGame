import { TextBox } from './TextBox';
import SoundUtils from '../utils/SoundUtils';
import { Fonts, Palette } from './UIStyle';

export class TextBoxButton extends TextBox {
    private isEnabled: boolean = true;
    private normalColor: number;
    private hoverColor: number;
    private disabledColor: number;
    private clickCallback: (() => void) | null = null;
    private normalScale: number = 1.0;
    private hoverScale: number = 1.1;

    private initialized = false;
    /** Only themed (default-color) buttons swap text color when disabled. */
    private isThemedDefault: boolean;

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
        strokeColor?: number,
        expandDirection?: 'up' | 'down'
    }) {
        // Themed defaults apply only when the caller doesn't specify their
        // own fillColor/style, so existing callers with explicit colors are
        // unaffected.
        super({
            ...params,
            style: params.style ?? { fontSize: '20px', fontFamily: Fonts.DISPLAY, color: Palette.WHITE },
            strokeColor: params.strokeColor ?? (params.fillColor === undefined ? Palette.BRASS : undefined),
        });
        this.normalColor = params.fillColor ?? Palette.WOOD_PANEL;
        this.hoverColor = params.fillColor !== undefined ? 0x777777 : Palette.VERDIGRIS;
        this.disabledColor = params.fillColor !== undefined ? 0x888888 : Palette.DISABLED;
        this.isThemedDefault = params.fillColor === undefined;
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
            if (this.isThemedDefault) this.setTextColor(Palette.WHITE);
            this.setInteractive();
        } else {
            this.setFillColor(this.disabledColor);
            if (this.isThemedDefault) this.setTextColor(Palette.DISABLED_TEXT);
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
            SoundUtils.play(this.scene, 'ui_click', 0.3);
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
