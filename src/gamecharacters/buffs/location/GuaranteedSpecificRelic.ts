import { AbstractRelic } from "../../../relics/AbstractRelic";
import { RelicsLibrary } from "../../../relics/RelicsLibrary";
import { AbstractReward } from "../../../rewards/AbstractReward";
import { RelicReward } from "../../../rewards/RelicReward";
import { AbstractBuff } from "../AbstractBuff";

export class GuaranteedSpecificRelic extends AbstractBuff {
    private relic: AbstractRelic | null = null;

    constructor();
    constructor(relic: AbstractRelic);
    constructor(relic?: AbstractRelic) {
        super();
        this.isDebuff = false;
        if (relic) {
            this.relic = relic;
        }
    }

    public init(): void {
        if (!this.relic) {
            this.relic = RelicsLibrary.getInstance().getRandomBeneficialRelics(1)[0];
        }
    }

    override getDisplayName(): string {
        if (!this.relic) {
            this.init();
        }
        return `${this.relic!.getDisplayName()} Relic`;
    }

    override getDescription(): string {
        if (!this.relic) {
            this.init();
        }
        return `Receive the ${this.relic!.getDisplayName()} relic at the end of combat. ${this.relic!.getDescription()}`;
    }

    override alterRewards(currentRewards: AbstractReward[]): AbstractReward[] {
        if (!this.relic) {
            this.init();
        }
        currentRewards.push(new RelicReward(this.relic!.copy()));
        return currentRewards;
    }
} 