import { AbstractStrategicProject } from "./AbstractStrategicProject";
import { TheDisLegation } from "./TheDisLegation";

// Capital Works Rebuild (July 2026) — see src/docs/strategic_layer_redesign.md's
// "Amendment: Capital Works Rebuild" table (#9). Counts as +16 completed
// contracts toward ContractGenerator.maxActUnlocked's proven-competence act
// gates, read dynamically off ownership by
// CampaignUiState.getEffectiveContractsCompletedForGates (same
// derived-from-ownership pattern as getRosterCap — house rule 6). Useless by
// year 7 (calendar unlocks everything), so it's a tempo purchase. First real
// prerequisite edge in the rebuilt pool (requires The Dis Legation); the
// InvestmentPanel tech tree renders/enforces prerequisites generically.
// No art yet; "" is the documented auto-placeholder sentinel.
export const GRAND_TRUNK_GATE_CREDIT = 16;

export class TheGrandTrunkExtension extends AbstractStrategicProject {
    constructor() {
        super({
            name: "The Grand Trunk Extension",
            description: "Counts as [b]16 completed contracts[/b] toward regional access — deeper regions open to the Company earlier.",
            portraitName: ""
        });
        this.flavorText = "The rail does not go where the market is. The market comes to where the rail is.";
    }

    public override getMoneyCost(): number {
        return 250;
    }

    public override getPrerequisites(): AbstractStrategicProject[] {
        return [new TheDisLegation()];
    }
}
