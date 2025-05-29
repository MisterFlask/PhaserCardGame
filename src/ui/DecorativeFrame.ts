import { Scene } from 'phaser';

export class DecorativeFrame extends Phaser.GameObjects.Container {
    private background: Phaser.GameObjects.Rectangle;
    private border: Phaser.GameObjects.Rectangle;
    private corners: Phaser.GameObjects.Image[] = [];

    constructor(scene: Scene, width: number, height: number) {
        super(scene, 0, 0);

        // Add semi-transparent background
        this.background = scene.add.rectangle(0, 0, width, height, 0x000000, 0.85);
        this.add(this.background);

        // Add border
        this.border = scene.add.rectangle(0, 0, width, height);
        this.border.setStrokeStyle(2, 0xc0a875);
        this.add(this.border);

        // Add decorative corners
        const cornerPositions = [
            { x: -width/2, y: -height/2, rotation: 0 },
            { x: width/2, y: -height/2, rotation: Math.PI/2 },
            { x: width/2, y: height/2, rotation: Math.PI },
            { x: -width/2, y: height/2, rotation: -Math.PI/2 }
        ];

        // Add inner glow
        const innerGlow = scene.add.rectangle(0, 0, width - 4, height - 4, 0xc0a875, 0.1);
        this.add(innerGlow);
    }

    public animateIn(): void {
        this.scene.tweens.add({
            targets: this,
            scaleX: { from: 0.9, to: 1 },
            scaleY: { from: 0.9, to: 1 },
            alpha: { from: 0, to: 1 },
            duration: 300,
            ease: 'Back.easeOut'
        });

        this.corners.forEach((corner, index) => {
            this.scene.tweens.add({
                targets: corner,
                scale: { from: 0, to: 0.5 },
                duration: 400,
                delay: 100 + index * 50,
                ease: 'Back.easeOut'
            });
        });
    }
} 