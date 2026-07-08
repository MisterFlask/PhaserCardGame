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
        const body = extractMethod(COMPANY_STORE_SOURCE, 'public override onQuarterEnd(ctx: QuarterEndContext): void');
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

// --- Batch B: contract-board Capital Works (The Dis Legation, The Grand
// Trunk Extension). Same source-lint constraint as above; the Legation's
// contract-generation mechanics themselves are REAL unit tests in
// ContractGenerator.test.ts (ContractGenerator is Phaser-free).
const DIS_LEGATION_SOURCE = fs.readFileSync(
    path.resolve(process.cwd(), 'src/strategic_projects/TheDisLegation.ts'), 'utf-8'
);
const GRAND_TRUNK_SOURCE = fs.readFileSync(
    path.resolve(process.cwd(), 'src/strategic_projects/TheGrandTrunkExtension.ts'), 'utf-8'
);

describe('CampaignUiState.getEffectiveContractsCompletedForGates — Grand Trunk Extension (+16)', () => {
    it('GRAND_TRUNK_GATE_CREDIT is 16', () => {
        const match = GRAND_TRUNK_SOURCE.match(/GRAND_TRUNK_GATE_CREDIT = (\d+);/);
        expect(match, 'GRAND_TRUNK_GATE_CREDIT not found').toBeTruthy();
        expect(Number(match![1])).toBe(16);
    });

    it('is defined as contractsCompleted plus the credit when the Extension is owned', () => {
        const body = extractMethod(CAMPAIGN_UI_STATE_SOURCE, 'public getEffectiveContractsCompletedForGates(): number');
        expect(body).toContain('this.contractsCompleted');
        expect(body).toContain('TheGrandTrunkExtension');
        expect(body).toContain('GRAND_TRUNK_GATE_CREDIT');
    });

    it('BOTH refillBoard call sites and the quarterly ctx consult it, never raw contractsCompleted', () => {
        // No /s flag (tsconfig targets pre-es2018); [^)]* already spans
        // newlines since a negated class matches them.
        const refillCalls = CAMPAIGN_UI_STATE_SOURCE.match(/\.refillBoard\([^)]*\)/g) ?? [];
        expect(refillCalls.length).toBe(2); // ensureContractsPopulated + advanceWeeks
        refillCalls.forEach(call => {
            expect(call).toContain('this.getEffectiveContractsCompletedForGates()');
            expect(call).not.toContain('this.contractsCompleted,');
        });
        expect(CAMPAIGN_UI_STATE_SOURCE).toContain('contractsCompletedForGates: this.getEffectiveContractsCompletedForGates()');
    });

    it('requires The Dis Legation as a prerequisite', () => {
        const body = extractMethod(GRAND_TRUNK_SOURCE, 'public override getPrerequisites(): AbstractStrategicProject[]');
        expect(body).toContain('new TheDisLegation()');
    });
});

describe('The Dis Legation — quarterly exclusive commission (onQuarterEnd ctx.postContract)', () => {
    it('onQuarterEnd generates via generateLegationContract with the ctx gate inputs and posts via ctx.postContract', () => {
        const body = extractMethod(DIS_LEGATION_SOURCE, 'public override onQuarterEnd(ctx: QuarterEndContext): void');
        expect(body).toContain('generateLegationContract');
        expect(body).toContain('ctx.year');
        expect(body).toContain('ctx.contractsCompletedForGates');
        expect(body).toContain('ctx.contractsCompletedByClient');
        expect(body).toContain('ctx.postContract(contract)');
    });

    it('re-exports the tuning constants defined in ContractGenerator (single source of truth)', () => {
        expect(DIS_LEGATION_SOURCE).toContain('LEGATION_PAYOUT_MULTIPLIER } from "../campaign/ContractGenerator"');
        expect(DIS_LEGATION_SOURCE).toContain('export { LEGATION_DEADLINE_WEEKS, LEGATION_PAYOUT_MULTIPLIER }');
    });

    it('advanceWeeks wires postContract to push onto the board and record a Legation minutes line', () => {
        expect(CAMPAIGN_UI_STATE_SOURCE).toContain('postContract: (contract: Contract) => {');
        expect(CAMPAIGN_UI_STATE_SOURCE).toContain('this.availableContracts.push(contract)');
        expect(CAMPAIGN_UI_STATE_SOURCE).toContain('The Legation secures a private commission: ${contract.name}.');
    });
});
