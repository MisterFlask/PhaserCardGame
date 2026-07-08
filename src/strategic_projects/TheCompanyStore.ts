import { GameState } from "../rules/GameState";
import { AbstractStrategicProject, QuarterEndContext } from "./AbstractStrategicProject";

// Capital Works Rebuild (July 2026) — see src/docs/strategic_layer_redesign.md's
// "Amendment: Capital Works Rebuild" table (#6). No art yet; "" is the
// documented sentinel for "auto-generate a placeholder" (see
// AssetManifestLint.test.ts / AbstractCard), same as CompanySecretariat.
export const COMPANY_STORE_INCOME_PER_SOLDIER = 8;

export class TheCompanyStore extends AbstractStrategicProject {
    constructor() {
        super({
            name: "The Company Store",
            description: "Each board meeting, recovers [b]£8 per rostered soldier[/b] in scrip.",
            portraitName: ""
        });
        this.flavorText = "The men are paid in pounds and spend in scrip. The difference is entered under 'loyalty', and it is bankable.";
    }

    public override getMoneyCost(): number {
        return 220;
    }

    public override onQuarterEnd(ctx: QuarterEndContext): void {
        GameState.getInstance().moneyInVault += ctx.rosterSize * COMPANY_STORE_INCOME_PER_SOLDIER;
    }
}
