import { ESCROW_DEADLINE_WEEKS } from "../campaign/ContractGenerator";
import { AbstractStrategicProject } from "./AbstractStrategicProject";
import { ProbateAndEffectsOffice } from "./ProbateAndEffectsOffice";

// Capital Works Rebuild (July 2026) — see src/docs/strategic_layer_redesign.md's
// "Amendment: Capital Works Rebuild" table (#4) and the binding Rulings
// section: the witness rule (no escrow on a full squad wipe), escrow scope
// (one Recovery contract per lost sortie, recovering all of that sortie's
// souls; escrowed soldiers leave the roster and may return over the cap),
// and relic settlement (relics settle as on death — the soul comes back, the
// kit doesn't). Decision logic: src/campaign/DeathSettlement.ts. Escrow
// state: CampaignUiState.escrowedSouls (one owner). ESCROW_DEADLINE_WEEKS is
// DEFINED in ContractGenerator.ts (generateRecoveryContract consumes it;
// campaign/ can never import this Phaser-tainted module — house rule 1) and
// re-exported here, same pattern as TheDisLegation's LEGATION constants.
// No art yet; "" is the documented auto-placeholder sentinel.
export { ESCROW_DEADLINE_WEEKS };
export const ESCROW_RECOVERY_WOUND_WEEKS = 4;
export const ESCROW_RECOVERY_STRESS = 25;

export class SoulCollateralOffice extends AbstractStrategicProject {
    constructor() {
        super({
            name: "The Soul Collateral Office",
            description: "A soldier killed on a won sortie is held in escrow: a Recovery contract posts with an [b]8-week deadline[/b]. Complete it to reclaim them — wounded, shaken, and on the books. Squad wipes are not covered.",
            portraitName: ""
        });
        this.flavorText = "The men sign the collateral clause on their first day. Most of them even read it.";
    }

    public override getMoneyCost(): number {
        return 350;
    }

    public override getPrerequisites(): AbstractStrategicProject[] {
        return [new ProbateAndEffectsOffice()];
    }
}
