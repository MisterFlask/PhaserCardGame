import { ContractGenerator, LEGATION_DEADLINE_WEEKS, LEGATION_PAYOUT_MULTIPLIER } from "../campaign/ContractGenerator";
import { AbstractStrategicProject, QuarterEndContext } from "./AbstractStrategicProject";

// Capital Works Rebuild (July 2026) — see src/docs/strategic_layer_redesign.md's
// "Amendment: Capital Works Rebuild" table (#8). Each board meeting posts one
// exclusive Legation contract at the current best act: payout ×1.4, 12-week
// deadline, flagged exemptFromBoardSlots so it never squeezes the 5-slot
// public board. The tuning constants are DEFINED in ContractGenerator.ts
// (generateLegationContract consumes them, and campaign/ must never import
// this Phaser-tainted module — house rule 1) and re-exported here so the
// amendment's "named exports, sim-checkable" ruling still points at this file.
// No art yet; the old our_man_in_dis key was itself missing art (allowlisted
// in AssetManifestLint), so "" — the documented auto-placeholder sentinel —
// is used rather than reusing a broken key.
export { LEGATION_DEADLINE_WEEKS, LEGATION_PAYOUT_MULTIPLIER };

export class TheDisLegation extends AbstractStrategicProject {
    constructor() {
        super({
            name: "The Dis Legation",
            description: "Each board meeting, the Legation secures one exclusive contract at [b]+40% payout[/b], over and above the public board.",
            portraitName: ""
        });
        this.flavorText = "The attaché speaks thirteen infernal dialects and bills in all of them.";
    }

    public override getMoneyCost(): number {
        return 300;
    }

    public override onQuarterEnd(ctx: QuarterEndContext): void {
        const contract = ContractGenerator.getInstance().generateLegationContract(
            ctx.year, ctx.contractsCompletedForGates, ctx.contractsCompletedByClient);
        ctx.postContract(contract);
    }
}
