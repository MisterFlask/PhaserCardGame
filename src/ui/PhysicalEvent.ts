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
    private descriptionText: TextBox;
    private choices: PhysicalChoice[] = [];

    constructor(
        scene: Scene,
        event: AbstractEvent,
        onEventComplete: (nextEvent: AbstractEvent | null) => void
    ) {
        const { width, height } = scene.scale;

        // Initialize the container at the center of the screen
        super(scene, width / 2, height / 2);
        scene.add.existing(this);
        this.setDepth(DepthManager.getInstance().MAP_OVERLAY + 30);

        // Create semi-transparent background
        this.background = scene.add.rectangle(
            0, 0, // Centered within the container
            width,
            height,
            0x000000,
            0.8
        );
        this.add(this.background);

        // Add portrait filling the left half
        this.portrait = scene.add
            .image(-width / 4, 0, event.portraitName) // Offset to the left
            .setDisplaySize(width / 2, height);
        this.add(this.portrait);

        // Add description text at the upper right
        const descriptionWidth = width * 0.4; // Width for the description text
        const descriptionX = width / 4; // Slightly into the right half
        const descriptionY = -height / 2 + 50; // Near the top

        this.descriptionText = new TextBox({
            scene,
            x: descriptionX,
            y: descriptionY,
            width: descriptionWidth,
            text: event.description,
            style: {
                fontSize: '24px',
                color: '#ffffff',
                wordWrap: { width: descriptionWidth },
                align: 'left',
            },
        });
        this.add(this.descriptionText);

        // Add choice buttons at the bottom right
        const buttonStartY = height / 4; // Below the portrait
        const buttonSpacing = 60;
        event.choices.forEach((choice, index) => {
            const buttonX = width / 4; // Slightly into the right half
            const buttonY = buttonStartY + index * buttonSpacing;
            const buttonWidth = width * 0.35;
            const physicalChoice = new PhysicalChoice(
                scene,
                choice,
                buttonX,
                buttonY,
                buttonWidth,
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
        this.choices.forEach((choice) => choice.destroy());
        super.destroy();
    }
}
