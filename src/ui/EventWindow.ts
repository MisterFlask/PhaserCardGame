import Phaser, { Scene } from 'phaser';
import { AbstractEvent, FinishChoice } from '../events/AbstractEvent';
import { MagicWords } from '../text/MagicWords';
import { DecorativeFrame } from './DecorativeFrame';
import { DepthManager } from './DepthManager';
import { EventButton } from './EventButton';
import { TextBox } from './TextBox';
import { TooltipAttachment } from './TooltipAttachment';

export class EventWindow extends Phaser.GameObjects.Container {
    private frame: DecorativeFrame;
    private portrait: Phaser.GameObjects.Image;
    private descriptionText: TextBox;
    private choices: EventButton[] = [];
    private tooltips: TooltipAttachment[] = [];
    private contentContainer: Phaser.GameObjects.Container;
    private backgroundBlocker: Phaser.GameObjects.Rectangle;
    private magicWordTooltip?: TooltipAttachment;

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

        var effectiveEventTitle = event.name;
        // Recursively get title from parent events if current event title is empty
        while (effectiveEventTitle === "" && event.parentEvent) {
            var parentEvent = event.parentEvent;
            effectiveEventTitle = parentEvent.name;
        }
        effectiveEventTitle = effectiveEventTitle || ""; // Default to empty string if no title found

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

        // Add title text above description
        const titleText = new TextBox({
            scene,
            x: windowWidth * 0.3,
            y: -windowHeight * 0.35, // Position above description
            width: windowWidth * 0.35,
            text: effectiveEventTitle,
            style: {
                fontSize: '28px',
                color: '#ffd700', // Gold color for the title
                fontFamily: 'serif',
                wordWrap: { width: windowWidth * 0.35 },
                align: 'center',
                fontStyle: 'bold'
            },
        });
        this.contentContainer.add(titleText);

        // Process the description text for magic words
        const magicWordsResult = MagicWords.getInstance().getFlavorMagicWordsResult(event.description);
        
        // Add description text with improved styling
        this.descriptionText = new TextBox({
            scene,
            x: windowWidth * 0.3,
            y: -windowHeight * 0.25,
            width: windowWidth * 0.35,
            text: magicWordsResult.stringResult,
            style: {
                fontSize: '22px',
                color: '#e0d5c0',
                fontFamily: 'serif',
                wordWrap: { width: windowWidth * 0.35 },
                align: 'left',
                lineSpacing: 8
            },
            interactive: true,
        });
        this.contentContainer.add(this.descriptionText);

        // Create a single tooltip that will be reused
        this.magicWordTooltip = new TooltipAttachment({
            scene,
            container: this.descriptionText,
            tooltipText: '', // Will be updated when hovering over magic words
            fillColor: 0x000000,
            disableAutomaticHoverListeners: true, // we do this via textbox
        });
        this.magicWordTooltip.hideTooltip();

        // Set up area handlers for magic words
        this.descriptionText.onAreaOver((key: string) => {
            const concept = magicWordsResult.concepts.find(c => c.name === key);
            if (concept) {
                this.magicWordTooltip?.updateText(concept.description);
                this.magicWordTooltip?.showTooltip();
            }
        });

        this.descriptionText.onAreaOut(() => {
            this.magicWordTooltip?.hideTooltip();
        });

        // Add choice buttons with better spacing
        if (!event.choices || event.choices.length === 0) {
            console.error("Event has no choices: " + event.name);
            event.choices = [new FinishChoice()];
        }

        const buttonStartY = windowHeight * 0.1;
        const buttonSpacing = 70;
        const buttonWidth = windowWidth * 0.3;

        event.choices.forEach((choice, index) => {
            const button = new EventButton({
                scene,
                x: windowWidth * -0.2,
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

            if (choice.mechanicalInformationText && choice.mechanicalInformationText !== "") {
                const tooltip = new TooltipAttachment({
                    scene,
                    container: button,
                    tooltipText: choice.mechanicalInformationText,
                    fillColor: 0x000000,
                });
                this.tooltips.push(tooltip);
            }

            this.choices.push(button);
            this.contentContainer.add(button);
        });

        this.setDepth(DepthManager.getInstance().MAP_OVERLAY + 30);
        
        // Animate in
        this.animateIn();
        this.scene.events.on('update', this.updateTooltipPosition, this);

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
        this.tooltips.forEach(tooltip => tooltip.destroy());
        this.magicWordTooltip?.destroy();
        this.frame.destroy();
        this.portrait.destroy();
        this.descriptionText.destroy();
        this.contentContainer.destroy();
        super.destroy();
    }

    updateTooltipPosition(): void {
        if (!this.scene) {
            return;
        }
        this.magicWordTooltip?.updateTooltipPosition();
    }
} 