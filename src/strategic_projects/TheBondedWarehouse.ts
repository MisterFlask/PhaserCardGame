import { AbstractStrategicProject } from "./AbstractStrategicProject";

// Capital Works Rebuild, second wave (July 2026) — see
// src/docs/strategic_layer_redesign.md's "Second wave" table (#13). Raises
// the consumable stock cap from MAX_CONSUMABLE_STOCK (3) to 6, read
// dynamically off ownership by CampaignUiState.getConsumableStockCap()
// (roster-cap pattern). ConsumableStock.ts stays pure and project-ignorant:
// mergeStockWithLoadout takes the cap as a parameter.
// Art lives in Sprites/StrategicProjects/bonded_warehouse.png (art pass,
// July 2026).
export const WAREHOUSE_STOCK_BONUS = 3;

export class TheBondedWarehouse extends AbstractStrategicProject {
    constructor() {
        super({
            name: "The Bonded Warehouse",
            description: "Raises consumable stock capacity from 3 to [b]6[/b].",
            portraitName: "bonded_warehouse"
        });
        this.flavorText = "The excise man is welcome to inspect anything he can find.";
    }

    public override getMoneyCost(): number {
        return 150;
    }
}
