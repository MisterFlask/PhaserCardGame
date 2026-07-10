import { AbstractStrategicProject } from "./AbstractStrategicProject";

// Capital Works Rebuild, second wave (July 2026) — see
// src/docs/strategic_layer_redesign.md's "Second wave" table (#10). The
// retire action lives at the Barracks (BarracksPanel, arm-confirm since it's
// irreversible); banked VP land on the OWNED instance's victoryPoints — the
// same per-project serialization path as The Company Gazette. Cannot retire
// the last roster soldier; the wounded may be retired.
// Art lives in Sprites/StrategicProjects/testimonials_board.png (art pass,
// July 2026).
export const TESTIMONIAL_VP_PER_LEVEL = 20;

export class LongServiceTestimonialsBoard extends AbstractStrategicProject {
    constructor() {
        super({
            name: "The Long Service & Testimonials Board",
            description: "Unlocks retirement at the Barracks: a retired soldier banks [b]20 Victory Points per level[/b] and leaves the wage ledger.",
            portraitName: "testimonials_board"
        });
        this.flavorText = "A gold watch, a printed citation, and a quiet redaction from the wage ledger.";
    }

    public override getMoneyCost(): number {
        return 260;
    }
}
