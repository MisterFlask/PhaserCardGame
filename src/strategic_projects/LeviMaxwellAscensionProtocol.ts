// The "build tall" identity pick (src/docs/vp_endgame_design.md, deferred
// capstone). Originally shipped as a cargo/Light Capital Work, pulled from
// the purchasable pool by the Standing Orders amendment and earmarked there
// as "parked for v2 VP capstone" (src/docs/strategic_layer_redesign.md's
// retrofit table) — this file is that repurposing, not a new project. The
// old cargo-buff effect (LeviMaxwellAscensionProtocolBuff) is retired
// entirely; nothing else referenced it (grepped clean before deletion).
//
// A three-stage Capital Work: each stage gated one full campaign year after
// the previous stage's purchase (AbstractStrategicProject.canPurchaseNextStage).
// Completing stage 3 grants 2500 VP in one lump via the `victoryPoints` field
// EndOfCampaignPanel already sums across owned projects — no new score-path
// plumbing needed. Available in the purchasable pool from year 4+ only (see
// StrategicProjectList.ts's isYearGatedProjectAvailable — no existing
// mechanism gates pool *availability* by year, so the gate lives on
// purchasability instead; noted in the delivery report).

import { AbstractStrategicProject } from "./AbstractStrategicProject";
import { StrategicResource } from "./strategic_resources.ts/StrategicResources";

/** Total VP payout on stage-3 completion. Deliberately far richer than any
 *  other single VP source (Prestige Commissions top out well under 500;
 *  Charter Buyback needs ~£1900 retired for the same total) — the capstone
 *  is meant to be the biggest single score swing in the game, paid for with
 *  three full years of dedicated capital (~£1250 total) that could otherwise
 *  have gone to roster growth or buyback blocks. */
export const LEVI_MAXWELL_ASCENSION_VP_REWARD = 2500;

export class LeviMaxwellAscensionProtocol extends AbstractStrategicProject {
    constructor() {
        super({
            name: "Levi-Maxwell Ascension Protocol",
            description: "A three-stage Capital Work. Completing all three stages grants [b]2500 Victory Points[/b].",
            portraitName: "levi_maxwell_ascension_protocol"
        });
        this.flavorText = "The board does not ask what the Company ascends to. It asks only that the minutes record the vote as unanimous.";
        this.stages = [
            {
                name: "The Calculating Engine",
                cost: 400,
                description: "A brass difference engine, fed on Company ledgers, begins computing something none of the actuaries recognize as accounting.",
            },
            {
                name: "The Resonance Array",
                cost: 400,
                description: "Whiteflame coils tuned to the Engine's output hum in a register that makes junior clerks weep without knowing why.",
            },
            {
                name: "Ascension",
                cost: 450,
                description: "The Company transcends its charter. The board records its satisfaction in the driest terms available to it, which is the only kind of awe it permits itself.",
            },
        ];
    }

    public override getStrategicResourceCost(): StrategicResource[] {
        return [
            StrategicResource.Hush.ofQuantity(2),
            StrategicResource.WhiteflameDistillate.ofQuantity(1)
        ];
    }

    public override onStagePurchased(stageNumber: number): void {
        if (stageNumber === this.stages!.length) {
            this.victoryPoints += LEVI_MAXWELL_ASCENSION_VP_REWARD;
        }
    }
}
