export class CheapGlowEffect extends Phaser.GameObjects.Image {
    private pulseTween?: Phaser.Tweens.Tween;

    constructor(scene: Phaser.Scene, x: number = 0, y: number = 0) {
        super(scene, x, y, 'cheap_glow_effect');
        
        this.setBlendMode(Phaser.BlendModes.ADD);
        this.setVisible(false);
        this.setAlpha(0.4);
        
        // Required for Image subclasses
        scene.add.existing(this);
    }

    /**
     * Turn on the glow effect with optional pulsing
     * @param pulse Whether to add a pulsing animation
     */
    turnOn(pulse: boolean = true): void {
        this.setVisible(true);
        
        if (pulse) {
            this.startPulsing();
        }
    }

    /**
     * Turn off the glow effect and stop any pulsing
     */
    turnOff(): void {
        this.setVisible(false);
        this.stopPulsing();
    }

    /**
     * Start a subtle pulsing animation for the glow effect
     */
    private startPulsing(): void {
        this.stopPulsing();

        this.pulseTween = this.scene.tweens.add({
            targets: this,
            alpha: { from: 0.4, to: 0.7 },
            scale: { from: 1, to: 1.1 },
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
        this.setAlpha(0.4);
        this.setScale(1);
    }

    destroy(): void {
        this.stopPulsing();
        super.destroy();
    }

    
}


