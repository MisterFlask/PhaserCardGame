// Pure, Phaser-free. Sibling of Factions.ts. See
// src/docs/faction_reputation_design.md, "Amendment: Union Retaliation
// (v2.1)" — the Dis Stokers' Union has no clients (Factions.ts: "Labor does
// not commission mercenaries"), so blacklisting can never touch it; its
// only weapon is labor, and its retaliation is therefore derived PRESSURE
// at consult time, not stored events. Still zero stored state, still no
// SAVE_FORMAT_VERSION bump: every function here re-derives from the same
// contractsCompletedByClient map Factions.ts already reads. Penalties
// self-lift if Union standing ever recovers (it can't today — détente is
// shelved because it needs stored state, see the design doc's balance
// note). Applied AFTER the StandingOrdersState pass everywhere, same
// discipline as the Chartered Partner bonus (ClientReputation.ts).

import { BLACKLISTED_STANDING_THRESHOLD, Faction, FactionHostilityTier, getFactionStanding, getHostilityTier, HOSTILE_STANDING_THRESHOLD } from "./Factions";

/** Balance-pass sketch numbers, untested against the economy sim — see
 *  EncounterHardening.ts's convention. The sim calls refillBoard/generation
 *  without contractsCompletedByClient (CampaignSimulator.ts), so this whole
 *  module is sim-invisible by construction, same as faction blacklisting. */
export const UNION_RECRUIT_COST_MULTIPLIER = 1.25;
export const UNION_THERAPY_COST_MULTIPLIER = 1.25;
export const UNION_WOUND_WEEKS_PENALTY = 1;
export const UNION_ORDER_SLOT_PENALTY = 1;
export const UNION_FREIGHT_PENALTY_PER_CRATE = 10;
export const UNION_FREIGHT_RATE_FLOOR = 5;
/** A real TRADE_RUN region name (ContractGenerator's TRADE_RUN_REGIONS) —
 *  keep this a registry constant, not an inline string, at every call site. */
export const UNION_TERRITORY_REGION = "Dis Foundry Belt";

/** The Union's own hostility tier, derived the same way as any other
 *  faction's (Factions.getHostilityTier over Factions.getFactionStanding). */
export function unionHostilityTier(contractsCompletedByClient: Record<string, number>): FactionHostilityTier {
    return getHostilityTier(getFactionStanding(Faction.STOKERS_UNION, contractsCompletedByClient));
}

/** True at Blacklisted or Hostile — the "Union rates" tier and everything
 *  worse than it (design doc pressure table). */
export function unionLaborFrictionActive(contractsCompletedByClient: Record<string, number>): boolean {
    return getFactionStanding(Faction.STOKERS_UNION, contractsCompletedByClient) <= BLACKLISTED_STANDING_THRESHOLD;
}

/** True at Hostile only — "the labor question" tier (slot suspension, freight). */
export function unionHostile(contractsCompletedByClient: Record<string, number>): boolean {
    return getFactionStanding(Faction.STOKERS_UNION, contractsCompletedByClient) <= HOSTILE_STANDING_THRESHOLD;
}

/** Recruit cost x1.25 once labor friction is active, re-rounded to £5
 *  (house £ register). No-op (fast path) on an empty map, like
 *  Factions.filterBlacklistedTemplates. */
export function unionRecruitCost(base: number, contractsCompletedByClient: Record<string, number>): number {
    if (Object.keys(contractsCompletedByClient).length === 0) return base;
    if (!unionLaborFrictionActive(contractsCompletedByClient)) return base;
    return Math.round((base * UNION_RECRUIT_COST_MULTIPLIER) / 5) * 5;
}

/** Therapy cost x1.25 once labor friction is active, re-rounded to £5.
 *  Same shape as unionRecruitCost — the stretcher-bearers, porters, and
 *  orderlies are all union men, and they have been told about you. */
export function unionTherapyCost(base: number, contractsCompletedByClient: Record<string, number>): number {
    if (Object.keys(contractsCompletedByClient).length === 0) return base;
    if (!unionLaborFrictionActive(contractsCompletedByClient)) return base;
    return Math.round((base * UNION_THERAPY_COST_MULTIPLIER) / 5) * 5;
}

/** +1 wound-recovery week once labor friction is active. */
export function unionWoundWeeks(base: number, contractsCompletedByClient: Record<string, number>): number {
    if (Object.keys(contractsCompletedByClient).length === 0) return base;
    if (!unionLaborFrictionActive(contractsCompletedByClient)) return base;
    return base + UNION_WOUND_WEEKS_PENALTY;
}

/** Standing Order slots suspended while Hostile — 0 otherwise. Callers add
 *  the floor themselves (StandingOrdersState.slotsForYear: the Company
 *  always keeps one order running). */
export function unionOrderSlotPenalty(contractsCompletedByClient: Record<string, number>): number {
    if (Object.keys(contractsCompletedByClient).length === 0) return 0;
    return unionHostile(contractsCompletedByClient) ? UNION_ORDER_SLOT_PENALTY : 0;
}

/** Dis Foundry Belt trade-run freight -£10/crate at generation while
 *  Hostile, floored at £5/crate ("crates get mishandled"). Every other
 *  region, and every non-Hostile standing, passes `base` through unchanged. */
export function unionFreightRatePerCrate(
    base: number,
    regionName: string,
    contractsCompletedByClient: Record<string, number>
): number {
    if (Object.keys(contractsCompletedByClient).length === 0) return base;
    if (regionName !== UNION_TERRITORY_REGION) return base;
    if (!unionHostile(contractsCompletedByClient)) return base;
    return Math.max(UNION_FREIGHT_RATE_FLOOR, base - UNION_FREIGHT_PENALTY_PER_CRATE);
}
