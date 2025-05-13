import { AbstractCard } from "../gamecharacters/AbstractCard";

import { Team } from "../gamecharacters/AbstractCard";
import { PlayableCard } from "../gamecharacters/PlayableCard";
import { CardType } from "../gamecharacters/Primitives";
import { StrategicResource } from "./strategic_resources.ts/StrategicResources";

export abstract class AbstractStrategicProject extends AbstractCard {

    public isOwned: boolean = false;

    constructor({ name, description, portraitName }: { name: string; description: string; portraitName?: string }) {
        super({
            name,
            description,
            portraitName,
            cardType: CardType.SKILL,
            team: Team.ALLY
        });
    }

    public getMoneyCost(): number {
        return 100;
    }

    public getPrerequisites(): AbstractStrategicProject[] {
        return [];
    }
    
    public getStrategicResourceCost(): StrategicResource[]
    {
        return [
            StrategicResource.InfernalMachinery.ofQuantity(1),
            StrategicResource.WhiteflameDistillate.ofQuantity(2),
        ];
    }

    public getAdditionalCargoOptions(): PlayableCard[] {
        return [];
    }

    public postProcessCampaignStateAfterRun(): void{

    }
}
