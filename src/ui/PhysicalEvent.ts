import { Scene } from 'phaser';
import { AbstractChoice, AbstractEvent } from '../events/AbstractEvent';
import { TextBoxButton } from './Button';
import { DepthManager } from './DepthManager';
import { TextBox } from './TextBox';

export class PhysicalChoice {
    public button: TextBoxButton;

    constructor(
        scene: Scene,
        choice: AbstractChoice,
        x: number,
        y: number,
        width: number,
        onChoiceSelected: () => void
    ) {
        this.button = new TextBoxButton({
            scene,
            x,
            y,
            width,
            height: 50,
            text: choice.text,
            fillColor: 0x444444,
        });

        this.button.setButtonEnabled(choice.canChoose());
        if (choice.canChoose()) {
            this.button.onClick(() => {
                choice.effect();
                onChoiceSelected();
            });
        }
    }

    public destroy(): void {
        this.button.destroy();
    }
}

export class PhysicalEvent extends Phaser.GameObjects.Container {
    private background: Phaser.GameObjects.Rectangle;
    private portrait: Phaser.GameObjects.Image;
    private nameText: TextBox;
    private descriptionText: TextBox;
    private choices: PhysicalChoice[] = [];

    constructor(
        scene: Scene,
        event: AbstractEvent,
        onEventComplete: (nextEvent: AbstractEvent | null) => void
    ) {
        super(scene, 0, 0);
        scene.add.existing(this);
        this.setDepth(DepthManager.getInstance().MAP_OVERLAY + 30);

        const { width, height } = scene.scale;

        // Create semi-transparent background
        this.background = scene.add.rectangle(0, 0, width, height, 0x000000, 0.8);
        this.add(this.background);

        // Add portrait on the left side
        const portraitWidth = width * 0.4;
        const portraitHeight = height * 0.6;
        this.portrait = scene.add.image(
            width * 0.25,
            height * 0.5,
            event.portraitName
        )
            .setDisplaySize(portraitWidth, portraitHeight);
        this.add(this.portrait);

        // Add name text in upper-right quadrant
        this.nameText = new TextBox({
            scene,
            x: width * 0.7,
            y: height * 0.2,
            text: event.name,
            style: { fontSize: '32px', color: '#ffffff' }
        });
        this.add(this.nameText);

        // Add description text below name
        this.descriptionText = new TextBox({
            scene,
            x: width * 0.7,
            y: height * 0.3,
            width: width * 0.4,
            text: event.description,
            style: { fontSize: '24px', color: '#ffffff', wordWrap: { width: width * 0.4 } }
        });
        this.add(this.descriptionText);

        // Add choice buttons
        const buttonStartY = height * 0.5;
        const buttonSpacing = 60;
        event.choices.forEach((choice, index) => {
            const physicalChoice = new PhysicalChoice(
                scene,
                choice,
                width * 0.7,
                buttonStartY + index * buttonSpacing,
                width * 0.4,
                () => {
                    onEventComplete(choice.nextEvent);
                    this.destroy();
                }
            );
            this.choices.push(physicalChoice);
            this.add(physicalChoice.button);
        });
    }

    public destroy(): void {
        this.choices.forEach(choice => choice.destroy());
        super.destroy();
    }
} 