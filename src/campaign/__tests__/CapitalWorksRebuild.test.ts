import * as fs from 'fs';
import * as path from 'path';
import { describe, expect, it } from 'vitest';

// Capital Works Rebuild, Batch A (src/docs/strategic_layer_redesign.md's
// "Amendment: Capital Works Rebuild"). CampaignUiState.ts and the strategic
// project classes extend/transitively import Phaser-tainted classes
// (AbstractCard, PlayerCharacter -> BaseCharacter) and cannot load under
// plain-Node vitest — same constraint CharterBuyback.test.ts and
// StagedCapitalWorks.test.ts document. So this lints SOURCE directly,
// matching those files' convention. Actual in-game behavior (vault mutation,
// roster cap enforcement in the Barracks UI) is browser-verified.
const COMPANY_STORE_SOURCE = fs.readFileSync(
    path.resolve(process.cwd(), 'src/strategic_projects/TheCompanyStore.ts'), 'utf-8'
);
const GAZETTE_SOURCE = fs.readFileSync(
    path.resolve(process.cwd(), 'src/strategic_projects/TheCompanyGazette.ts'), 'utf-8'
);
const CAMPAIGN_UI_STATE_SOURCE = fs.readFileSync(
    path.resolve(process.cwd(), 'src/screens/campaign/hq_ux/CampaignUiState.ts'), 'utf-8'
);

/** Extracts a method body by its plain-text (unescaped) signature — same
 *  helper as StagedCapitalWorks.test.ts, duplicated here rather than shared
 *  since these lint files are deliberately standalone (no test-only shared
 *  module exists for this pattern yet). */
function extractMethod(source: string, signature: string): string {
    const escaped = signature.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const match = source.match(new RegExp(`${escaped} \\{([\\s\\S]*?)\\n {4}\\}`));
    expect(match, `${signature} not found`).toBeTruthy();
    return match![1];
}

describe('The Company Store — £8/soldier income (AbstractStrategicProject.onQuarterEnd hook)', () => {
    it('COMPANY_STORE_INCOME_PER_SOLDIER is £8', () => {
        const match = COMPANY_STORE_SOURCE.match(/COMPANY_STORE_INCOME_PER_SOLDIER = (\d+);/);
        expect(match, 'COMPANY_STORE_INCOME_PER_SOLDIER not found').toBeTruthy();
        expect(Number(match![1])).toBe(8);
    });

    it('onQuarterEnd pays ctx.rosterSize * COMPANY_STORE_INCOME_PER_SOLDIER into the vault', () => {
        const body = extractMethod(COMPANY_STORE_SOURCE, 'public override onQuarterEnd(ctx: { rosterSize: number }): void');
        expect(body).toContain('ctx.rosterSize * COMPANY_STORE_INCOME_PER_SOLDIER');
        expect(body).toContain('moneyInVault +=');
    });

    it('costs £220', () => {
        const body = extractMethod(COMPANY_STORE_SOURCE, 'public override getMoneyCost(): number');
        expect(body).toContain('220');
    });
});

describe('The Company Gazette — 20 VP per contract completed (AbstractStrategicProject.onContractCompleted hook)', () => {
    it('GAZETTE_VP_PER_CONTRACT is 20', () => {
        const match = GAZETTE_SOURCE.match(/GAZETTE_VP_PER_CONTRACT = (\d+);/);
        expect(match, 'GAZETTE_VP_PER_CONTRACT not found').toBeTruthy();
        expect(Number(match![1])).toBe(20);
    });

    it('onContractCompleted banks GAZETTE_VP_PER_CONTRACT onto victoryPoints', () => {
        const body = extractMethod(GAZETTE_SOURCE, 'public override onContractCompleted(contract: Contract): void');
        expect(body).toContain('this.victoryPoints += GAZETTE_VP_PER_CONTRACT');
    });

    it('costs £300', () => {
        const body = extractMethod(GAZETTE_SOURCE, 'public override getMoneyCost(): number');
        expect(body).toContain('300');
    });
});

describe('CampaignUiState.getRosterCap — Cantonment Annexe (8 -> 10)', () => {
    it('is defined as ROSTER_CAP plus +2 when the Cantonment Annexe is owned', () => {
        const body = extractMethod(CAMPAIGN_UI_STATE_SOURCE, 'public getRosterCap(): number');
        expect(body).toContain('ROSTER_CAP');
        expect(body).toContain('CantonmentAnnexe');
        expect(body).toContain('? 2 : 0');
    });

    it('hireRecruit and BarracksPanel consult getRosterCap(), not the bare ROSTER_CAP constant', () => {
        const hireRecruitBody = extractMethod(CAMPAIGN_UI_STATE_SOURCE, 'public hireRecruit(candidate: PlayerCharacter): boolean');
        expect(hireRecruitBody).toContain('this.getRosterCap()');
        expect(hireRecruitBody).not.toContain('ROSTER_CAP)');

        const barracksSource = fs.readFileSync(
            path.resolve(process.cwd(), 'src/screens/campaign/hq_ux/panels/BarracksPanel.ts'), 'utf-8'
        );
        expect(barracksSource).toContain('campaign.getRosterCap()');
        expect(barracksSource).not.toMatch(/[^.]ROSTER_CAP\b/);
    });
});
