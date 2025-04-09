// GeneralRewardScreen.ts
import Phaser from 'phaser';
import { PlayableCard } from '../../gamecharacters/PlayableCard';
import { AbstractReward } from '../../rewards/AbstractReward';
import { CardReward } from '../../rewards/CardReward';
import { CardRuleUtils } from '../../rules/CardRuleUtils';
import { TextBoxButton } from '../../ui/Button';
import { DepthManager } from '../../ui/DepthManager';
import { UIContext, UIContextManager } from '../../ui/UIContextManager';
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
        BACKGROUND: DepthManager.getInstance().REWARD_SCREEN + 100,
        REWARDS: DepthManager.getInstance().REWARD_SCREEN + 101,
        TOOLTIPS: DepthManager.getInstance().REWARD_SCREEN + 102
    }
} as const;

class GeneralRewardScreen {
    private scene: Phaser.Scene;
    private rewards: AbstractReward[];
    private shouldShow: boolean = false;
    private onDoneCallback?: () => void;
    private background!: Phaser.GameObjects.Rectangle;
    private doneButton?: TextBoxButton;
    private activeCardRewardScreen?: CardRewardScreen;

    // We'll store references to all created objects so we can manage them without containers
    private rewardObjects: {
        iconBackground: Phaser.GameObjects.Rectangle,
        icon: Phaser.GameObjects.Image,
        text: Phaser.GameObjects.Text,
        tooltipBackground: Phaser.GameObjects.Rectangle,
        tooltipText: Phaser.GameObjects.Text,
        reward: AbstractReward
    }[] = [];

    private centerX: number;
    private centerY: number;

    constructor(scene: Phaser.Scene, rewards: AbstractReward[]) {
        this.scene = scene;
        this.rewards = rewards;
        this.centerX = this.scene.scale.width / 2;
        this.centerY = this.scene.scale.height / 2;

        this.createBackground();
        this.displayRewards();
        this.hide();
    }

    public setOnDoneCallback(callback: () => void): void {
        this.onDoneCallback = callback;
    }

    private createBackground(): void {
        this.background = this.scene.add.rectangle(
            this.centerX,
            this.centerY,
            CONSTANTS.BACKGROUND_WIDTH,
            CONSTANTS.BACKGROUND_HEIGHT,
            0x000000,
            0.8
        )
        .setOrigin(0.5)
        .setStrokeStyle(4, 0xffffff)
        .setDepth(CONSTANTS.UI_DEPTH.BACKGROUND)
        .setVisible(false);

        this.doneButton = new TextBoxButton({
            scene: this.scene,
            x: this.centerX,
            y: this.centerY + CONSTANTS.BUTTON_Y,
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

        this.doneButton.setDepth(CONSTANTS.UI_DEPTH.REWARDS);
        this.doneButton.setVisible(false);

        this.doneButton.onClick(() => {
            if (this.onDoneCallback) {
                this.onDoneCallback();
            }
            this.hide();
        });
    }

    private showCardRewardScreen(cardReward: CardReward): void {
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

        this.scene.events.once('cardReward:selected', () => {
            const idx = this.rewards.indexOf(cardReward);
            if (idx >= 0) {
                const ro = this.rewardObjects[idx];
                this.removeRewardElement(ro, cardReward);
            }
        });

        this.activeCardRewardScreen = cardRewardScreen;
        cardRewardScreen.show();
    }

    private displayRewards(): void {
        const startX = this.centerX - ((this.rewards.length - 1) * CONSTANTS.REWARD_SPACING) / 2;
        this.rewards.forEach((reward, index) => {
            const xPosition = startX + index * CONSTANTS.REWARD_SPACING;
            const yPosition = this.centerY;

            const iconBackground = this.scene.add.rectangle(
                xPosition, 
                yPosition,
                CONSTANTS.ICON_SIZE, 
                CONSTANTS.ICON_SIZE, 
                0x333333
            )
            .setStrokeStyle(2, 0xffffff)
            .setInteractive()
            .setDepth(CONSTANTS.UI_DEPTH.REWARDS)
            .setVisible(false);

            const icon = this.scene.add.image(xPosition, yPosition, reward.getIconTexture())
                .setDisplaySize(CONSTANTS.ICON_INNER_SIZE, CONSTANTS.ICON_INNER_SIZE)
                .setDepth(CONSTANTS.UI_DEPTH.REWARDS)
                .setVisible(false);

            const text = this.scene.add.text(xPosition, yPosition + 60, reward.getDisplayText(), {
                fontSize: '16px',
                color: '#ffffff',
                align: 'center'
            })
            .setOrigin(0.5)
            .setDepth(CONSTANTS.UI_DEPTH.REWARDS)
            .setVisible(false);

            const tooltipBackground = this.scene.add.rectangle(
                xPosition, 
                yPosition + CONSTANTS.TOOLTIP_Y_OFFSET, 
                CONSTANTS.TOOLTIP_WIDTH, 
                CONSTANTS.TOOLTIP_HEIGHT, 
                0x000000, 
                0.8
            )
            .setStrokeStyle(1, 0xffffff)
            .setDepth(CONSTANTS.UI_DEPTH.TOOLTIPS)
            .setVisible(false);

            const tooltipText = this.scene.add.text(
                xPosition,
                yPosition + CONSTANTS.TOOLTIP_Y_OFFSET,
                reward.getTooltipText(),
                {
                    fontSize: '14px',
                    color: '#ffffff',
                    align: 'center'
                }
            )
            .setOrigin(0.5)
            .setDepth(CONSTANTS.UI_DEPTH.TOOLTIPS)
            .setVisible(false);

            iconBackground.on(Phaser.Input.Events.GAMEOBJECT_POINTER_OVER, () => {
                tooltipBackground.setVisible(true);
                tooltipText.setVisible(true);
            })
            .on(Phaser.Input.Events.GAMEOBJECT_POINTER_OUT, () => {
                tooltipBackground.setVisible(false);
                tooltipText.setVisible(false);
            })
            .on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, () => {
                this.handleRewardClick(reward);
            });

            this.rewardObjects.push({
                iconBackground, 
                icon, 
                text, 
                tooltipBackground, 
                tooltipText,
                reward
            });
        });
    }

    private handleRewardClick(reward: AbstractReward): void {
        // Find the corresponding reward object
        const rewardObjectIndex = this.rewardObjects.findIndex(ro => ro.reward.guid === reward.guid);
        
        if (rewardObjectIndex === -1) {
            console.warn(`handleRewardClick: reward object with type ${reward.type} and GUID ${reward.guid} not found.`);
            return;
        }

        const rewardObject = this.rewardObjects[rewardObjectIndex];

        if (reward instanceof CardReward) {
            this.showCardRewardScreen(reward);
            return;
        }

        reward.collect(this.scene);
        this.removeRewardElement(rewardObject, reward);
    }

    private removeRewardElement(
        ro: {
            iconBackground: Phaser.GameObjects.Rectangle,
            icon: Phaser.GameObjects.Image,
            text: Phaser.GameObjects.Text,
            tooltipBackground: Phaser.GameObjects.Rectangle,
            tooltipText: Phaser.GameObjects.Text,
            reward: AbstractReward
        },
        reward: AbstractReward
    ): void {
        if (ro == null){
            console.warn("ro is null");
            return;
        }

        ro.iconBackground?.destroy();
        ro.icon?.destroy();
        ro.text?.destroy();
        ro.tooltipBackground?.destroy();
        ro.tooltipText?.destroy();

        // Find and remove the reward using its GUID
        const rewardIndex = this.rewards.findIndex(r => r.guid === reward.guid);
        const rewardObjectIndex = this.rewardObjects.findIndex(r => r.reward.guid === reward.guid);

        if (rewardIndex >= 0) {
            this.rewards.splice(rewardIndex, 1);
        }

        if (rewardObjectIndex >= 0) {
            this.rewardObjects.splice(rewardObjectIndex, 1);
        }

        if (this.rewards.length === 0 && this.onDoneCallback) {
            this.onDoneCallback();
            this.hide();
        }
    }

    public show(): void {
        UIContextManager.getInstance().pushContext(UIContext.REWARD_SCREEN);
        this.shouldShow = true;
        this.background.setVisible(true);
        this.doneButton?.setVisible(true);

        this.rewardObjects.forEach(ro => {
            ro.iconBackground.setVisible(true);
            ro.icon.setVisible(true);
            ro.text.setVisible(true);
        });

        this.scene.tweens.add({
            targets: [this.background, this.doneButton, ...this.rewardObjects.map(ro => ro.iconBackground), ...this.rewardObjects.map(ro => ro.icon), ...this.rewardObjects.map(ro => ro.text)],
            alpha: { from: 0, to: 1 },
            duration: CONSTANTS.FADE_DURATION,
            ease: 'Power2'
        });
    }

    public hide(): void {
        if (UIContextManager.getInstance().getContext() === UIContext.REWARD_SCREEN) {
            UIContextManager.getInstance().popContext();
        }
        this.shouldShow = false;

        this.scene.tweens.add({
            targets: [this.background, this.doneButton, ...this.rewardObjects.map(ro => ro.iconBackground), ...this.rewardObjects.map(ro => ro.icon), ...this.rewardObjects.map(ro => ro.text), ...this.rewardObjects.map(ro => ro.tooltipBackground), ...this.rewardObjects.map(ro => ro.tooltipText)],
            alpha: { from: 1, to: 0 },
            duration: CONSTANTS.FADE_DURATION,
            ease: 'Power2',
            onComplete: () => {
                if (!this.shouldShow) {
                    this.background.setVisible(false);
                    this.doneButton?.setVisible(false);
                    this.rewardObjects.forEach(ro => {
                        ro.iconBackground.setVisible(false);
                        ro.icon.setVisible(false);
                        ro.text.setVisible(false);
                        ro.tooltipBackground.setVisible(false);
                        ro.tooltipText.setVisible(false);
                    });
                }
            }
        });
    }

    public destroy(): void {
        if (this.activeCardRewardScreen) {
            this.activeCardRewardScreen.destroy();
            this.activeCardRewardScreen = undefined;
        }

        this.background.destroy();
        this.doneButton?.destroy();

        this.rewardObjects.forEach(ro => {
            ro.iconBackground.destroy();
            ro.icon.destroy();
            ro.text.destroy();
            ro.tooltipBackground.destroy();
            ro.tooltipText.destroy();
        });
        this.rewardObjects = [];
    }
}

export default GeneralRewardScreen;
