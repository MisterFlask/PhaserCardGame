import { describe, expect, it } from 'vitest';
import { applyCasualties, CasualtySubject, WOUND_WEEKS_MAX, WOUND_WEEKS_MIN } from '../SortieResolution';

function soldier(name: string, hp: number, maxHp: number = 30): CasualtySubject {
    return { name, hitpoints: hp, maxHitpoints: maxHp, weeksWoundedRemaining: 0, isDeceased: false };
}

describe('applyCasualties', () => {
    it('leaves a healthy squad untouched', () => {
        const squad = [soldier('A', 30), soldier('B', 16)]; // 16/30 is above the 50% line
        const report = applyCasualties(squad);
        expect(report.deaths).toHaveLength(0);
        expect(report.wounds).toHaveLength(0);
        expect(squad.every(s => s.weeksWoundedRemaining === 0 && !s.isDeceased)).toBe(true);
    });

    it('wounds a soldier below half HP for 2-4 weeks', () => {
        const squad = [soldier('Hurt', 14)]; // 14/30 < 50%
        const report = applyCasualties(squad, () => 0.99);
        expect(report.wounds).toHaveLength(1);
        expect(squad[0].weeksWoundedRemaining).toBe(WOUND_WEEKS_MAX);

        const squad2 = [soldier('Hurt2', 14)];
        applyCasualties(squad2, () => 0);
        expect(squad2[0].weeksWoundedRemaining).toBe(WOUND_WEEKS_MIN);
    });

    it('treats exactly half HP as fit for duty', () => {
        const squad = [soldier('Edge', 15)]; // 15/30 == 50%, not < 50%
        const report = applyCasualties(squad);
        expect(report.wounds).toHaveLength(0);
    });

    it('marks the dead deceased and does not also wound them', () => {
        const squad = [soldier('Gone', 0)];
        const report = applyCasualties(squad);
        expect(report.deaths).toHaveLength(1);
        expect(report.wounds).toHaveLength(0);
        expect(squad[0].isDeceased).toBe(true);
        expect(squad[0].weeksWoundedRemaining).toBe(0);
    });

    it('reports mixed outcomes in squad order', () => {
        const squad = [soldier('Dead', 0), soldier('Fine', 30), soldier('Hurt', 5)];
        const report = applyCasualties(squad, () => 0);
        expect(report.lines).toHaveLength(2);
        expect(report.lines[0]).toContain('Dead');
        expect(report.lines[1]).toContain('Hurt');
    });
});
