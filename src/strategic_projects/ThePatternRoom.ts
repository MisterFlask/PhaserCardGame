import { AbstractStrategicProject } from "./AbstractStrategicProject";

// Capital Works Rebuild (July 2026) — see src/docs/strategic_layer_redesign.md's
// "Amendment: Capital Works Rebuild" table (#1). Replaces The Foundry
// (deleted; same portrait reused per the amendment's "Portrait reuse" ruling).
// Barracks gate: see BarracksPanel's UPGRADE_GATE, which now names this class.
export class ThePatternRoom extends AbstractStrategicProject {
    constructor() {
        super({
            name: "The Pattern Room",
            description: "Unlocks card upgrading at the Barracks (£60 per upgrade).",
            portraitName: "the_foundry"
        });
        this.flavorText = "Whitworth gauges, demonbone jigs, and a standing rule against asking what the tolerances are for.";
    }

    public override getMoneyCost(): number {
        return 150;
    }
}
