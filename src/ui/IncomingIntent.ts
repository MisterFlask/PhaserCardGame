import { Scene } from "phaser";
import { AbstractIntent } from "../gamecharacters/AbstractIntent";
import { IntentEmitter } from "../utils/intentemitter";

export class IncomingIntent {
    static readonly WIDTH: number = 40;
    static readonly HEIGHT: number = 40;

    private scene: Scene;
    public intent: AbstractIntent;
    private container: Phaser.GameObjects.Container;
    private image: Phaser.GameObjects.Image;
    private text: Phaser.GameObjects.Text;

    constructor(scene: Scene, intent: AbstractIntent, x: number, y: number) {
        this.scene = scene;
        this.intent = intent;
        
        this.container = this.scene.add.container(x, y);
        
        this.image = this.scene.add.image(0, 0, intent.imageName);
        this.image.setDisplaySize(IncomingIntent.WIDTH, IncomingIntent.HEIGHT);
        
        this.text = this.scene.add.text(0, IncomingIntent.HEIGHT / 2, intent.displayText, { fontSize: '30px', color: '#ffffff' });
        this.text.setOrigin(0.5);
        
        this.container.add([this.image, this.text]);
        
        // Set interactive for the container to detect pointer events
        this.container.setSize(IncomingIntent.WIDTH, IncomingIntent.HEIGHT)
            .setInteractive({ useHandCursor: true })
            .on('pointerover', this.onPointerOver, this)
            .on('pointerout', this.onPointerOut, this);
        
        this.container.on('pointerover', () => {
            IntentEmitter.getInstance().emitIncomingIntentHover(this.intent.owner);
        });

        this.container.on('pointerout', () => {
            IntentEmitter.getInstance().emitIncomingIntentHoverEnd(this.intent.owner);
        });
        
        this.update();
    }

    private onPointerOver(): void {
        console.log(`Pointer over targeting intent: ${this.intent.displayText}`);
        // Implement tooltip or highlight if needed
    }

    private onPointerOut(): void {
        console.log(`Pointer out targeting intent: ${this.intent.displayText}`);
        // Implement tooltip hide if needed
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