// Pure soldier-leveling model. Phaser-free by house rule 1: only imports
// pure modules. See src/docs/strategic_layer_redesign.md, "Amendment:
// Soldier Levels & Promotions" for the approved design this implements.
//
// Structural typing throughout: callers pass plain { xp, level } shaped
// objects (or PlayerCharacter, which satisfies the shape) so this module
// never needs to import PlayerCharacter/PlayableCard and stays Phaser-free.

/** No soldier can be promoted past this level. */
export const LEVEL_CAP = 10;

/** Levels at which a promotion additionally grants a randomized class perk. */
export const PERK_LEVELS = [4, 8];

export function levelGrantsPerk(level: number): boolean {
    return PERK_LEVELS.includes(level);
}

/**
 * XP cost to advance from `fromLevel` to `fromLevel + 1`.
 * Balance-pass sketch (see design doc): 20 + 10*(fromLevel-1).
 * ~1 sortie to level 2 (cost 20); ~16 sorties to cap.
 */
export function xpCostForLevel(fromLevel: number): number {
    return 20 + 10 * (fromLevel - 1);
}

/**
 * Cumulative XP thresholds derived from xpCostForLevel, clamped to LEVEL_CAP.
 * Level N is reached once xp >= (sum of xpCostForLevel(1..N-1)).
 */
export function levelFromXp(xp: number): number {
    let level = 1;
    let cumulative = 0;
    while (level < LEVEL_CAP) {
        cumulative += xpCostForLevel(level);
        if (xp < cumulative) {
            break;
        }
        level++;
    }
    return level;
}

/**
 * Pending promotions are ALWAYS derived, never stored on the character —
 * quitting mid-promotion just means the prompt reappears next time. Never
 * negative (a character's stored level should never exceed what their xp
 * supports, but this stays defensive rather than throwing).
 */
export function pendingLevels(char: { xp: number; level: number }): number {
    return Math.max(0, levelFromXp(char.xp) - char.level);
}

/**
 * XP granted to every deployed, living squad member per combat won.
 * Balance-pass sketch: 10 + 5*act.
 */
export function xpForCombatWin(act: number): number {
    return 10 + 5 * act;
}
