/**
 * Year-based combat hardening. The design doc ("Hell escalates too — regions
 * harden over time") calls for combat difficulty to scale with campaign year,
 * not just act/segment, so a year-8 encounter isn't identical to a year-1 one
 * while the dividend clock has tripled (see TODO.md "Region hardening over
 * campaign years").
 *
 * Phaser-free by house rule 1: enemy params are typed structurally so this
 * module never imports from gamecharacters.
 */

/** Balance-pass sketch numbers, untested against the economy sim — see
 *  TODO.md "Standing Orders balance pass" for the convention. Revisit after a
 *  few played campaign-years. */
const HP_PER_YEAR = 0.08; // +8% max HP per year past year 1 (×1.72 at year 10)
const LETHALITY_YEARS_PER_STACK = 3; // +1 Lethality stack every 3 years (+1 at y4, +2 at y7, +3 at y10)

export interface EncounterHardening {
    /** Multiplier applied to enemy max/current hitpoints. 1 at year 1. */
    hpMultiplier: number;
    /** Lethality stacks to grant every enemy in the encounter. 0 at year 1. */
    lethalityBonus: number;
}

/**
 * Computes the hardening to apply for a given campaign year. Year 1 is
 * exactly baseline (multiplier 1, bonus 0); years below 1 clamp to 1.
 */
export function hardeningForYear(year: number): EncounterHardening {
    const clampedYear = Math.max(1, year);
    return {
        hpMultiplier: 1 + HP_PER_YEAR * (clampedYear - 1),
        lethalityBonus: Math.floor((clampedYear - 1) / LETHALITY_YEARS_PER_STACK),
    };
}

/**
 * Scales enemy max/current hitpoints in place for the given campaign year.
 * Year 1 is a no-op (exact equality with the pre-call values). Rounds to the
 * nearest integer and never lets either field drop below 1.
 */
export function applyHpHardening(
    enemies: { maxHitpoints: number; hitpoints: number }[],
    year: number
): void {
    const { hpMultiplier } = hardeningForYear(year);
    enemies.forEach(enemy => {
        enemy.maxHitpoints = Math.max(1, Math.round(enemy.maxHitpoints * hpMultiplier));
        enemy.hitpoints = Math.max(1, Math.round(enemy.hitpoints * hpMultiplier));
    });
}
