import { Scene } from "phaser";
import { AbstractIntent } from "../gamecharacters/AbstractIntent";
import { BaseCharacter } from "../gamecharacters/BaseCharacter";
import { JsonRepresentable } from "../interfaces/JsonRepresentable";
import { IntentEmitter } from "../utils/IntentEmitter";
import { ShadowedImage } from "./ShadowedImage";
import { TooltipAttachment } from "./TooltipAttachment";
import { TransientUiState } from './TransientUiState';

export class PhysicalIntent implements JsonRepresentable {
    static readonly WIDTH: number = 40;
    static readonly HEIGHT: number = 40;

    private scene: Scene;
    public intent: AbstractIntent;
    private container: Phaser.GameObjects.Container;
    private image: ShadowedImage;
    private alwaysDisplayedIntentText: Phaser.GameObjects.Text;
    private transientUiState = TransientUiState.getInstance();
    private tooltipAttachment: TooltipAttachment;

    constructor(scene: Scene, intent: AbstractIntent, x: number, y: number) {
        this.scene = scene;
        this.intent = intent;
        
        this.container = this.scene.add.container(x, y);
        
        this.image = new ShadowedImage({
            scene: this.scene,
            texture: intent.getImageNameOrPlaceholderIfNoneExists(),
            displaySize: PhysicalIntent.WIDTH,
            tint: this.intent.generateSeededRandomColor() ?? intent.iconTint,
            shadowOffset: 2
        });
        
        this.alwaysDisplayedIntentText = this.scene.add.text(0, PhysicalIntent.HEIGHT / 2, 
            intent.displayText(), 
            { fontSize: '30px', color: '#ffffff' }
        );
        this.alwaysDisplayedIntentText.setOrigin(0.5);
        
        this.container.add([this.image, this.alwaysDisplayedIntentText]);
        
        // Set interactive for the container to detect pointer events
        this.container.setSize(PhysicalIntent.WIDTH, PhysicalIntent.HEIGHT)
            .setInteractive({ useHandCursor: true })
            .on('pointerover', this.onPointerOver, this)
            .on('pointerout', this.onPointerOut, this);

        this.tooltipAttachment = new TooltipAttachment({
            scene: this.scene,
            container: this.container,
            tooltipText: this.intent.tooltipText(),
        });
        
        this.update();
    }

    private onPointerOver(): void {
        console.log(`Pointer over intent: ${this.intent.displayText()}`);
        this.transientUiState.setHoveredIntent(this);
        IntentEmitter.getInstance().emitIntentHover(this);
    }

    private onPointerOut(): void {
        console.log(`Pointer out intent: ${this.intent.displayText()}`);
        if (this.transientUiState.hoveredIntent === this) {
            this.transientUiState.setHoveredIntent(undefined);
        }
        IntentEmitter.getInstance().emitIntentHoverEnd(this);
    }

    update(): void {
        this.image.mainImage.setTexture(this.intent.getImageNameOrPlaceholderIfNoneExists());
        this.image.shadowImage.setTexture(this.intent.getImageNameOrPlaceholderIfNoneExists());
        this.alwaysDisplayedIntentText.setText(this.intent.displayText());
        this.tooltipAttachment.updateText(this.intent.tooltipText());
    }

    updateIntent(newIntent: AbstractIntent): void {
        this.intent = newIntent;
        this.image.mainImage.setTexture(this.intent.getImageNameOrPlaceholderIfNoneExists());
        this.image.shadowImage.setTexture(this.intent.getImageNameOrPlaceholderIfNoneExists());
        this.alwaysDisplayedIntentText.setText(this.intent.displayText());
        this.tooltipAttachment.updateText(this.intent.tooltipText());
    }

    setPosition(x: number, y: number): void {
        this.container.setPosition(x, y);
    }

    destroy(): void {
        this.tooltipAttachment.destroy();
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
