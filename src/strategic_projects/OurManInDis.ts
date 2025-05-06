import { GameState } from "../rules/GameState";
import { AbstractStrategicProject } from "./AbstractStrategicProject";
import { StrategicResource } from "./strategic_resources.ts/StrategicResources";

export class OurManInDis extends AbstractStrategicProject {
    constructor() {
        super({
            name: "Our Man In Dis",
            description: "+50 sovereign infernal notes at start of run.",
            portraitName: "our_man_in_dis"
        });
        this.surfacePurchaseValue = 200;
        this.flavorText = "He speaks thirteen different infernal dialects. The Barons love him.";
    }

    public override getStrategicResourceCost(): StrategicResource[] {
        return [
            StrategicResource.Hush.ofQuantity(1),
            StrategicResource.WhiteflameDistillate.ofQuantity(1)
        ];
    }

    public override postProcessCampaignStateAfterRun(): void {
        const gameState = GameState.getInstance();
        gameState.sovereignInfernalNotes += 50;
    }
} 