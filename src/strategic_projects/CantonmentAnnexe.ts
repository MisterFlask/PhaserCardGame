import { AbstractStrategicProject } from "./AbstractStrategicProject";

// Capital Works Rebuild (July 2026) — see src/docs/strategic_layer_redesign.md's
// "Amendment: Capital Works Rebuild" table (#5). Roster cap effect is read
// dynamically off ownership by CampaignUiState.getRosterCap() (house rule 6:
// a hook, not a stored increment) — see that method's doc comment.
// Art lives in Sprites/StrategicProjects/cantonment_annexe.png (art pass,
// July 2026).
export class CantonmentAnnexe extends AbstractStrategicProject {
    constructor() {
        super({
            name: "The Cantonment Annexe",
            description: "Increases roster capacity from 8 to [b]10[/b].",
            portraitName: "cantonment_annexe"
        });
        this.flavorText = "Two additional bunkrooms, one additional chaplain, no additional questions.";
    }

    public override getMoneyCost(): number {
        return 180;
    }
}
