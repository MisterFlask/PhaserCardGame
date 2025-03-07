import { AbstractReward } from "../../../rewards/AbstractReward";
import { CurrencyReward } from "../../../rewards/CurrencyReward";
import { AbstractBuff } from "../AbstractBuff";

export class AdditionalPoundsSterling extends AbstractBuff {
    constructor(stacks: number) {
        super();
        this.isDebuff = false;
        this.stacks = stacks;
    }

    override getDisplayName(): string {
        return "Additional Pounds Sterling";
    }

    override getDescription(): string {
        return "Receive additional pounds sterling at the end of combat.";
    }

    override alterRewards(currentRewards: AbstractReward[]): AbstractReward[] {
        currentRewards.push(new CurrencyReward(this.stacks));
        return currentRewards;
    }
} 