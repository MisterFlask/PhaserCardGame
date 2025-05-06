import { OpiumCargo } from "../gamecharacters/cargo/OpiumCargo";
import { PlayableCard } from "../gamecharacters/PlayableCard";
import { AbstractStrategicProject } from "./AbstractStrategicProject";
import { StrategicResource } from "./strategic_resources.ts/StrategicResources";

export class SmytheBowyerPoppyFields extends AbstractStrategicProject {
    constructor() {
        super({
            name: "Smythe-Bowyer Poppy Fields Concession",
            description: "Unlocks Opium as a usable cargo.",
            portraitName: "smythe_bowyer_poppy_fields"
        });
        this.surfacePurchaseValue = 300;
        this.flavorText = "Secure exclusive rights to cultivate and trade the finest infernal poppies.";
    }

    public override getStrategicResourceCost(): StrategicResource[] {
        return [
            StrategicResource.Hush.ofQuantity(2),
            StrategicResource.WhiteflameDistillate.ofQuantity(1)
        ];
    }

    public override getAdditionalCargoOptions(): PlayableCard[] {
        return [new OpiumCargo()];
    }
} 