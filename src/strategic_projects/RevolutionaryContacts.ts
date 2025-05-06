import { RevolutionaryLiteratureCargo } from "../gamecharacters/cargo/RevolutionaryLiteratureCargo";
import { PlayableCard } from "../gamecharacters/PlayableCard";
import { AbstractStrategicProject } from "./AbstractStrategicProject";
import { StrategicResource } from "./strategic_resources.ts/StrategicResources";

export class RevolutionaryContacts extends AbstractStrategicProject {
    constructor() {
        super({
            name: "Revolutionary Contacts",
            description: "Unlocks Revolutionary Literature as a usable cargo.",
            portraitName: "revolutionary_contacts"
        });
        this.surfacePurchaseValue = 300;
        this.flavorText = "Establish connections with underground revolutionary cells throughout Dis.";
    }

    public override getStrategicResourceCost(): StrategicResource[] {
        return [
            StrategicResource.Hush.ofQuantity(2),
            StrategicResource.WhiteflameDistillate.ofQuantity(1)
        ];
    }

    public override getAdditionalCargoOptions(): PlayableCard[] {
        return [new RevolutionaryLiteratureCargo()];
    }
} 