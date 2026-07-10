import { AbstractStrategicProject } from "./AbstractStrategicProject";

// Capital Works Rebuild (July 2026) — see src/docs/strategic_layer_redesign.md's
// "Amendment: Capital Works Rebuild" table (#2). Replaces Retraining Program
// (deleted). Barracks gate: see BarracksPanel's REMOVAL_GATE, which now
// names this class. Art lives in
// Sprites/StrategicProjects/phrenology_wing.png (art pass, July 2026).
export class CorrectivePhrenologyWing extends AbstractStrategicProject {
    constructor() {
        super({
            name: "The Corrective Phrenology Wing",
            description: "Unlocks card removal at the Barracks (£40 per removal).",
            portraitName: "phrenology_wing"
        });
        this.flavorText = "The skull is a ledger like any other. Erroneous entries may be struck through by a licensed practitioner.";
    }

    public override getMoneyCost(): number {
        return 120;
    }
}
