// CardRewardScreen.ts
import Phaser from 'phaser';
import { PlayableCard } from '../../gamecharacters/PlayableCard';
import { CardRuleUtils } from '../../rules/CardRuleUtils';
import { TextBoxButton } from '../../ui/Button';
import { DepthManager } from '../../ui/DepthManager';
import { PhysicalCard } from '../../ui/PhysicalCard';
import { UIContext, UIContextManager } from '../../ui/UIContextManager';
import { CardGuiUtils } from '../../utils/CardGuiUtils';

export interface CardRewardScreenData {
    rewards: PlayableCard[];
    scene: Phaser.Scene;
    onSelect: (selectedCard: PlayableCard) => void;
    onSkip: () => void;
    onReroll?: () => void;
}

const CARD_REWARD_DEPTH = DepthManager.getInstance().REWARD_SCREEN + 2000; // ensure above GeneralRewardScreen
const CARD_REWARD_HOVERED_DEPTH = CARD_REWARD_DEPTH + 3000; // New depth for hovered cards

class CardRewardScreen {
    private scene: Phaser.Scene;
    public rewards: PlayableCard[];
    private onSelect: (selectedCard: PlayableCard) => void;
    private onSkip: () => void;
    private onReroll?: () => void;
    private shouldShow: boolean = false;
    
    // Instead of a container, we'll track all objects individually.
    private background!: Phaser.GameObjects.Rectangle;
    private goToMapButton!: TextBoxButton;
    private rerollButton!: TextBoxButton;
    private cardElements: {
        physicalCard: PhysicalCard,
        ownerText: Phaser.GameObjects.Text
    }[] = [];

    private centerX: number;
    private centerY: number;

    constructor(params: CardRewardScreenData) {
        this.scene = params.scene;
        this.rewards = params.rewards;
        this.onSelect = params.onSelect;
        this.onSkip = params.onSkip;
        this.onReroll = params.onReroll;

        this.centerX = this.scene.scale.width / 2;
        this.centerY = this.scene.scale.height / 2;

        this.createBackground();
        this.displayRewardCards();
        this.createActionButtons();
        this.hide();
    }

    private createBackground(): void {
        this.background = this.scene.add.rectangle(this.centerX, this.centerY, 800, 600, 0x000000, 0.8)
            .setOrigin(0.5)
            .setStrokeStyle(4, 0xffffff)
            .setDepth(CARD_REWARD_DEPTH)
            .setVisible(false);
    }

    private handleCardSelection(selectedCard: PlayableCard): void {
        this.onSelect(selectedCard);
        this.scene.events.emit('cardReward:selected');
        this.hide();
    }

    public displayRewardCards(): void {
        UIContextManager.getInstance().setContext(UIContext.REWARD_SCREEN);
        this.cardElements.forEach(el => {
            el.physicalCard.container.destroy();
            el.ownerText.destroy();
        });
        this.cardElements = [];

        const cardSpacing = 220;
        const startX = this.centerX - cardSpacing;
        const yPosition = this.centerY - 100;
        const cardGuiUtils = CardGuiUtils.getInstance();

        this.rewards.forEach((cardReward, index) => {
            const cardX = startX + index * cardSpacing;
            const cardY = yPosition;

            const physicalCard = cardGuiUtils.createCard({
                scene: this.scene,
                x: cardX,
                y: cardY,
                data: cardReward,
                onCardCreatedEventCallback: (cardInstance: PhysicalCard) => {
                    cardInstance.setDepth(CARD_REWARD_DEPTH + 100);

                    cardInstance.container.on('pointerover', () => {
                        cardInstance.setDepth(CARD_REWARD_HOVERED_DEPTH);
                    });
                    cardInstance.container.on('pointerout', () => {
                        cardInstance.setDepth(CARD_REWARD_DEPTH + 100);
                    });
                    cardInstance.container.on('pointerdown', () => {
                        this.handleCardSelection(cardReward);
                    });
                }
            });

            const ownerName = CardRuleUtils.getInstance().deriveOwnerFromCardNativeClass(cardReward).name;
            const ownerText = this.scene.add.text(
                cardX,
                cardY + (physicalCard.container.displayHeight / 2) + 20,
                ownerName,
                {
                    fontSize: '16px',
                    color: '#ffffff',
                    fontFamily: 'Arial',
                    align: 'center'
                }
            ).setOrigin(0.5, 0)
             .setDepth(CARD_REWARD_DEPTH + 1)
             .setVisible(false);

            this.cardElements.push({
                physicalCard,
                ownerText
            });
        });
    }

    private createActionButtons(): void {
        const buttonText = "Perhaps not";
        this.goToMapButton = new TextBoxButton({
            scene: this.scene,
            x: this.centerX - 100,
            y: this.centerY + 250,
            width: 300,
            height: 50,
            text: buttonText,
            style: { fontSize: '24px', color: '#ffffff', fontFamily: 'Arial', align: 'center' },
            fillColor: 0x007700,
            textBoxName: 'goToMapButton'
        });

        this.goToMapButton.setDepth(CARD_REWARD_DEPTH + 1).setVisible(false);
        this.goToMapButton.onClick(() => {
            this.onSkip();
            this.hide();
        });

        this.rerollButton = new TextBoxButton({
            scene: this.scene,
            x: this.centerX + 100,
            y: this.centerY + 150,
            width: 300,
            height: 50,
            text: "DEBUG: Reroll",
            style: { fontSize: '24px', color: '#ffffff', fontFamily: 'Arial', align: 'center' },
            fillColor: 0x770000,
            textBoxName: 'rerollButton'
        });

        this.rerollButton.setDepth(CARD_REWARD_DEPTH + 1).setVisible(false);
        this.rerollButton.onClick(() => {
            if (this.onReroll) {
                this.onReroll();
                // recreate visuals
                this.background.setVisible(true);
                this.goToMapButton.setVisible(true);
                this.rerollButton.setVisible(true);
                this.displayRewardCards();
                this.show();
            }
        });
    }

    public show(): void {
        this.shouldShow = true;
        this.background.setVisible(true);
        this.goToMapButton.setVisible(true);
        this.rerollButton.setVisible(true);
        this.cardElements.forEach(el => {
            el.physicalCard.container.setVisible(true);
            el.ownerText.setVisible(true);
        });

        this.scene.tweens.add({
            targets: [this.background, this.goToMapButton, this.rerollButton, ...this.cardElements.map(el => el.physicalCard.container), ...this.cardElements.map(el => el.ownerText)],
            alpha: { from: 0, to: 1 },
            duration: 500,
            ease: 'Power2'
        });
    }

    public hide(): void {
        this.shouldShow = false;
        const targets = [this.background, this.goToMapButton, this.rerollButton, ...this.cardElements.map(el => el.physicalCard.container), ...this.cardElements.map(el => el.ownerText)];
        this.scene.tweens.add({
            targets,
            alpha: { from: 1, to: 0 },
            duration: 500,
            ease: 'Power2',
            onComplete: () => {
                if (!this.shouldShow) {
                    targets.forEach(t => t.setVisible(false));
                }
            }
        });
    }

    public destroy(): void {
        this.goToMapButton?.destroy();
        this.rerollButton?.destroy();
        this.background?.destroy();

        this.cardElements.forEach(el => {
            el.physicalCard.container.destroy();
            el.ownerText.destroy();
        });
        this.cardElements = [];

        if (this.rewards) {
            this.rewards.forEach(card => {
                if (card && card.physicalCard) {
                    card.physicalCard.obliterate();
                }
            });
        }

        this.rewards = [];
        this.onSelect = () => {};
        this.onSkip = () => {};
        this.onReroll = undefined;
    }
}

export default CardRewardScreen;
