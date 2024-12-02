import Phaser, { Scene } from 'phaser';
import { AbstractEvent, FinishChoice } from '../events/AbstractEvent';
import { DecorativeFrame } from './DecorativeFrame';
import { DepthManager } from './DepthManager';
import { EventButton } from './EventButton';
import { TextBox } from './TextBox';

export class EventWindow extends Phaser.GameObjects.Container {
    private frame: DecorativeFrame;
    private portrait: Phaser.GameObjects.Image;
    private descriptionText: TextBox;
    private choices: EventButton[] = [];
    private contentContainer: Phaser.GameObjects.Container;
    private backgroundBlocker: Phaser.GameObjects.Rectangle;

    constructor(
        scene: Scene,
        event: AbstractEvent,
        onEventComplete: (nextEvent: AbstractEvent | null) => void
    ) {
        super(scene, scene.scale.width / 2, scene.scale.height / 2);
        scene.add.existing(this);

        const windowWidth = scene.scale.width * 0.8;
        const windowHeight = scene.scale.height * 0.8;

        // Add a full-screen transparent blocker that intercepts clicks
        this.backgroundBlocker = scene.add.rectangle(
            0,
            0,
            scene.scale.width * 2, // Make it extra large to ensure full coverage
            scene.scale.height * 2,
            0x000000,
            0.01 // Nearly invisible but still interactive
        );
        this.backgroundBlocker.setInteractive();
        this.add(this.backgroundBlocker);

        // Create the decorative frame
        this.frame = new DecorativeFrame(scene, windowWidth, windowHeight);
        this.add(this.frame);

        // Create a container for all content to enable masking
        this.contentContainer = scene.add.container(0, 0);
        this.add(this.contentContainer);

        // Add portrait with a fancy border
        const portraitWidth = windowWidth * 0.4;
        const portraitHeight = windowHeight * 0.5;
        const portraitX = -windowWidth * 0.25;
        const portraitY = -windowHeight * 0.2;

        // Add portrait border
        const portraitBorder = scene.add.rectangle(
            portraitX,
            portraitY,
            portraitWidth + 4,
            portraitHeight + 4,
            0xc0a875
        );
        this.contentContainer.add(portraitBorder);

        this.portrait = scene.add.image(portraitX, portraitY, event.portraitName)
            .setDisplaySize(portraitWidth, portraitHeight);
        this.contentContainer.add(this.portrait);

        // Add description text with improved styling
        this.descriptionText = new TextBox({
            scene,
            x: windowWidth * 0.1,
            y: -windowHeight * 0.25,
            width: windowWidth * 0.35,
            text: event.description,
            style: {
                fontSize: '22px',
                color: '#e0d5c0',
                fontFamily: 'serif',
                wordWrap: { width: windowWidth * 0.35 },
                align: 'left',
                lineSpacing: 8
            },
        });
        this.contentContainer.add(this.descriptionText);

        // Add choice buttons with better spacing
        if (!event.choices || event.choices.length === 0) {
            console.error("Event has no choices: " + event.name);
            event.choices = [new FinishChoice()];
        }

        const buttonStartY = windowHeight * 0.1;
        const buttonSpacing = 70;
        const buttonWidth = windowWidth * 0.6;

        event.choices.forEach((choice, index) => {
            const button = new EventButton({
                scene,
                x: 0,
                y: buttonStartY + index * buttonSpacing,
                width: buttonWidth,
                height: 60,
                text: choice.text,
            });

            button.setButtonEnabled(choice.canChoose());
            if (choice.canChoose()) {
                button.onClick(() => {
                    this.animateOut(() => {
                        choice.effect();
                        onEventComplete(choice.nextEvent);
                        this.destroy();
                    });
                });
            }

            this.choices.push(button);
            this.contentContainer.add(button);
        });

        this.setDepth(DepthManager.getInstance().MAP_OVERLAY + 30);
        
        // Animate in
        this.animateIn();
    }

    private animateIn(): void {
        this.alpha = 0;
        this.scale = 0.95;
        
        this.scene.tweens.add({
            targets: this,
            alpha: 1,
            scale: 1,
            duration: 300,
            ease: 'Back.easeOut'
        });

        this.frame.animateIn();
    }

    private animateOut(onComplete: () => void): void {
        this.scene.tweens.add({
            targets: this,
            alpha: 0,
            scale: 0.95,
            duration: 200,
            ease: 'Back.easeIn',
            onComplete
        });
    }

    public destroy(): void {
        this.backgroundBlocker.destroy();
        this.choices.forEach(button => button.destroy());
        this.frame.destroy();
        this.portrait.destroy();
        this.descriptionText.destroy();
        this.contentContainer.destroy();
        super.destroy();
    }
} 