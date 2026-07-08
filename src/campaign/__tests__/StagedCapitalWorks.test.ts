import * as fs from 'fs';
import * as path from 'path';
import { describe, expect, it } from 'vitest';

// AbstractStrategicProject extends AbstractCard, which is Phaser-tainted
// (imports Phaser.GameObjects directly) and cannot load under plain-Node
// vitest — same constraint CharterBuyback.test.ts documents for
// CampaignUiState. So this lints the SOURCE of the staging methods
// (canPurchaseNextStage / purchaseNextStage / getMoneyCost / isFullyStaged)
// directly, matching that file's convention. Actual in-game behavior (vault
// deduction, the year-gate refusal line, the 2500 VP landing on the ending
// screen) is browser-verified per src/docs/vp_endgame_design.md's
// verification bar / this feature's own delivery report.
const ABSTRACT_PROJECT_SOURCE = fs.readFileSync(
    path.resolve(process.cwd(), 'src/strategic_projects/AbstractStrategicProject.ts'), 'utf-8'
);
const LEVI_MAXWELL_SOURCE = fs.readFileSync(
    path.resolve(process.cwd(), 'src/strategic_projects/LeviMaxwellAscensionProtocol.ts'), 'utf-8'
);
const PROJECT_LIST_SOURCE = fs.readFileSync(
    path.resolve(process.cwd(), 'src/strategic_projects/StrategicProjectList.ts'), 'utf-8'
);

/** Extracts a method body by its plain-text (unescaped) signature, e.g.
 *  "public getMoneyCost(): number". Escapes regex metacharacters itself —
 *  callers should never pre-escape. */
function extractMethod(source: string, signature: string): string {
    const escaped = signature.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const match = source.match(new RegExp(`${escaped} \\{([\\s\\S]*?)\\n {4}\\}`));
    expect(match, `${signature} not found`).toBeTruthy();
    return match![1];
}

describe('Staged Capital Works — gating logic (AbstractStrategicProject)', () => {
    it('canPurchaseNextStage refuses once every stage is bought', () => {
        const body = extractMethod(ABSTRACT_PROJECT_SOURCE, 'public canPurchaseNextStage(currentWeek: number): { ok: boolean; reason?: string }');
        expect(body).toContain('isFullyStaged()');
    });

    it('canPurchaseNextStage never gates the first stage (stagesPurchased === 0)', () => {
        const body = extractMethod(ABSTRACT_PROJECT_SOURCE, 'public canPurchaseNextStage(currentWeek: number): { ok: boolean; reason?: string }');
        expect(body).toContain('this.stagesPurchased === 0');
    });

    it('canPurchaseNextStage gates subsequent stages one full campaign year after the last purchase', () => {
        const body = extractMethod(ABSTRACT_PROJECT_SOURCE, 'public canPurchaseNextStage(currentWeek: number): { ok: boolean; reason?: string }');
        expect(body).toContain('this.lastStagePurchaseWeek + WEEKS_PER_CAMPAIGN_YEAR');
    });

    it('WEEKS_PER_CAMPAIGN_YEAR is exactly one campaign year (52 weeks)', () => {
        const match = ABSTRACT_PROJECT_SOURCE.match(/WEEKS_PER_CAMPAIGN_YEAR = WEEKS_PER_QUARTER \* QUARTERS_PER_YEAR/);
        expect(match, 'WEEKS_PER_CAMPAIGN_YEAR must be derived from WEEKS_PER_QUARTER * QUARTERS_PER_YEAR').toBeTruthy();
    });

    it('getMoneyCost prices the NEXT stage when staged, not a flat fallback', () => {
        const body = extractMethod(ABSTRACT_PROJECT_SOURCE, 'public getMoneyCost(): number');
        expect(body).toContain('getNextStage()');
    });

    it('purchaseNextStage stamps lastStagePurchaseWeek and fires onStagePurchased', () => {
        const body = extractMethod(ABSTRACT_PROJECT_SOURCE, 'public purchaseNextStage(currentWeek: number): void');
        expect(body).toContain('this.stagesPurchased += 1');
        expect(body).toContain('this.lastStagePurchaseWeek = currentWeek');
        expect(body).toContain('this.onStagePurchased(this.stagesPurchased)');
    });

    it('a project with no stages set is untouched: isStaged() is the sole switch', () => {
        const isStagedBody = extractMethod(ABSTRACT_PROJECT_SOURCE, 'public isStaged(): boolean');
        expect(isStagedBody).toContain('this.stages !== undefined');
    });
});

describe('Levi-Maxwell Ascension Protocol capstone', () => {
    it('defines exactly three stages priced £400 / £400 / £450', () => {
        const match = LEVI_MAXWELL_SOURCE.match(/this\.stages = \[([\s\S]*?)\n {8}\];/);
        expect(match, 'stages array not found').toBeTruthy();
        const stagesBlock = match![1];
        const costs = [...stagesBlock.matchAll(/cost: (\d+),/g)].map(m => Number(m[1]));
        expect(costs).toEqual([400, 400, 450]);
    });

    it('grants LEVI_MAXWELL_ASCENSION_VP_REWARD (2500) only on the final stage', () => {
        const body = extractMethod(LEVI_MAXWELL_SOURCE, 'public override onStagePurchased(stageNumber: number): void');
        expect(body).toContain('stageNumber === this.stages!.length');
        expect(body).toContain('this.victoryPoints += LEVI_MAXWELL_ASCENSION_VP_REWARD');

        const rewardMatch = LEVI_MAXWELL_SOURCE.match(/LEVI_MAXWELL_ASCENSION_VP_REWARD = (\d+)/);
        expect(rewardMatch, 'LEVI_MAXWELL_ASCENSION_VP_REWARD not found').toBeTruthy();
        expect(Number(rewardMatch![1])).toBe(2500);
    });
});

describe('Levi-Maxwell year-4 purchasability gate (StrategicProjectList)', () => {
    it('is back in the purchasable pool (no longer in DEAD_CARGO_PROJECT_NAMES)', () => {
        const deadListMatch = PROJECT_LIST_SOURCE.match(/const DEAD_CARGO_PROJECT_NAMES = new Set\(\[([\s\S]*?)\]\);/);
        expect(deadListMatch, 'DEAD_CARGO_PROJECT_NAMES not found').toBeTruthy();
        expect(deadListMatch![1]).not.toContain('LeviMaxwellAscensionProtocol');
    });

    it('is gated to year 4+ via PROJECT_MIN_PURCHASE_YEAR', () => {
        const gateMatch = PROJECT_LIST_SOURCE.match(/PROJECT_MIN_PURCHASE_YEAR: ReadonlyMap<string, number> = new Map\(\[([\s\S]*?)\]\);/);
        expect(gateMatch, 'PROJECT_MIN_PURCHASE_YEAR not found').toBeTruthy();
        expect(gateMatch![1]).toContain('new LeviMaxwellAscensionProtocol().name, 4');
    });
});
