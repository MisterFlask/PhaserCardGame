import { describe, expect, it } from 'vitest';
import { COMPLICATION_CHANCE, pickEncounterIndex } from '../encounterSelection';

/** Deterministic sequence rng: returns values in order, wraps if exhausted. */
function sequenceRng(values: number[]): () => number {
    let i = 0;
    return () => values[(i++) % values.length];
}

describe('pickEncounterIndex', () => {
    it('falls back to uniform-all when opposition is undefined', () => {
        const entries = [['fam-a'], ['fam-b'], ['fam-a', 'fam-c']];
        // rng value picks the entry deterministically via Math.floor(rng * total).
        const result = pickEncounterIndex(entries, undefined, sequenceRng([0.5]));
        expect(result.index).toBe(1); // floor(0.5 * 3) = 1
        expect(result.offTheme).toBe(false);
    });

    it('falls back to uniform-all when no entry carries the requested tag', () => {
        const entries = [['fam-a'], ['fam-b'], ['fam-a']];
        const result = pickEncounterIndex(entries, 'fam-unknown', sequenceRng([0.9]));
        expect(result.index).toBe(2); // floor(0.9 * 3) = 2
        expect(result.offTheme).toBe(false);
    });

    it('never throws on an empty tag set for every entry (falls back to uniform-all)', () => {
        const entries = [[], [], []];
        expect(() => pickEncounterIndex(entries, 'anything', sequenceRng([0.1]))).not.toThrow();
        const result = pickEncounterIndex(entries, 'anything', sequenceRng([0.1]));
        expect(result.offTheme).toBe(false);
    });

    it('stays in-theme when rng is above the complication threshold', () => {
        const entries = [['fam-a'], ['fam-b'], ['fam-a'], ['fam-c']];
        // First rng call is the complication check: must be >= COMPLICATION_CHANCE
        // to skip the complication branch. Second rng call picks within the
        // matching subset ([0, 2], both fam-a).
        const rng = sequenceRng([COMPLICATION_CHANCE, 0.99]);
        const result = pickEncounterIndex(entries, 'fam-a', rng);
        expect([0, 2]).toContain(result.index);
        expect(entries[result.index]).toContain('fam-a');
        expect(result.offTheme).toBe(false);
    });

    it('draws from the full pool on the complication roll, marking offTheme when it lands outside the tag', () => {
        const entries = [['fam-a'], ['fam-b'], ['fam-a'], ['fam-c']];
        // First rng call < COMPLICATION_CHANCE triggers the complication path.
        // Second rng call picks index 1 (fam-b) from the full pool of 4.
        const rng = sequenceRng([0, 0.25]);
        const result = pickEncounterIndex(entries, 'fam-a', rng);
        expect(result.index).toBe(1); // floor(0.25 * 4) = 1
        expect(result.offTheme).toBe(true);
    });

    it('complication roll can still land on-theme (offTheme false) if the full-pool draw happens to match', () => {
        const entries = [['fam-a'], ['fam-b'], ['fam-a'], ['fam-c']];
        // Complication triggers; full-pool draw lands on index 0 (fam-a), which
        // does carry the requested tag.
        const rng = sequenceRng([0, 0.0]);
        const result = pickEncounterIndex(entries, 'fam-a', rng);
        expect(result.index).toBe(0);
        expect(result.offTheme).toBe(false);
    });

    it('single-entry table always returns index 0, on-theme, regardless of rng', () => {
        const entries = [['fam-a']];
        for (const rngValue of [0, 0.3, 0.5, 0.9, 0.999]) {
            const result = pickEncounterIndex(entries, 'fam-a', sequenceRng([rngValue, rngValue]));
            expect(result.index).toBe(0);
        }
    });

    it('single-entry table with no matching tag falls back to uniform-all (still index 0)', () => {
        const entries = [['fam-b']];
        const result = pickEncounterIndex(entries, 'fam-a', sequenceRng([0.5]));
        expect(result.index).toBe(0);
        expect(result.offTheme).toBe(false);
    });

    it('throws on an empty entries array', () => {
        expect(() => pickEncounterIndex([], 'fam-a')).toThrow();
    });

    it('complication chance is roughly honored over many trials (statistical sanity, real Math.random)', () => {
        const entries = [['fam-a'], ['fam-a'], ['fam-b']];
        let offThemeCount = 0;
        const trials = 5000;
        for (let i = 0; i < trials; i++) {
            const result = pickEncounterIndex(entries, 'fam-a');
            if (result.offTheme) offThemeCount++;
        }
        // offTheme can only fire on the complication branch AND only when it
        // draws the fam-b entry (1 of 3 entries) -- roughly COMPLICATION_CHANCE / 3.
        const expectedRate = COMPLICATION_CHANCE / 3;
        const observedRate = offThemeCount / trials;
        expect(observedRate).toBeGreaterThan(expectedRate * 0.4);
        expect(observedRate).toBeLessThan(expectedRate * 2.5);
    });

    it('every pick, in-theme or complicated, is always a valid index into entries', () => {
        const entries = [['fam-a'], ['fam-b'], ['fam-a', 'fam-c'], ['fam-c']];
        for (let i = 0; i < 500; i++) {
            const result = pickEncounterIndex(entries, 'fam-a');
            expect(result.index).toBeGreaterThanOrEqual(0);
            expect(result.index).toBeLessThan(entries.length);
        }
    });
});
