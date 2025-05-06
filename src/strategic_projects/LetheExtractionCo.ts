import { AbstractStrategicProject } from "./AbstractStrategicProject";
import { StrategicResource } from "./strategic_resources.ts/StrategicResources";

export class LetheExtractionCo extends AbstractStrategicProject {
    private victoryPoints: number = 0;

    constructor() {
        super({
            name: "Lethe Extraction Co.",
            description: "Increases in value by 100 victory points per run.",
            portraitName: "lethe_extraction"
        });
        this.surfacePurchaseValue = 300;
        this.flavorText = "Secure mining rights to Lethe's memory-wiping waters.";
    }

    public override getStrategicResourceCost(): StrategicResource[] {
        return [
            StrategicResource.Hush.ofQuantity(2),
            StrategicResource.WhiteflameDistillate.ofQuantity(2)
        ];
    }

    public override postProcessCampaignStateAfterRun(): void {
        this.victoryPoints += 100;
    }

    public getVictoryPoints(): number {
        return this.victoryPoints;
    }
} 