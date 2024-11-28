import { PlayableCard } from '../gamecharacters/PlayableCard';
import { CardRuleUtils } from '../rules/CardRuleUtils';
import CardRewardScreen from '../screens/subcomponents/CardRewardScreen';
import { RewardDisplay } from '../ui/RewardDisplay';
import { ActionManager } from '../utils/ActionManager';
import { AbstractReward, RewardType } from './AbstractReward';

export class CardReward extends AbstractReward {
    public cardSelection: PlayableCard[];

    constructor(cardSelection: PlayableCard[]) {
        super(RewardType.Card);
        this.cardSelection = cardSelection;
    }

    createRewardElement(scene: Phaser.Scene, x: number, y: number): Phaser.GameObjects.Container {
        return new RewardDisplay({
            scene,
            x,
            y,
            text: this.getDisplayText(),
            iconTexture: this.getIconTexture(),
            tooltipText: this.getTooltipText(),
            onClick: () => this.showCardRewardScreen(scene)
        });
    }

    getDisplayText(): string {
        return "Card Reward";
    }

    getTooltipText(): string {
        return "Choose a new card to add to your deck";
    }

    getIconTexture(): string {
        return 'card_reward_icon';
    }

    private showCardRewardScreen(scene: Phaser.Scene): void {
        const cardRewardScreen = new CardRewardScreen({
            scene: scene,
            rewards: this.cardSelection,
            onSelect: (selectedCard) => {
                ActionManager.getInstance().addCardToMasterDeck(selectedCard);
                cardRewardScreen.hide();
                this.collect(scene);
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
        cardRewardScreen.show();
    }

    collect(scene: Phaser.Scene): void {
        // Collection is handled in showCardRewardScreen
    }
} 