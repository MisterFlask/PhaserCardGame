// Pure, injectable-randomness helper for opposition-aware encounter
// selection. Used by EncounterManager (Phaser-tainted, cannot be unit-tested
// directly) to pick which encounter-table entry a sortie draws, biased
// toward the active contract's named opposition with a small chance of a
// "complication" -- a fight from outside the expected faction.

/** Chance the pick ignores the contract's opposition and draws from the
 *  full entry pool instead ("something else was in the area"). */
export const COMPLICATION_CHANCE = 0.12;

export interface EncounterSelectionResult {
    /** Index into the entries array the caller should use. */
    index: number;
    /** True if the picked entry does not carry the requested opposition tag
     *  (only possible via the complication roll, or when opposition/tags
     *  are absent -- see semantics below). */
    offTheme: boolean;
}

/**
 * Picks an index into `entryOppositions` (parallel array: entryOppositions[i]
 * is the opposition tags carried by entry i).
 *
 * - If `opposition` is undefined, or no entry carries that tag: uniform pick
 *   over all entries, offTheme always false (legacy behavior). Never throws
 *   on an unknown/empty tag set.
 * - Otherwise: with probability COMPLICATION_CHANCE, uniform pick over ALL
 *   entries (offTheme = whether the picked entry lacks the tag); else
 *   uniform pick over entries carrying the tag, offTheme false.
 */
export function pickEncounterIndex(
    entryOppositions: ReadonlyArray<ReadonlyArray<string>>,
    opposition: string | undefined,
    rng: () => number = Math.random,
): EncounterSelectionResult {
    const total = entryOppositions.length;
    if (total === 0) {
        throw new Error('pickEncounterIndex: entryOppositions must be non-empty');
    }

    const matchingIndices: number[] = [];
    if (opposition !== undefined) {
        entryOppositions.forEach((tags, i) => {
            if (tags.includes(opposition)) matchingIndices.push(i);
        });
    }

    // Legacy fallback: no opposition requested, or nothing matches it.
    if (opposition === undefined || matchingIndices.length === 0) {
        const index = Math.floor(rng() * total);
        return { index, offTheme: false };
    }

    // Opposition requested and at least one entry matches.
    if (rng() < COMPLICATION_CHANCE) {
        const index = Math.floor(rng() * total);
        const offTheme = !entryOppositions[index].includes(opposition);
        return { index, offTheme };
    }

    const pickWithin = Math.floor(rng() * matchingIndices.length);
    return { index: matchingIndices[pickWithin], offTheme: false };
}
