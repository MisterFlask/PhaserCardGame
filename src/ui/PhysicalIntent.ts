import { Scene } from "phaser";
import { AbstractIntent } from "../gamecharacters/AbstractIntent";
import { BaseCharacter } from "../gamecharacters/BaseCharacter";
import { JsonRepresentable } from "../interfaces/JsonRepresentable";
import { IntentEmitter } from "../utils/IntentEmitter";
import { TransientUiState } from './TransientUiState';

export class PhysicalIntent implements JsonRepresentable {
    static readonly WIDTH: number = 40;
    static readonly HEIGHT: number = 40;

    private scene: Scene;
    public intent: AbstractIntent;
    private container: Phaser.GameObjects.Container;
    private image: Phaser.GameObjects.Image;
    private alwaysDisplayedIntentText: Phaser.GameObjects.Text;
    private transientUiState = TransientUiState.getInstance();
    private tooltipText: Phaser.GameObjects.Text;

    constructor(scene: Scene, intent: AbstractIntent, x: number, y: number) {
        this.scene = scene;
        this.intent = intent;
        
        this.container = this.scene.add.container(x, y);
        
        this.image = this.scene.add.image(0, 0, intent.imageName);
        this.image.setDisplaySize(PhysicalIntent.WIDTH, PhysicalIntent.HEIGHT);
        this.image.setTint(intent.iconTint);
        
        this.alwaysDisplayedIntentText = this.scene.add.text(0, PhysicalIntent.HEIGHT / 2, 
            intent.displayText(), 
            { fontSize: '30px', color: '#ffffff' }
        );
        this.alwaysDisplayedIntentText.setOrigin(0.5);
        
        this.tooltipText = this.scene.add.text(0, -PhysicalIntent.HEIGHT, '', 
            { 
                fontSize: '16px', 
                color: '#ffffff',
                backgroundColor: '#000000',
                padding: { x: 5, y: 5 },
                wordWrap: { width: 200 }
            }
        );
        this.tooltipText.setOrigin(0.5, 1);
        this.tooltipText.setVisible(false);
        
        this.container.add([this.image, this.alwaysDisplayedIntentText, this.tooltipText]);
        
        // Set interactive for the container to detect pointer events
        this.container.setSize(PhysicalIntent.WIDTH, PhysicalIntent.HEIGHT)
            .setInteractive({ useHandCursor: true })
            .on('pointerover', this.onPointerOver, this)
            .on('pointerout', this.onPointerOut, this);
        
        this.update();
    }

    private onPointerOver(): void {
        console.log(`Pointer over intent: ${this.intent.displayText()}`);
        this.transientUiState.setHoveredIntent(this);
        IntentEmitter.getInstance().emitIntentHover(this);
        
        // Show and update tooltip
        this.tooltipText.setText(this.intent.tooltipText());
        this.tooltipText.setVisible(true);
    }

    private onPointerOut(): void {
        console.log(`Pointer out intent: ${this.intent.displayText()}`);
        if (this.transientUiState.hoveredIntent === this) {
            this.transientUiState.setHoveredIntent(undefined);
        }
        IntentEmitter.getInstance().emitIntentHoverEnd(this);
        
        // Hide tooltip
        this.tooltipText.setVisible(false);
    }

    update(): void {
        this.image.setTexture(this.intent.imageName);
        this.alwaysDisplayedIntentText.setText(this.intent.displayText());
        // Update tooltip text if it's visible
        if (this.tooltipText.visible) {
            this.tooltipText.setText(this.intent.tooltipText());
        }
    }

    updateIntent(newIntent: AbstractIntent): void {
        this.intent = newIntent;
        this.image.setTexture(this.intent.imageName);
        this.alwaysDisplayedIntentText.setText(this.intent.displayText());
        // Update tooltip text if it's visible
        if (this.tooltipText.visible) {
            this.tooltipText.setText(this.intent.tooltipText());
        }
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
