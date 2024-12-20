import { AbstractReward } from "../../../rewards/AbstractReward";
import { CurrencyReward } from "../../../rewards/CurrencyReward";
import { AbstractBuff } from "../AbstractBuff";

export class AdditionalPromissoryNotes extends AbstractBuff {
    constructor() {
        super();
        this.isDebuff = false;
    }

    override getDisplayName(): string {
        return "Additional Promissory Notes";
    }

    override getDescription(): string {
        return "Receive additional promissory notes at the end of combat.";
    }

    override alterRewards(currentRewards: AbstractReward[]): AbstractReward[] {
        currentRewards.push(new CurrencyReward(25));
        return currentRewards;
    }
} 