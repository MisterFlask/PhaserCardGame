import { CoalCargo } from "../gamecharacters/cargo/CoalCargo";
import { PlayableCard } from "../gamecharacters/PlayableCard";
import { AbstractStrategicProject } from "./AbstractStrategicProject";
import { StrategicResource } from "./strategic_resources.ts/StrategicResources";

export class PhlegethonCoalfalls extends AbstractStrategicProject {
    constructor() {
        super({
            name: "Phlegethon Coalfalls Loading Cradles",
            description: "Unlocks Coal as a usable cargo.",
            portraitName: "phlegethon_coalfalls"
        });
        this.surfacePurchaseValue = 250;
        this.flavorText = "Secure access to the rich coal deposits of the Phlegethon River.";
    }

    public override getStrategicResourceCost(): StrategicResource[] {
        return [
            StrategicResource.Hush.ofQuantity(1),
            StrategicResource.WhiteflameDistillate.ofQuantity(1)
        ];
    }

    public override getAdditionalCargoOptions(): PlayableCard[] {
        return [new CoalCargo()];
    }
} 