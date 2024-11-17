export class CheapGlowEffect extends Phaser.GameObjects.Image {
    private pulseTween?: Phaser.Tweens.Tween;
    private shouldBeVisible: boolean = false;
    private shouldPulse: boolean = false;

    constructor(scene: Phaser.Scene, x: number = 0, y: number = 0) {
        super(scene, x, y, 'cheap_glow_effect');
        
        this.setBlendMode(Phaser.BlendModes.ADD);
        this.setVisible(false);
        this.setAlpha(0.8);
        
        // Required for Image subclasses
        scene.add.existing(this);
    }

    /**
     * Turn on the glow effect with optional pulsing
     * @param pulse Whether to add a pulsing animation
     */
    turnOn(pulse: boolean = true): void {
        this.shouldBeVisible = true;
        this.shouldPulse = pulse;
    }

    /**
     * Turn off the glow effect and stop any pulsing
     */
    turnOff(): void {
        this.shouldBeVisible = false;
        this.shouldPulse = false;
    }

    /**
     * Update the visual state based on shouldBeVisible and shouldPulse
     */
    update(): void {
        if (this.shouldBeVisible !== this.visible) {
            this.setVisible(this.shouldBeVisible);
        }

        if (this.shouldBeVisible && this.shouldPulse && !this.pulseTween) {
            this.startPulsing();
        } else if ((!this.shouldBeVisible || !this.shouldPulse) && this.pulseTween) {
            this.stopPulsing();
        }
    }

    /**
     * Start a subtle pulsing animation for the glow effect
     */
    private startPulsing(): void {
        this.stopPulsing();

        this.pulseTween = this.scene.tweens.add({
            targets: this,
            alpha: { from: 0.7, to: 0.9 },
            scale: { from: 1, to: 1.3 },
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    /**
     * Stop the pulsing animation
     */
    private stopPulsing(): void {
        if (this.pulseTween) {
            this.pulseTween.stop();
            this.pulseTween = undefined;
        }
        this.setAlpha(0.8);
        this.setScale(1);
    }

    destroy(): void {
        this.stopPulsing();
        super.destroy();
    }
}


