// Pure, Phaser-free. Reputation is derived, not stored: "who remembers what
// you did for you" reduces to the per-client completion count that already
// ships (CampaignUiState.contractsCompletedByClient). See
// src/docs/faction_reputation_design.md — this is the ONE place tier math
// lives (house rule 6); ContractGenerator and the HQ UI both consult it
// rather than re-deriving thresholds themselves.

export enum ClientReputationTier {
    ASSOCIATE = "Associate",
    PREFERRED_CONTRACTOR = "Preferred Contractor",
    CHARTERED_PARTNER = "Chartered Partner",
}

/** Completions needed to unlock that client's retainer Standing Order (see
 *  CampaignUiState.CLIENT_RETAINER_UNLOCK_THRESHOLD, which mirrors this). */
export const PREFERRED_CONTRACTOR_THRESHOLD = 3;
/** Completions needed for the +10% Chartered Partner generation bump. */
export const CHARTERED_PARTNER_THRESHOLD = 6;

/** Chartered Partner payout multiplier (design doc: "+10% payout"). */
export const CHARTERED_PARTNER_PAYOUT_MULTIPLIER = 1.1;

/** Tier for a given client, derived from its completion count. */
export function getClientReputationTier(completions: number): ClientReputationTier {
    if (completions >= CHARTERED_PARTNER_THRESHOLD) return ClientReputationTier.CHARTERED_PARTNER;
    if (completions >= PREFERRED_CONTRACTOR_THRESHOLD) return ClientReputationTier.PREFERRED_CONTRACTOR;
    return ClientReputationTier.ASSOCIATE;
}

/** Convenience lookup against a contractsCompletedByClient map (the shipped
 *  save fact — see CampaignUiState.contractsCompletedByClient). */
export function getReputationTierForClient(
    client: string,
    contractsCompletedByClient: Record<string, number>
): ClientReputationTier {
    return getClientReputationTier(contractsCompletedByClient[client] ?? 0);
}

/** True once a client has reached Chartered Partner (+10% payout tier). */
export function isCharteredPartner(
    client: string,
    contractsCompletedByClient: Record<string, number>
): boolean {
    return getReputationTierForClient(client, contractsCompletedByClient) === ClientReputationTier.CHARTERED_PARTNER;
}

/** Applies the Chartered Partner +10% bump if the client has earned it, then
 *  re-rounds to the nearest £5 (design doc: "apply after all other payout
 *  passes, re-round to £5"). Callers pass the fully Standing-Orders-adjusted
 *  payout as `payout`. */
export function applyCharteredPartnerBonus(
    payout: number,
    client: string,
    contractsCompletedByClient: Record<string, number>
): number {
    if (!isCharteredPartner(client, contractsCompletedByClient)) return payout;
    return Math.round((payout * CHARTERED_PARTNER_PAYOUT_MULTIPLIER) / 5) * 5;
}

/**
 * The most-served client among `eligibleClients`, judged by the tallies map
 * (The Entertainments & Gratuities Ledger, Capital Works Rebuild second
 * wave). Ties break alphabetically; returns null when no eligible client
 * has been served at all (the Ledger no-ops until a retainer client exists
 * on the books). Pure — eligible clients are passed in, never imported.
 */
export function pickMostServedClient(
    tallies: Record<string, number>,
    eligibleClients: string[]
): string | null {
    const served = eligibleClients
        .filter(client => (tallies[client] ?? 0) > 0)
        .sort(); // alphabetical, so the reduce's strict > keeps the earliest name on ties
    if (served.length === 0) return null;
    return served.reduce((best, client) => (tallies[client]! > tallies[best]!) ? client : best);
}
