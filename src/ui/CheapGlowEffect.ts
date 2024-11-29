export class CheapGlowEffect extends Phaser.GameObjects.Image {
    private static readonly STARTING_ALPHA: number = 0.3;
    private static readonly ENDING_ALPHA: number = 0.6;

    private static readonly STARTING_SCALE: number = 0.7;
    private static readonly ENDING_SCALE: number = 0.8;

    private pulseTween?: Phaser.Tweens.Tween;
    private shouldBeVisible: boolean = false;
    private shouldPulse: boolean = false;

    constructor(scene: Phaser.Scene, x: number = 0, y: number = 0) {
        super(scene, x, y, 'cheap_glow_effect');
        
        this.setBlendMode(Phaser.BlendModes.ADD);
        this.setVisible(false);
        
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
            alpha: { 
                from: CheapGlowEffect.STARTING_ALPHA, 
                to: CheapGlowEffect.ENDING_ALPHA 
            },
            scale: { 
                from: CheapGlowEffect.STARTING_SCALE, 
                to: CheapGlowEffect.ENDING_SCALE 
            },
            duration: 1000,
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
        this.setScale(CheapGlowEffect.STARTING_SCALE);
        this.setAlpha(CheapGlowEffect.STARTING_ALPHA);
    }

    destroy(): void {
        this.stopPulsing();
        super.destroy();
    }
}


