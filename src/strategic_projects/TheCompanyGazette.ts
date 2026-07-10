import { Contract } from "../campaign/Contract";
import { AbstractStrategicProject } from "./AbstractStrategicProject";

// Capital Works Rebuild (July 2026) — see src/docs/strategic_layer_redesign.md's
// "Amendment: Capital Works Rebuild" table (#7). Replaces Lethe Extraction
// Co.'s passive VP drip: scoring is now tied to contract activity instead of
// the calendar. Art lives in Sprites/StrategicProjects/company_gazette.png
// (art pass, July 2026).
export const GAZETTE_VP_PER_CONTRACT = 20;

export class TheCompanyGazette extends AbstractStrategicProject {
    constructor() {
        super({
            name: "The Company Gazette",
            description: "Banks [b]20 Victory Points[/b] for every contract completed while owned.",
            portraitName: "company_gazette"
        });
        this.flavorText = "A newspaper wholly owned by its only subject. Failures are not news.";
    }

    public override getMoneyCost(): number {
        return 300;
    }

    public override onContractCompleted(contract: Contract): void {
        this.victoryPoints += GAZETTE_VP_PER_CONTRACT;
    }
}
