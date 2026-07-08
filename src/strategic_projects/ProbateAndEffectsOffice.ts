import { AbstractStrategicProject } from "./AbstractStrategicProject";
import { ThePatternRoom } from "./ThePatternRoom";

// Capital Works Rebuild (July 2026) — see src/docs/strategic_layer_redesign.md's
// "Amendment: Capital Works Rebuild" table (#3) and the Rulings section
// (probate ordering: fires on FINAL death only — immediately when the Soul
// Collateral Office isn't owned, or on escrow forfeit). Decision logic lives
// in the pure module src/campaign/DeathSettlement.ts; the archive itself is
// CampaignUiState.cardArchive (one owner); the bequest action lives at the
// Barracks (BarracksPanel). No art yet; "" is the documented
// auto-placeholder sentinel.
export const PROBATE_ARCHIVE_CAP = 12;
export const BEQUEST_COST = 30;

export class ProbateAndEffectsOffice extends AbstractStrategicProject {
    constructor() {
        super({
            name: "The Probate & Effects Office",
            description: "A dead soldier's cards pass to the Company Archive (capacity 12). Bequeath archived cards to serving soldiers at the Barracks ([b]£30[/b] per bequest).",
            portraitName: ""
        });
        this.flavorText = "Grief is not an asset class. The effects of the deceased, however, are.";
    }

    public override getMoneyCost(): number {
        return 200;
    }

    public override getPrerequisites(): AbstractStrategicProject[] {
        return [new ThePatternRoom()];
    }
}
