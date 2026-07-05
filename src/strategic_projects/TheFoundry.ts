import { AbstractStrategicProject } from "./AbstractStrategicProject";
import { StrategicResource } from "./strategic_resources.ts/StrategicResources";

export class TheFoundry extends AbstractStrategicProject {
    constructor() {
        super({
            name: "The Foundry",
            description: "Unlocks card upgrading at the Barracks (£60 per upgrade).",
            portraitName: "the_foundry"
        });
        this.surfacePurchaseValue = 150;
        this.flavorText = "Whitworth-pattern tolerances, demonbone jigs, and a foreman who asks no questions about what the cards are made of.";
    }

    public override getMoneyCost(): number {
        return 150;
    }

    public override getStrategicResourceCost(): StrategicResource[] {
        return [StrategicResource.InfernalMachinery.ofQuantity(1)];
    }
}
