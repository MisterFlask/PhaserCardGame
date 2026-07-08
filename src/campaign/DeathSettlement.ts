// Pure death-settlement rules (Capital Works Rebuild Batch C — see
// src/docs/strategic_layer_redesign.md's amendment table #3/#4 and the
// binding Rulings section). No Phaser, no singletons, unit-testable —
// same convention as SortieResolution.ts. Callers (SortieManager,
// CampaignUiState) APPLY the plan; this module only decides it.

/** What the sortie's death settlement decided. All lists carry soldier names. */
export interface DeathSettlementPlan {
    /** Souls held by the Soul Collateral Office pending recovery. */
    escrow: string[];
    /** Soldiers whose non-starter cards pass to the Company Archive NOW
     *  (probate fires only on FINAL death — never while a soul sits in
     *  escrow; see the probate-ordering ruling). */
    archiveCardsOf: string[];
    /** Soldiers lost for good (final death). Probate, if owned, has already
     *  been accounted for via archiveCardsOf. */
    permanentlyDead: string[];
    /** True when exactly one Recovery of Company Assets contract should post
     *  (one per lost sortie, recovering ALL of that sortie's souls — see the
     *  escrow-scope ruling). */
    postRecoveryContract: boolean;
}

/**
 * Decide the fate of a sortie's dead.
 *
 * - Witness rule: a full squad wipe voids BOTH escrow and probate ("escrow
 *   requires a surviving witness to countersign the loss adjustment") — the
 *   dead are simply gone. handleSquadWipe never consults this module; the
 *   branch exists so the rule is encoded (and tested) in exactly one place.
 * - Soul Collateral owned, won sortie: ALL of the sortie's dead go to
 *   escrow behind ONE recovery contract. Probate does NOT fire yet.
 * - Probate alone: the dead are permanent; their cards archive immediately.
 * - Neither: permanent, nothing else.
 *
 * The forfeit path (an escrow lapsing) re-enters through this same function
 * with soulCollateralOwned=false: the lapsed souls are now finally dead, and
 * probate — if owned — fires at that moment (probate-ordering ruling).
 */
export function settleDeaths(input: {
    soulCollateralOwned: boolean;
    probateOwned: boolean;
    squadWiped: boolean;
    deaths: string[];
}): DeathSettlementPlan {
    const { soulCollateralOwned, probateOwned, squadWiped, deaths } = input;

    if (deaths.length === 0) {
        return { escrow: [], archiveCardsOf: [], permanentlyDead: [], postRecoveryContract: false };
    }

    if (squadWiped) {
        // Witness rule: no escrow, no probate.
        return { escrow: [], archiveCardsOf: [], permanentlyDead: [...deaths], postRecoveryContract: false };
    }

    if (soulCollateralOwned) {
        // Escrow scope: one contract for all of this sortie's souls; probate
        // waits for final death.
        return { escrow: [...deaths], archiveCardsOf: [], permanentlyDead: [], postRecoveryContract: true };
    }

    if (probateOwned) {
        return { escrow: [], archiveCardsOf: [...deaths], permanentlyDead: [...deaths], postRecoveryContract: false };
    }

    return { escrow: [], archiveCardsOf: [], permanentlyDead: [...deaths], postRecoveryContract: false };
}

/** The minimal card shape the archive rules need (structural — never import
 *  PlayableCard here; it is Phaser-tainted). */
export interface ArchivableCard {
    name: string;
}

/**
 * A dead soldier's NON-STARTER cards: cards in the master deck whose name
 * does not appear in the starting kit. Name-matching means an upgraded
 * starter (renamed by its modifier, e.g. "Defend+🔮") counts as non-starter
 * — the Company keeps what it paid to improve.
 */
export function selectNonStarterCards<T extends ArchivableCard>(
    masterDeck: T[], startingDeck: ArchivableCard[]
): T[] {
    const starterNames = new Set(startingDeck.map(c => c.name));
    return masterDeck.filter(c => !starterNames.has(c.name));
}

/**
 * Append cards to the archive, enforcing the capacity by striking off the
 * OLDEST entries (front of the array) first. Returns a new array; callers
 * assign it back to the one owner (CampaignUiState.cardArchive).
 */
export function pushWithArchiveCap<T>(archive: T[], incoming: T[], cap: number): T[] {
    const combined = [...archive, ...incoming];
    return combined.length <= cap ? combined : combined.slice(combined.length - cap);
}
