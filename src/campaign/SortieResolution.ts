// Pure sortie-resolution rules: no Phaser, no singletons, unit-testable.

import { StandingOrdersState } from "./orders/StandingOrdersState";
import { unionWoundWeeks } from "./FactionPressures";

/** Characters ending a sortie below this fraction of max HP come home wounded. */
export const WOUND_THRESHOLD = 0.5;
export const WOUND_WEEKS_MIN = 2;
export const WOUND_WEEKS_MAX = 4;

/** The slice of PlayerCharacter that casualty rules need. */
export interface CasualtySubject {
    name: string;
    hitpoints: number;
    maxHitpoints: number;
    weeksWoundedRemaining: number;
    isDeceased: boolean;
}

export interface CasualtyReport {
    deaths: CasualtySubject[];
    wounds: { subject: CasualtySubject; weeks: number }[];
    lines: string[];
}

/**
 * Apply post-sortie casualty rules to a squad, mutating the subjects.
 * rng is injectable for deterministic tests (defaults to Math.random).
 */
export function applyCasualties(
    squad: CasualtySubject[],
    rng: () => number = Math.random,
    contractsCompletedByClient: Record<string, number> = {}
): CasualtyReport {
    const report: CasualtyReport = { deaths: [], wounds: [], lines: [] };

    squad.forEach(subject => {
        if (subject.hitpoints <= 0) {
            subject.isDeceased = true;
            report.deaths.push(subject);
            report.lines.push(`${subject.name} did not survive. Their personal effects have been forwarded.`);
        } else if (subject.hitpoints < subject.maxHitpoints * WOUND_THRESHOLD) {
            const baseWeeks = WOUND_WEEKS_MIN
                + Math.floor(rng() * (WOUND_WEEKS_MAX - WOUND_WEEKS_MIN + 1));
            const ordersWeeks = StandingOrdersState.getInstance().woundWeeks(baseWeeks);
            // Union rates (faction_reputation_design.md v2.1 amendment): the
            // stretcher-bearers, porters, and orderlies are all union men —
            // applied AFTER the Standing Orders pass, same discipline as
            // every other Union-pressure seam.
            const weeks = unionWoundWeeks(ordersWeeks, contractsCompletedByClient);
            subject.weeksWoundedRemaining = weeks;
            report.wounds.push({ subject, weeks });
            report.lines.push(`${subject.name} is wounded: unfit for duty for ${weeks} weeks.`);
        }
    });

    return report;
}
