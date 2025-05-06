import { GameState } from "../rules/GameState";
import { AbstractStrategicProject } from "./AbstractStrategicProject";
import { StrategicResource } from "./strategic_resources.ts/StrategicResources";

export class DisMunicipalBonds extends AbstractStrategicProject {
    constructor() {
        super({
            name: "Dis Municipal Bonds",
            description: "Gain 25 money in the vault at the end of each run.",
            portraitName: "dis_municipal_bonds"
        });
        this.surfacePurchaseValue = 250;
        this.flavorText = "A safe investment in the city's future. The Barons always pay their debts... eventually.";
    }

    public override getStrategicResourceCost(): StrategicResource[] {
        return [
            StrategicResource.Hush.ofQuantity(1),
            StrategicResource.WhiteflameDistillate.ofQuantity(1)
        ];
    }

    public override postProcessCampaignStateAfterRun(): void {
        const gameState = GameState.getInstance();
        gameState.moneyInVault += 25; // Steady return on investment
    }
} 