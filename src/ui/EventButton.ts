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

        // Add a subtle glow effect
        const glow = this.scene.add.rectangle(
            0,
            0,
            params.width ?? 200,
            params.height ?? 50,
            0xc0a875,
            0.2
        );
        this.add(glow);
        glow.setDepth(-1);

        // Customize hover behavior
        this.setZoomScales(1.0, 1.02);
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