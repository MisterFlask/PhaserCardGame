import { AbstractStrategicProject } from "./AbstractStrategicProject";

// Capital Works Rebuild, second wave (July 2026) — see
// src/docs/strategic_layer_redesign.md's "Second wave" table (#12). Barracks
// drill: £40 grants +20 XP to soldiers below level 4 only — a rebuild pump
// that can't inflate veterans. Wounded/stressed soldiers may drill (ruling).
// Promotions surface via the existing derived pending-level flow (PROMOTE
// action / debrief) — the drill never resolves levels itself.
// Art lives in Sprites/StrategicProjects/school_of_musketry.png (art pass,
// July 2026).
export const DRILL_COST = 40;
export const DRILL_XP = 20;
export const DRILL_MAX_LEVEL = 4;

export class SchoolOfMusketry extends AbstractStrategicProject {
    constructor() {
        super({
            name: "The School of Musketry & Applied Blasphemy",
            description: "Unlocks drill at the Barracks: [b]£40[/b] grants a soldier below level 4 [b]+20 XP[/b].",
            portraitName: "school_of_musketry"
        });
        this.flavorText = "The curriculum is one week of marksmanship and eleven weeks of learning which prayers make it worse.";
    }

    public override getMoneyCost(): number {
        return 240;
    }
}
