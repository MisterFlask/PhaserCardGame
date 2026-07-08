// Pure, Phaser-free. Sibling of ClientReputation.ts: v1 answers "which
// clients remember you," v2 (this module) answers "whose side does that
// put you on." Same philosophy — standing is derived, not stored, from the
// per-client completion count that already ships
// (CampaignUiState.contractsCompletedByClient). See
// src/docs/faction_reputation_design.md, "Amendment: Faction Relationships
// v2" — this is the ONE place the client->faction map and the hostility
// tier math live (house rule 6); ContractGenerator and the HQ UI both
// consult it rather than re-deriving either.

/** Every faction the client roster can implicate the Company with. Basalt
 *  Courts and Cloggers are declared-but-clientless content hooks (future
 *  acts: aristocratic-favor contracts, Dutch vendor stock) — see the
 *  design doc's faction table. */
export enum Faction {
    BRITISH_CROWN = "The British Crown",
    BOATMENS_GUILD = "The Styxian Boatmen's Guild",
    REICHSINFERNOKORPS = "The Reichsinfernokorps",
    EMPIRE_UNDYING = "The Empire Undying",
    BRIMSTONE_BARONS = "The Brimstone Barons",
    DIS_OVERSEERS = "The Dis Board of Overseers",
    UNDERWRITERS_POOL = "The Underwriters' Pool",
    IRON_CHOIR = "The Iron Choir",
    STOKERS_UNION = "The Dis Stokers' Union",
    // Content hooks, no clients yet (design doc): declared so future
    // registrations have a home, never assigned a client.
    BASALT_COURTS = "The Basalt Courts",
    CLOGGERS = "The Cloggers",
}

/** Client string -> faction, byte-for-byte against ContractGenerator's
 *  template clients. "The Court of Directors" (internal, Prestige
 *  Commissions only) is deliberately absent — same pattern as
 *  CLIENT_RETAINER_ORDER_IDS having no entry for it. The Dis Stokers'
 *  Union has no clients at all and never will (design doc: "Labor does
 *  not commission mercenaries"); it exists in this registry only as a
 *  rivalry target. */
export const CLIENT_FACTIONS: Record<string, Faction> = {
    "The Styx Dam Project Office": Faction.BRITISH_CROWN,
    "The British Trade Delegation, Delta Office": Faction.BRITISH_CROWN,
    "The British Trade Delegation, Continental Office": Faction.BRITISH_CROWN,

    "Styx Delta Ferry & Lighterage Company": Faction.BOATMENS_GUILD,

    "Reichsinfernokorps Liaison Office": Faction.REICHSINFERNOKORPS,
    // Ruling (design doc): the commercial face of the German concession
    // system — its contracts fight the Emperor's revenant auditors, and
    // the Liaison Office "would rather not admit the concession exists."
    "Deep France Concession Holdings": Faction.REICHSINFERNOKORPS,

    "Maison Vachon, Purveyors to the Front": Faction.EMPIRE_UNDYING,

    "Brimstone Barons Equipment Leasing Consortium": Faction.BRIMSTONE_BARONS,
    "The Brimstone Barons, jointly": Faction.BRIMSTONE_BARONS,

    "Dis Foundry Belt Board of Overseers": Faction.DIS_OVERSEERS,

    // Insurers profit from everyone's disasters and hold no grudges — the
    // deliberately always-open fallback (design doc).
    "Infernal Marine & Postal Underwriters, Ltd.": Faction.UNDERWRITERS_POOL,
    "Continental Casualty & Ossuary Underwriters": Faction.UNDERWRITERS_POOL,

    "The Iron Choir, per its Concordat": Faction.IRON_CHOIR,
};

/** Static rivalry pairs — the acts' conflicts, plus labor (design doc:
 *  "Rejected, not deferred": no live faction-to-faction dynamics, no war
 *  ticker). Symmetric by construction; rivalsOf() reads both directions. */
export const RIVALRIES: ReadonlyArray<readonly [Faction, Faction]> = [
    [Faction.BRITISH_CROWN, Faction.BOATMENS_GUILD],
    [Faction.EMPIRE_UNDYING, Faction.REICHSINFERNOKORPS],
    [Faction.BRIMSTONE_BARONS, Faction.STOKERS_UNION],
    [Faction.DIS_OVERSEERS, Faction.STOKERS_UNION],
];

/** Faction for a client string, or undefined for internal/unmapped
 *  clients (e.g. "The Court of Directors"). */
export function getFactionForClient(client: string): Faction | undefined {
    return CLIENT_FACTIONS[client];
}

/** Both directions of every rivalry pair involving `faction`. */
export function rivalsOf(faction: Faction): Faction[] {
    const rivals: Faction[] = [];
    for (const [a, b] of RIVALRIES) {
        if (a === faction) rivals.push(b);
        else if (b === faction) rivals.push(a);
    }
    return rivals;
}

/** standing(F) = completions for F's clients - completions for F's
 *  rivals' clients, derived entirely from the shipped
 *  contractsCompletedByClient (design doc, "Standing (derived)"). */
export function getFactionStanding(
    faction: Faction,
    contractsCompletedByClient: Record<string, number>
): number {
    let standing = 0;
    for (const [client, factionForClient] of Object.entries(CLIENT_FACTIONS)) {
        const completions = contractsCompletedByClient[client] ?? 0;
        if (completions === 0) continue;
        if (factionForClient === faction) {
            standing += completions;
        } else if (rivalsOf(faction).includes(factionForClient)) {
            standing -= completions;
        }
    }
    return standing;
}

/** Standing thresholds for the hostility ladder (design doc). Hostile
 *  (<= -9) is deferred to v2.1 and deliberately NOT stubbed here — no
 *  enum member, no threshold constant. */
export const NOTED_STANDING_THRESHOLD = -3;
export const BLACKLISTED_STANDING_THRESHOLD = -6;

export enum FactionHostilityTier {
    CORDIAL = "Cordial",
    NOTED = "Noted",
    BLACKLISTED = "Blacklisted",
}

/** Tier for a given standing value. */
export function getHostilityTier(standing: number): FactionHostilityTier {
    if (standing <= BLACKLISTED_STANDING_THRESHOLD) return FactionHostilityTier.BLACKLISTED;
    if (standing <= NOTED_STANDING_THRESHOLD) return FactionHostilityTier.NOTED;
    return FactionHostilityTier.CORDIAL;
}

/** True once a faction's standing has fallen to Blacklisted. */
export function isFactionBlacklisted(
    faction: Faction,
    contractsCompletedByClient: Record<string, number>
): boolean {
    return getHostilityTier(getFactionStanding(faction, contractsCompletedByClient)) === FactionHostilityTier.BLACKLISTED;
}

/** True if the client's faction is Blacklisted. False for unmapped
 *  clients (internal clients have no faction to blacklist). */
export function isClientBlacklisted(
    client: string,
    contractsCompletedByClient: Record<string, number>
): boolean {
    const faction = getFactionForClient(client);
    if (faction === undefined) return false;
    return isFactionBlacklisted(faction, contractsCompletedByClient);
}

/** Rivals of the client's faction — the factions a contract for this
 *  client "Offends" (design doc, "The notice line"). Empty for unmapped
 *  clients and for clients whose faction has no rivals. */
export function offendedFactionsForClient(client: string): Faction[] {
    const faction = getFactionForClient(client);
    if (faction === undefined) return [];
    return rivalsOf(faction);
}

/** Filters out templates whose client's faction is Blacklisted. If that
 *  would empty the list, returns the ORIGINAL list unchanged (design doc:
 *  "commerce forgives necessity" — with the current client tables every
 *  region pool holds at least one never-negative client, so this branch
 *  is provably unreachable today; it's guarded here for future content
 *  that might not preserve that property). */
export function filterBlacklistedTemplates<T extends { client: string }>(
    templates: T[],
    contractsCompletedByClient: Record<string, number>
): T[] {
    // Fast path: with no completions recorded, every faction is Cordial
    // (getFactionStanding is 0 everywhere), so nothing can be blacklisted.
    // This is called on every bounty/trade-run generation — including every
    // sim tick, which always passes {} (see CampaignSimulator's RNG-
    // discipline note) — so skipping the standing recompute here matters.
    if (Object.keys(contractsCompletedByClient).length === 0) return templates;
    const filtered = templates.filter(t => !isClientBlacklisted(t.client, contractsCompletedByClient));
    return filtered.length > 0 ? filtered : templates;
}
