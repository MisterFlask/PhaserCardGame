import { AbstractStrategicProject } from "./AbstractStrategicProject";

// Capital Works Rebuild (July 2026) — see src/docs/strategic_layer_redesign.md's
// "Amendment: Capital Works Rebuild" table (#5). Roster cap effect is read
// dynamically off ownership by CampaignUiState.getRosterCap() (house rule 6:
// a hook, not a stored increment) — see that method's doc comment.
// No art yet; "" is the documented sentinel for "auto-generate a placeholder"
// (see AssetManifestLint.test.ts / AbstractCard), same as CompanySecretariat.
export class CantonmentAnnexe extends AbstractStrategicProject {
    constructor() {
        super({
            name: "The Cantonment Annexe",
            description: "Increases roster capacity from 8 to [b]10[/b].",
            portraitName: ""
        });
        this.flavorText = "Two additional bunkrooms, one additional chaplain, no additional questions.";
    }

    public override getMoneyCost(): number {
        return 180;
    }
}
