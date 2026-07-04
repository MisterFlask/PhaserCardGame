import { GameState } from "../rules/GameState";
import { AbstractStrategicProject } from "./AbstractStrategicProject";
import { StrategicResource } from "./strategic_resources.ts/StrategicResources";

export class OurManInDis extends AbstractStrategicProject {
    constructor() {
        super({
            name: "Our Man In Dis",
            description: "Gain £35 in the vault each quarter.",
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

    // Interim effect until faction embassies exist (see strategic_layer_redesign.md,
    // where this becomes the Dis embassy with a free scouted contract per quarter).
    public override onQuarterEnd(): void {
        const gameState = GameState.getInstance();
        gameState.moneyInVault += 35;
    }
} 