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
            description: "Gain a card reward at the beginning of each run.",
            portraitName: "abyssal_research_institute"
        });
        this.surfacePurchaseValue = 300;
        this.flavorText = "A cutting-edge research facility dedicated to unlocking the secrets of the abyss.";
    }

    public override getStrategicResourceCost(): StrategicResource[] {
        return [
            StrategicResource.Hush.ofQuantity(2),
            StrategicResource.WhiteflameDistillate.ofQuantity(1)
        ];
    }

    public override postProcessCampaignStateAfterRun(): void {
        // Gain a card reward at the beginning of each run
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