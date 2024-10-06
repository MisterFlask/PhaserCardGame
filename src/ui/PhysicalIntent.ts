import { Scene } from "phaser";
import { AbstractIntent } from "../gamecharacters/AbstractIntent";
import { BaseCharacter } from "../gamecharacters/BaseCharacter";
import { JsonRepresentable } from "../interfaces/JsonRepresentable";
import { IntentEmitter } from "../utils/intentemitter";

export class PhysicalIntent implements JsonRepresentable {
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
        this.image.setDisplaySize(PhysicalIntent.WIDTH, PhysicalIntent.HEIGHT);
        
        this.text = this.scene.add.text(0, PhysicalIntent.HEIGHT / 2, intent.displayText(), { fontSize: '30px', color: '#ffffff' });
        this.text.setOrigin(0.5);
        
        this.container.add([this.image, this.text]);
        
        // Set interactive for the container to detect pointer events
        this.container.setSize(PhysicalIntent.WIDTH, PhysicalIntent.HEIGHT)
            .setInteractive({ useHandCursor: true }) // Ensured cursor change
            .on('pointerover', this.onPointerOver, this)
            .on('pointerout', this.onPointerOut, this);
        
        this.update();
        
    }

    private onPointerOver(): void {
        console.log(`Pointer over intent: ${this.intent.displayText}`);
        IntentEmitter.getInstance().emitIntentHover(this);
    }

    private onPointerOut(): void {
        console.log(`Pointer out intent: ${this.intent.displayText}`);
        IntentEmitter.getInstance().emitIntentHoverEnd(this);
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
        this.text.setText(this.intent.displayText());
    }

    updateIntent(newIntent: AbstractIntent): void {
        this.intent = newIntent;
        this.image.setTexture(this.intent.imageName);
        this.text.setText(this.intent.displayText());
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

    createJsonRepresentation(): string {
        return JSON.stringify({
            className: this.constructor.name,
            intent: JSON.parse(this.intent.createJsonRepresentation()),
            // Add any other relevant properties
        }, null, 2);
    }

    getTargetedCharacter(): BaseCharacter | undefined {
        return this.intent.target;
    }
}