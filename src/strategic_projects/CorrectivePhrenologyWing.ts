import { AbstractStrategicProject } from "./AbstractStrategicProject";

// Capital Works Rebuild (July 2026) — see src/docs/strategic_layer_redesign.md's
// "Amendment: Capital Works Rebuild" table (#2). Replaces Retraining Program
// (deleted; same portrait reused per the amendment's "Portrait reuse" ruling).
// Barracks gate: see BarracksPanel's REMOVAL_GATE, which now names this class.
export class CorrectivePhrenologyWing extends AbstractStrategicProject {
    constructor() {
        super({
            name: "The Corrective Phrenology Wing",
            description: "Unlocks card removal at the Barracks (£40 per removal).",
            portraitName: "retraining_program"
        });
        this.flavorText = "The skull is a ledger like any other. Erroneous entries may be struck through by a licensed practitioner.";
    }

    public override getMoneyCost(): number {
        return 120;
    }
}
