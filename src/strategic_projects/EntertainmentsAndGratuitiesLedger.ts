import { pickMostServedClient } from "../campaign/ClientReputation";
import { AbstractStrategicProject, QuarterEndContext } from "./AbstractStrategicProject";

// Capital Works Rebuild, second wave (July 2026) — see
// src/docs/strategic_layer_redesign.md's "Second wave" table (#14). Each
// board meeting, credits one completed contract toward the Company's
// most-served retainer client (ties alphabetical; no-op before any retainer
// client has been served). Ruling: gratuities are genuine relationship
// credit — the ctx.creditClientRelationship hook mutates the one owner
// (CampaignUiState.contractsCompletedByClient), advancing retainer unlocks
// AND Chartered Partner status; the raw contractsCompleted total (act
// gates, telemetry) is untouched. Client selection is pure
// (ClientReputation.pickMostServedClient); eligible clients ride in on
// ctx.retainerClients — this class never imports CampaignUiState.
// No art yet; "" is the documented auto-placeholder sentinel.
export const GRATUITIES_CREDIT_PER_QUARTER = 1;

export class EntertainmentsAndGratuitiesLedger extends AbstractStrategicProject {
    constructor() {
        super({
            name: "The Entertainments & Gratuities Ledger",
            description: "Each board meeting, credits one completed contract toward the Company's most-served client's retainer.",
            portraitName: ""
        });
        this.flavorText = "Officially, the line item is 'stationery.'";
    }

    public override getMoneyCost(): number {
        return 220;
    }

    public override onQuarterEnd(ctx: QuarterEndContext): void {
        const client = pickMostServedClient(ctx.contractsCompletedByClient, ctx.retainerClients);
        if (!client) return;
        ctx.creditClientRelationship(client, GRATUITIES_CREDIT_PER_QUARTER);
    }
}
