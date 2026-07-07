import * as fs from 'fs';
import * as path from 'path';
import { describe, expect, it } from 'vitest';

// CampaignUiState.ts (which owns CHARTER_BUYBACK_MONEY_COST/VP_REWARD/MIN_YEAR
// and retireSharesForVp/isCharterBuybackUnlocked) transitively imports
// PlayerCharacter -> BaseCharacter, which is Phaser-tainted and cannot load
// under Node (see that file's own doc comment). So this lint reads its
// SOURCE instead of importing it, matching ClientReputation.test.ts's and
// SaveRegistriesLint.test.ts's convention. The actual behavior (vault
// mutation, VP increment, year gate, board-minutes line) is browser-verified
// per src/docs/vp_endgame_design.md's verification bar.
const CAMPAIGN_UI_STATE_SOURCE = fs.readFileSync(
    path.resolve(process.cwd(), 'src/screens/campaign/hq_ux/CampaignUiState.ts'), 'utf-8'
);

function extractConst(name: string): number {
    const match = CAMPAIGN_UI_STATE_SOURCE.match(new RegExp(`${name} = (\\d+);`));
    expect(match, `${name} declaration not found in CampaignUiState.ts`).toBeTruthy();
    return Number(match![1]);
}

describe('Charter Buyback constants (src/docs/vp_endgame_design.md)', () => {
    it('converts £100 into 130 VP — a 1.3:1 ratio, 30% richer than hoarding', () => {
        const moneyCost = extractConst('CHARTER_BUYBACK_MONEY_COST');
        const vpReward = extractConst('CHARTER_BUYBACK_VP_REWARD');
        expect(moneyCost).toBe(100);
        expect(vpReward).toBe(130);
        expect(vpReward / moneyCost).toBeCloseTo(1.3, 5);
    });

    it('unlocks at year 8 (the charter\'s final 8 quarters of a 10-year charter)', () => {
        const minYear = extractConst('CHARTER_BUYBACK_MIN_YEAR');
        expect(minYear).toBe(8);
    });

    it('retireSharesForVp is gated by isCharterBuybackUnlocked before touching the vault', () => {
        // Lint the method body directly rather than re-deriving the logic:
        // guards against a future edit silently dropping the year gate or
        // the vault-sufficiency check.
        const match = CAMPAIGN_UI_STATE_SOURCE.match(
            /public retireSharesForVp\(\): boolean \{([\s\S]*?)\n {4}\}/
        );
        expect(match, 'retireSharesForVp method not found in CampaignUiState.ts').toBeTruthy();
        const body = match![1];
        expect(body).toContain('isCharterBuybackUnlocked()');
        expect(body).toContain('CHARTER_BUYBACK_MONEY_COST');
        expect(body).toContain('charterVictoryPoints += CHARTER_BUYBACK_VP_REWARD');
    });
});
