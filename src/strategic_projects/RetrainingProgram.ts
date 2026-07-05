import { AbstractStrategicProject } from "./AbstractStrategicProject";
import { StrategicResource } from "./strategic_resources.ts/StrategicResources";

export class RetrainingProgram extends AbstractStrategicProject {
    constructor() {
        super({
            name: "Retraining Program",
            description: "Unlocks card removal at the Barracks (£40 per removal).",
            portraitName: "retraining_program"
        });
        this.surfacePurchaseValue = 120;
        this.flavorText = "Bad habits are beaten out of the men by a sequence of accredited phrenologists.";
    }

    public override getMoneyCost(): number {
        return 120;
    }

    public override getStrategicResourceCost(): StrategicResource[] {
        return [StrategicResource.Hush.ofQuantity(1)];
    }
}
