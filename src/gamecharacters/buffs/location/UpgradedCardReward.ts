import { AbstractReward } from "../../../rewards/AbstractReward";
import { CardReward } from "../../../rewards/CardReward";
import { AbstractBuff } from "../AbstractBuff";

export class UpgradedCardReward extends AbstractBuff {
    constructor() {
        super();
        this.isDebuff = false;
    }

    override getDisplayName(): string {
        return "Upgraded Card Rewards";
    }

    override getDescription(): string {
        return "Card rewards are upgraded.";
    }

    override alterRewards(currentRewards: AbstractReward[]): AbstractReward[] {
        return currentRewards.map(reward => {
            if (reward instanceof CardReward) {
                // Create upgraded versions of all cards in the selection
                const upgradedSelection = reward.cardSelection.map(card => card.standardUpgrade(false));
                reward.cardSelection = upgradedSelection;
            }
            return reward;
        });
    }
} 