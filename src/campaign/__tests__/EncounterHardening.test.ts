import { describe, expect, it } from 'vitest';
import { applyHpHardening, hardeningForYear } from '../EncounterHardening';

describe('hardeningForYear', () => {
    it('is exactly baseline at year 1', () => {
        expect(hardeningForYear(1)).toEqual({ hpMultiplier: 1, lethalityBonus: 0 });
    });

    it('clamps year 0 and negative years to year 1 baseline', () => {
        expect(hardeningForYear(0)).toEqual({ hpMultiplier: 1, lethalityBonus: 0 });
        expect(hardeningForYear(-5)).toEqual({ hpMultiplier: 1, lethalityBonus: 0 });
    });

    it('matches exact sketch values at years 4, 7, and 10', () => {
        const y4 = hardeningForYear(4);
        expect(y4.hpMultiplier).toBeCloseTo(1.24, 10);
        expect(y4.lethalityBonus).toBe(1);

        const y7 = hardeningForYear(7);
        expect(y7.hpMultiplier).toBeCloseTo(1.48, 10);
        expect(y7.lethalityBonus).toBe(2);

        const y10 = hardeningForYear(10);
        expect(y10.hpMultiplier).toBeCloseTo(1.72, 10);
        expect(y10.lethalityBonus).toBe(3);
    });

    it('is monotonically non-decreasing across years 1-10', () => {
        let prevHp = -Infinity;
        let prevLethality = -Infinity;
        for (let year = 1; year <= 10; year++) {
            const { hpMultiplier, lethalityBonus } = hardeningForYear(year);
            expect(hpMultiplier).toBeGreaterThanOrEqual(prevHp);
            expect(lethalityBonus).toBeGreaterThanOrEqual(prevLethality);
            prevHp = hpMultiplier;
            prevLethality = lethalityBonus;
        }
    });
});

describe('applyHpHardening', () => {
    it('is a no-op at year 1 (exact equality)', () => {
        const enemies = [
            { maxHitpoints: 50, hitpoints: 50 },
            { maxHitpoints: 33, hitpoints: 20 },
        ];
        applyHpHardening(enemies, 1);
        expect(enemies).toEqual([
            { maxHitpoints: 50, hitpoints: 50 },
            { maxHitpoints: 33, hitpoints: 20 },
        ]);
    });

    it('scales both maxHitpoints and hitpoints and rounds', () => {
        const enemies = [{ maxHitpoints: 100, hitpoints: 100 }];
        applyHpHardening(enemies, 5); // multiplier 1 + 0.08*4 = 1.32
        expect(enemies[0].maxHitpoints).toBe(132);
        expect(enemies[0].hitpoints).toBe(132);
    });

    it('rounds fractional results to the nearest integer', () => {
        const enemies = [{ maxHitpoints: 33, hitpoints: 17 }];
        applyHpHardening(enemies, 4); // multiplier 1.24
        // 33 * 1.24 = 40.92 -> 41 ; 17 * 1.24 = 21.08 -> 21
        expect(enemies[0].maxHitpoints).toBe(41);
        expect(enemies[0].hitpoints).toBe(21);
    });

    it('never lets either field drop below 1', () => {
        const enemies = [{ maxHitpoints: 0, hitpoints: 0 }];
        applyHpHardening(enemies, 1);
        expect(enemies[0].maxHitpoints).toBe(1);
        expect(enemies[0].hitpoints).toBe(1);
    });
});
