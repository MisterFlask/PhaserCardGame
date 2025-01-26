import { RelicsLibrary } from "../../../relics/RelicsLibrary";
import { AbstractReward } from "../../../rewards/AbstractReward";
import { RelicReward } from "../../../rewards/RelicReward";
import { AbstractBuff } from "../AbstractBuff";

export class GuaranteedRelic extends AbstractBuff {
    constructor() {
        super();
        this.isDebuff = false;
    }

    override getDisplayName(): string {
        return "Guaranteed Relic";
    }

    override getDescription(): string {
        return "Receive a relic at the end of combat.";
    }

    override alterRewards(currentRewards: AbstractReward[]): AbstractReward[] {
        const relic = RelicsLibrary.getInstance().getRandomBeneficialRelics(1)[0];
        currentRewards.push(new RelicReward(relic));
        return currentRewards;
    }
} 