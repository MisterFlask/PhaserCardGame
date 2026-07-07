import { describe, expect, it } from 'vitest';
import {
    deckCap, isAtDeckCap,
    LEVEL_CAP, levelFromXp, levelGrantsPerk, PERK_LEVELS,
    pendingLevels, relicSlots, xpCostForLevel, xpForCombatWin
} from '../Leveling';

describe('xpCostForLevel', () => {
    it('follows 20 + 10*(fromLevel-1)', () => {
        expect(xpCostForLevel(1)).toBe(20);
        expect(xpCostForLevel(2)).toBe(30);
        expect(xpCostForLevel(3)).toBe(40);
        expect(xpCostForLevel(9)).toBe(100);
    });
});

describe('levelFromXp', () => {
    it('starts at level 1 with 0 xp', () => {
        expect(levelFromXp(0)).toBe(1);
    });

    it('stays at level 1 just under the level-2 threshold', () => {
        expect(levelFromXp(19)).toBe(1);
    });

    it('reaches level 2 exactly at the threshold (cost 20)', () => {
        expect(levelFromXp(20)).toBe(2);
    });

    it('reaches level 3 at cumulative 20+30=50', () => {
        expect(levelFromXp(49)).toBe(2);
        expect(levelFromXp(50)).toBe(3);
    });

    it('clamps at LEVEL_CAP no matter how much xp is thrown at it', () => {
        expect(levelFromXp(1_000_000)).toBe(LEVEL_CAP);

        // Sanity: the cumulative cost to reach the cap should be finite and
        // reachable; going one xp short of it should NOT yet report the cap.
        let cumulativeToCap = 0;
        for (let l = 1; l < LEVEL_CAP; l++) {
            cumulativeToCap += xpCostForLevel(l);
        }
        expect(levelFromXp(cumulativeToCap - 1)).toBe(LEVEL_CAP - 1);
        expect(levelFromXp(cumulativeToCap)).toBe(LEVEL_CAP);
    });
});

describe('pendingLevels', () => {
    it('is 0 when xp has not caught up to stored level', () => {
        expect(pendingLevels({ xp: 0, level: 1 })).toBe(0);
    });

    it('derives pending promotions from xp vs stored level, never stored itself', () => {
        // Enough xp for level 3 (cumulative 50), but character record says level 1.
        expect(pendingLevels({ xp: 50, level: 1 })).toBe(2);
    });

    it('never goes negative if level is ahead of what xp would imply', () => {
        expect(pendingLevels({ xp: 0, level: 5 })).toBe(0);
    });

    it('is 0 once level has caught up to what xp supports', () => {
        expect(pendingLevels({ xp: 20, level: 2 })).toBe(0);
    });
});

describe('xpForCombatWin', () => {
    it('follows 10 + 5*act', () => {
        expect(xpForCombatWin(1)).toBe(15);
        expect(xpForCombatWin(2)).toBe(20);
        expect(xpForCombatWin(3)).toBe(25);
    });
});

describe('deckCap', () => {
    it('is startingDeckSize + level for a fresh level-1 recruit', () => {
        expect(deckCap({ level: 1 }, 4)).toBe(5);
    });

    it('grants one more slot per promotion', () => {
        expect(deckCap({ level: 2 }, 4)).toBe(6);
        expect(deckCap({ level: 5 }, 4)).toBe(9);
    });

    it('tracks whatever starting kit size the soldier actually had', () => {
        expect(deckCap({ level: 1 }, 6)).toBe(7);
        expect(deckCap({ level: 3 }, 3)).toBe(6);
    });
});

describe('isAtDeckCap', () => {
    it('is false below cap', () => {
        expect(isAtDeckCap({ level: 1 }, 4, 4)).toBe(false);
    });

    it('is true exactly at cap', () => {
        expect(isAtDeckCap({ level: 1 }, 4, 5)).toBe(true);
    });

    it('is true over cap (defensive, should not normally happen)', () => {
        expect(isAtDeckCap({ level: 1 }, 4, 6)).toBe(true);
    });

    it('excludes cargo: below cap on real cards even though raw count (incl. cargo) would read at/over cap', () => {
        // Simulates: soldier under cap on real cards (4/5), plus 2 sortie-scoped
        // cargo cards riding along (CargoInjection.injectCargoIntoSquad). The
        // caller must pass the cargo-excluded count, not raw
        // cardsInMasterDeck.length — isAtDeckCap itself does no filtering, it
        // trusts the caller the way CargoInjection.stripCargoFromSquad expects.
        const realCardCountExcludingCargo = 4;
        const rawCountIncludingCargo = 6;
        expect(isAtDeckCap({ level: 1 }, 4, realCardCountExcludingCargo)).toBe(false);
        expect(isAtDeckCap({ level: 1 }, 4, rawCountIncludingCargo)).toBe(true);
    });
});

describe('relicSlots', () => {
    it('is 2 for a fresh level-1 recruit', () => {
        expect(relicSlots(1)).toBe(2);
    });

    it('stays 2 up to level 5', () => {
        expect(relicSlots(5)).toBe(2);
    });

    it('opens a third slot at level 6', () => {
        expect(relicSlots(6)).toBe(3);
    });

    it('stays 3 through the level cap', () => {
        expect(relicSlots(10)).toBe(3);
    });
});

describe('perk levels', () => {
    it('PERK_LEVELS is [4, 8]', () => {
        expect(PERK_LEVELS).toEqual([4, 8]);
    });

    it('levelGrantsPerk is true only at 4 and 8', () => {
        expect(levelGrantsPerk(4)).toBe(true);
        expect(levelGrantsPerk(8)).toBe(true);
        expect(levelGrantsPerk(1)).toBe(false);
        expect(levelGrantsPerk(5)).toBe(false);
        expect(levelGrantsPerk(10)).toBe(false);
    });
});
