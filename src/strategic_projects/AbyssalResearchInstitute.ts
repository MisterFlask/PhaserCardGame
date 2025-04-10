// Jointly constructing a highly unstable, cutting-edge research facility at the edge of the Abyssal Frontier to study and weaponize cosmic horrors.

// effect: at the beginning of each run, gain a card reward.

import { AbstractBuff } from "../gamecharacters/buffs/AbstractBuff";
import { AbstractReward } from "../rewards/AbstractReward";
import { CardReward } from "../rewards/CardReward";
import { CardRewardsGenerator } from "../rules/CardRewardsGenerator";
import { AbstractStrategicProject } from "./AbstractStrategicProject";
import { StrategicResource } from "./strategic_resources.ts/StrategicResources";

export class AbyssalResearchInstitute extends AbstractStrategicProject {
    constructor() {
        super({
            name: "Abyssal Research Institute",
            description: "At the beginning of each run, gain a card reward.",
            portraitName: "abyssal_research_institute"
        });
        this.surfacePurchaseValue = 200;
        this.flavorText = "A research collaboration with the Wetenschepellejik Broedershcap van Natuurkundegen.";

    }

    public override getStrategicResourceCost(): StrategicResource[] {
        return [
            StrategicResource.ObsidianSilk.ofQuantity(2),
            StrategicResource.WhiteflameDistillate.ofQuantity(1)
        ];
    }
}

export class AbyssalResearchInstituteBuff extends AbstractBuff {
    constructor() {
        super();
    }

    public override getDisplayName(): string {
        return "Abyssal Research Institute";
    }

    public override getDescription(): string {
        return "At the beginning of each run, gain a card reward.";
    }

    override addRewardOnRunStart(): AbstractReward[] {
        return [new CardReward(CardRewardsGenerator.getInstance().generateCardRewardsForCombat())];
    }

}