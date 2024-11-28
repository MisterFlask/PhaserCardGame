import Phaser from 'phaser';
import { PlayableCard } from '../../gamecharacters/PlayableCard';
import { AbstractReward } from '../../rewards/AbstractReward';
import { CardReward } from '../../rewards/CardReward';
import { CardRuleUtils } from '../../rules/CardRuleUtils';
import { TextBoxButton } from '../../ui/Button';
import { ActionManager } from '../../utils/ActionManager';
import CardRewardScreen from './CardRewardScreen';

const CONSTANTS = {
    BACKGROUND_WIDTH: 800,
    BACKGROUND_HEIGHT: 600,
    BUTTON_WIDTH: 200,
    BUTTON_HEIGHT: 50,
    BUTTON_Y: 250,
    REWARD_SPACING: 200,
    ICON_SIZE: 100,
    ICON_INNER_SIZE: 80,
    TOOLTIP_WIDTH: 200,
    TOOLTIP_HEIGHT: 40,
    TOOLTIP_Y_OFFSET: -70,
    FADE_DURATION: 500,
    UI_DEPTH: {
        BACKGROUND: 100,
        REWARDS: 101,
        TOOLTIPS: 102
    }
} as const;

class GeneralRewardScreen extends Phaser.GameObjects.Container {
    private rewards: AbstractReward[];
    private rewardElements: Phaser.GameObjects.Container[] = [];
    private shouldShow: boolean = false;
    private doneButton?: TextBoxButton;
    private onDoneCallback?: () => void;
    private background!: Phaser.GameObjects.Rectangle;
    private activeCardRewardScreen?: CardRewardScreen;

    constructor(scene: Phaser.Scene, rewards: AbstractReward[]) {
        super(scene, scene.scale.width / 2, scene.scale.height / 2);
        scene.add.existing(this);
        
        this.rewards = rewards;
        this.createBackground();
        this.displayRewards();
        this.setDepth(CONSTANTS.UI_DEPTH.BACKGROUND);
        this.hide(); // Initially hidden
    }

    public setOnDoneCallback(callback: () => void): void {
        this.onDoneCallback = callback;
    }

    private createBackground(): void {
        this.background = this.scene.add.rectangle(
            0, 
            0, 
            CONSTANTS.BACKGROUND_WIDTH, 
            CONSTANTS.BACKGROUND_HEIGHT, 
            0x000000, 
            0.8
        )
        .setOrigin(0.5)
        .setStrokeStyle(4, 0xffffff);
        this.add(this.background);

        this.doneButton = new TextBoxButton({
            scene: this.scene,
            x: 0,
            y: CONSTANTS.BUTTON_Y,
            width: CONSTANTS.BUTTON_WIDTH,
            height: CONSTANTS.BUTTON_HEIGHT,
            text: 'Done',
            style: { 
                fontSize: '24px', 
                color: '#ffffff',
                fontFamily: 'Arial',
                align: 'center'
            },
            fillColor: 0x444444,
            textBoxName: 'doneButton'
        });

        this.doneButton.onClick(() => {
            if (this.onDoneCallback) {
                this.onDoneCallback();
            }
            this.hide();
        });

        this.add(this.doneButton);
    }

    private showCardRewardScreen(cardReward: CardReward): void {
        // Clean up any existing card reward screen
        if (this.activeCardRewardScreen) {
            this.activeCardRewardScreen.destroy();
            this.activeCardRewardScreen = undefined;
        }

        const cardRewardScreen = new CardRewardScreen({
            scene: this.scene,
            rewards: cardReward.cardSelection,
            onSelect: (selectedCard: PlayableCard) => {
                ActionManager.getInstance().addCardToMasterDeck(selectedCard);
                cardReward.collect(this.scene);
            },
            onSkip: () => {
                cardRewardScreen.hide();
            },
            onReroll: () => {
                const rewardCards = CardRuleUtils.getInstance().determineCardRewards();
                cardRewardScreen.rewards = rewardCards.cardSelection;
                cardRewardScreen.displayRewardCards();
            }
        });

        // Listen for card selection event
        this.scene.events.once('cardReward:selected', () => {
            // Find and remove the reward element associated with this card reward
            const rewardElement = this.rewardElements[this.rewards.indexOf(cardReward)];
            if (rewardElement) {
                this.removeRewardElement(rewardElement, cardReward);
            }
        });

        this.activeCardRewardScreen = cardRewardScreen;
        cardRewardScreen.show();
    }

    private displayRewards(): void {
        const startX = -((this.rewards.length - 1) * CONSTANTS.REWARD_SPACING) / 2;

        this.rewards.forEach((reward, index) => {
            const xPosition = startX + index * CONSTANTS.REWARD_SPACING;
            const rewardElement = this.scene.add.container(xPosition, 0);

            const iconBackground = this.scene.add.rectangle(
                0, 
                0, 
                CONSTANTS.ICON_SIZE, 
                CONSTANTS.ICON_SIZE, 
                0x333333
            )
            .setStrokeStyle(2, 0xffffff)
            .setInteractive()
            .on(Phaser.Input.Events.GAMEOBJECT_POINTER_OVER, () => {
                tooltipBackground.setVisible(true);
                tooltipText.setVisible(true);
            })
            .on(Phaser.Input.Events.GAMEOBJECT_POINTER_OUT, () => {
                tooltipBackground.setVisible(false);
                tooltipText.setVisible(false);
            })
            .on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, () => {
                this.handleRewardClick(rewardElement, reward);
            });
            
            const icon = this.scene.add.image(0, 0, reward.getIconTexture())
                .setDisplaySize(CONSTANTS.ICON_INNER_SIZE, CONSTANTS.ICON_INNER_SIZE);

            const text = this.scene.add.text(0, 60, reward.getDisplayText(), {
                fontSize: '16px',
                color: '#ffffff',
                align: 'center'
            }).setOrigin(0.5);

            const tooltipBackground = this.scene.add.rectangle(
                0, 
                CONSTANTS.TOOLTIP_Y_OFFSET, 
                CONSTANTS.TOOLTIP_WIDTH, 
                CONSTANTS.TOOLTIP_HEIGHT, 
                0x000000, 
                0.8
            ).setStrokeStyle(1, 0xffffff);

            const tooltipText = this.scene.add.text(
                0, 
                CONSTANTS.TOOLTIP_Y_OFFSET, 
                reward.getTooltipText(), 
                {
                    fontSize: '14px',
                    color: '#ffffff',
                    align: 'center'
                }
            ).setOrigin(0.5);

            tooltipBackground.setVisible(false);
            tooltipText.setVisible(false);

            rewardElement.add([iconBackground, icon, text, tooltipBackground, tooltipText]);

            this.add(rewardElement);
            this.rewardElements.push(rewardElement);
        });
    }

    private handleRewardClick(rewardElement: Phaser.GameObjects.Container, reward: AbstractReward): void {
        console.log('handleRewardClick', reward);
        if (reward instanceof CardReward) {
            this.showCardRewardScreen(reward);
            return;
        }

        // For all other rewards, collect immediately
        reward.collect(this.scene);
        this.removeRewardElement(rewardElement, reward);
    }

    private removeRewardElement(
        rewardElement: Phaser.GameObjects.Container,
        reward: AbstractReward
    ): void {
        this.remove(rewardElement);
        rewardElement.destroy();
        this.rewards.splice(this.rewards.indexOf(reward), 1);
        
        if (this.rewards.length === 0 && this.onDoneCallback) {
            this.onDoneCallback();
            this.hide();
        }
    }

    public show(): void {
        this.shouldShow = true;
        this.setVisible(true);
        this.alpha = 0;

        this.list.forEach(child => {
        });

        this.scene.tweens.add({
            targets: this,
            alpha: 1,
            duration: CONSTANTS.FADE_DURATION,
            ease: 'Power2',
            onComplete: () => {
            }
        });
    }

    public hide(): void {
        this.shouldShow = false;
        
        this.scene.tweens.add({
            targets: this,
            alpha: { from: this.alpha, to: 0 },
            duration: CONSTANTS.FADE_DURATION,
            ease: 'Power2',
            onComplete: () => {
                if (!this.shouldShow) {
                    this.setVisible(false);
                }
            }
        });
    }

    public destroy(fromScene?: boolean): void {
        // Clean up active card reward screen if it exists
        if (this.activeCardRewardScreen) {
            this.activeCardRewardScreen.destroy();
            this.activeCardRewardScreen = undefined;
        }

        // Clean up reward elements
        this.rewardElements.forEach(element => element.destroy());
        this.rewardElements = [];

        super.destroy(fromScene);
    }
}

export default GeneralRewardScreen; 