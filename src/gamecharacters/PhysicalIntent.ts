import { AbstractIntent } from "./AbstractIntent";
import { Scene } from "phaser";

export class PhysicalIntent {
    static readonly WIDTH: number = 40;
    static readonly HEIGHT: number = 40;

    private scene: Scene;
    private intent: AbstractIntent;
    private container: Phaser.GameObjects.Container;
    private image: Phaser.GameObjects.Image;
    private text: Phaser.GameObjects.Text;

    constructor(scene: Scene, intent: AbstractIntent, x: number, y: number) {
        this.scene = scene;
        this.intent = intent;
        
        this.container = this.scene.add.container(x, y);
        
        this.image = this.scene.add.image(0, 0, intent.imageName);
        this.image.setDisplaySize(PhysicalIntent.WIDTH, PhysicalIntent.HEIGHT);
        
        this.text = this.scene.add.text(0, PhysicalIntent.HEIGHT / 2 + 5, intent.displayText, { fontSize: '12px', color: '#ffffff' });
        this.text.setOrigin(0.5);
        
        this.container.add([this.image, this.text]);
        
        this.setupTooltip();
        this.update();
    }

    private setupTooltip(): void {
        this.container.setInteractive({ useHandCursor: true })
            .on('pointerover', () => {
                // Show tooltip
                // You might want to implement a proper tooltip system
                console.log(this.intent.tooltipText);
            })
            .on('pointerout', () => {
                // Hide tooltip
            });
    }

    update(): void {
        this.image.setTexture(this.intent.imageName);
        this.text.setText(this.intent.displayText);
    }

    updateIntent(newIntent: AbstractIntent): void {
        this.intent = newIntent;
        this.image.setTexture(this.intent.imageName);
        this.text.setText(this.intent.displayText);
    }

    setPosition(x: number, y: number): void {
        this.container.setPosition(x, y);
    }

    destroy(): void {
        this.container.destroy();
    }

    getContainer(): Phaser.GameObjects.Container {
        return this.container;
    }
}