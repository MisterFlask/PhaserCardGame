import { SpicyLiteratureCargo } from "../gamecharacters/cargo/SpicyLiteratureCargo";
import { PlayableCard } from "../gamecharacters/PlayableCard";
import { AbstractStrategicProject } from "./AbstractStrategicProject";
import { StrategicResource } from "./strategic_resources.ts/StrategicResources";

export class BlueRoomReadingSocieties extends AbstractStrategicProject {
    constructor() {
        super({
            name: "Blue-Room Reading Societies",
            description: "Unlocks Spicy Literature as a usable cargo.",
            portraitName: "blue_room_reading"
        });
        this.surfacePurchaseValue = 250;
        this.flavorText = "Establish a network of exclusive reading clubs throughout Dis.";
    }

    public override getStrategicResourceCost(): StrategicResource[] {
        return [
            StrategicResource.Hush.ofQuantity(1),
            StrategicResource.WhiteflameDistillate.ofQuantity(1)
        ];
    }

    public override getAdditionalCargoOptions(): PlayableCard[] {
        return [new SpicyLiteratureCargo()];
    }
} 