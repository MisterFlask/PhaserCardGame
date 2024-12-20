import { AbstractReward } from "../../../rewards/AbstractReward";
import { CardReward } from "../../../rewards/CardReward";
import { CardRuleUtils } from "../../../rules/CardRuleUtils";
import { AbstractBuff } from "../AbstractBuff";

export class AnotherCardReward extends AbstractBuff {
    constructor() {
        super();
        this.isDebuff = false;
    }

    override getDisplayName(): string {
        return "Additional Card Reward";
    }

    override getDescription(): string {
        return "At the end of combat, receive an additional card reward.";
    }

    override alterRewards(currentRewards: AbstractReward[]): AbstractReward[] {
        const cardRewardSelection = CardRuleUtils.getInstance().determineCardRewards();
        currentRewards.push(new CardReward(cardRewardSelection.cardSelection));
        return currentRewards;
    }
} 