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

// --- Batch C: death infrastructure (The Probate & Effects Office, The Soul
// Collateral Office). The DECISION logic is real-unit-tested in
// DeathSettlement.test.ts (pure module); these lints cover the Phaser-side
// application only, per convention.
const PROBATE_SOURCE = fs.readFileSync(
    path.resolve(process.cwd(), 'src/strategic_projects/ProbateAndEffectsOffice.ts'), 'utf-8'
);
const SOUL_COLLATERAL_SOURCE = fs.readFileSync(
    path.resolve(process.cwd(), 'src/strategic_projects/SoulCollateralOffice.ts'), 'utf-8'
);
const SORTIE_MANAGER_SOURCE = fs.readFileSync(
    path.resolve(process.cwd(), 'src/campaign/SortieManager.ts'), 'utf-8'
);
const BARRACKS_SOURCE = fs.readFileSync(
    path.resolve(process.cwd(), 'src/screens/campaign/hq_ux/panels/BarracksPanel.ts'), 'utf-8'
);

describe('Batch C constants and prerequisite chain', () => {
    it('PROBATE_ARCHIVE_CAP is 12 and BEQUEST_COST is £30', () => {
        expect(PROBATE_SOURCE).toContain('PROBATE_ARCHIVE_CAP = 12;');
        expect(PROBATE_SOURCE).toContain('BEQUEST_COST = 30;');
    });

    it('ESCROW_RECOVERY_WOUND_WEEKS is 4 and ESCROW_RECOVERY_STRESS is 25', () => {
        expect(SOUL_COLLATERAL_SOURCE).toContain('ESCROW_RECOVERY_WOUND_WEEKS = 4;');
        expect(SOUL_COLLATERAL_SOURCE).toContain('ESCROW_RECOVERY_STRESS = 25;');
    });

    it('ESCROW_DEADLINE_WEEKS is defined in ContractGenerator and re-exported by the Office (single source of truth)', () => {
        expect(SOUL_COLLATERAL_SOURCE).toContain('ESCROW_DEADLINE_WEEKS } from "../campaign/ContractGenerator"');
        expect(SOUL_COLLATERAL_SOURCE).toContain('export { ESCROW_DEADLINE_WEEKS }');
    });

    it('tree chain: Pattern Room -> Probate -> Soul Collateral', () => {
        const probatePrereqs = extractMethod(PROBATE_SOURCE, 'public override getPrerequisites(): AbstractStrategicProject[]');
        expect(probatePrereqs).toContain('new ThePatternRoom()');
        const collateralPrereqs = extractMethod(SOUL_COLLATERAL_SOURCE, 'public override getPrerequisites(): AbstractStrategicProject[]');
        expect(collateralPrereqs).toContain('new ProbateAndEffectsOffice()');
    });
});

describe('SortieManager applies the pure death-settlement plan (resolveSortie)', () => {
    it('consults settleDeaths with ownership flags and squadWiped: false, and posts the recovery contract', () => {
        expect(SORTIE_MANAGER_SOURCE).toContain('settleDeaths({');
        expect(SORTIE_MANAGER_SOURCE).toContain('soulCollateralOwned: campaign.ownsProject(new SoulCollateralOffice().name)');
        expect(SORTIE_MANAGER_SOURCE).toContain('probateOwned: campaign.ownsProject(new ProbateAndEffectsOffice().name)');
        expect(SORTIE_MANAGER_SOURCE).toContain('generateRecoveryContract(plan.escrow, contract.act)');
        expect(SORTIE_MANAGER_SOURCE).toContain('A recovery commission is posted.');
    });

    it('handleSquadWipe never consults the plan for the wiped squad\'s own deaths (witness rule)', () => {
        const wipeSection = SORTIE_MANAGER_SOURCE.slice(
            SORTIE_MANAGER_SOURCE.indexOf('handleSquadWipe'),
            SORTIE_MANAGER_SOURCE.indexOf('private settleEquipmentForCasualty'));
        expect(wipeSection.length).toBeGreaterThan(0);
        // The wiped squad's own deaths get no escrow and no probate: the
        // plan is never consulted directly here. The ONLY escrow touch a
        // wipe may make is the shared forfeit path for a Recovery
        // contract's pre-existing souls (asserted separately below).
        expect(wipeSection).not.toContain('settleDeaths');
        expect(wipeSection).not.toContain('escrowedSouls');
    });

    it('a wipe on a Recovery contract\'s own sortie forfeits its souls through the SHARED forfeit path (ruling)', () => {
        const wipeSection = SORTIE_MANAGER_SOURCE.slice(
            SORTIE_MANAGER_SOURCE.indexOf('handleSquadWipe'),
            SORTIE_MANAGER_SOURCE.indexOf('private settleEquipmentForCasualty'));
        expect(wipeSection).toContain('contract.recoveryOfSouls');
        expect(wipeSection).toContain('campaign.forfeitEscrowForContract(contract.name');
        expect(wipeSection).toContain('The Court writes off the collateral twice over.');
    });

    it('redeems recovered souls over the cap with the recovery wound and stress applied', () => {
        expect(SORTIE_MANAGER_SOURCE).toContain('soldier.weeksWoundedRemaining = ESCROW_RECOVERY_WOUND_WEEKS');
        expect(SORTIE_MANAGER_SOURCE).toContain('stressBuff.stacks += ESCROW_RECOVERY_STRESS');
        expect(SORTIE_MANAGER_SOURCE).toContain('new Stress(ESCROW_RECOVERY_STRESS)');
        expect(SORTIE_MANAGER_SOURCE).toContain('campaign.roster.push(soldier)');
        // Ruling: return is allowed even over the roster cap — no cap check
        // may guard the redemption push.
        const redemption = SORTIE_MANAGER_SOURCE.slice(
            SORTIE_MANAGER_SOURCE.indexOf('Escrow redemption'),
            SORTIE_MANAGER_SOURCE.indexOf('Playtest telemetry baselines'));
        expect(redemption).not.toContain('getRosterCap');
    });
});

describe('CampaignUiState escrow forfeit and probate intake', () => {
    it('forfeitEscrowForContract is the ONE forfeit path: pure plan, probate-now, warning board event', () => {
        const body = extractMethod(CAMPAIGN_UI_STATE_SOURCE, 'public forfeitEscrowForContract(contractName: string, writeOff: (names: string) => string): string | null');
        expect(body).toContain('soulCollateralOwned: false, // the collateral just lapsed');
        expect(body).toContain('settleDeaths({');
        expect(body).toContain('this.archiveEffectsOf(e.soldier)');
        expect(body).toContain('isWarning: true');
        // settleDeaths must be CALLED nowhere else in this file — the lapse
        // intercept and the wipe path both go through this helper. (The
        // import statement has no opening paren, so it doesn't count.)
        expect(CAMPAIGN_UI_STATE_SOURCE.split('settleDeaths(').length - 1).toBe(1);
    });

    it('advanceWeeks intercepts lapsing recovery contracts through the shared forfeit path', () => {
        expect(CAMPAIGN_UI_STATE_SOURCE).toContain('this.forfeitEscrowForContract(lapsed.name');
        expect(CAMPAIGN_UI_STATE_SOURCE).toContain('The escrow on ${names} lapses. The Court writes off the collateral.');
    });

    it('archiveEffectsOf takes non-starter cards under the archive cap', () => {
        const body = extractMethod(CAMPAIGN_UI_STATE_SOURCE, 'public archiveEffectsOf(soldier: PlayerCharacter): number');
        expect(body).toContain('selectNonStarterCards(soldier.cardsInMasterDeck, soldier.startingDeck)');
        expect(body).toContain('pushWithArchiveCap(this.cardArchive');
        expect(body).toContain('PROBATE_ARCHIVE_CAP');
    });
});

describe('Barracks bequest (The Probate & Effects Office)', () => {
    it('gates on the Office by class name (no string drift), the archive, funds, and the deck cap', () => {
        expect(BARRACKS_SOURCE).toContain('const BEQUEST_GATE = new ProbateAndEffectsOffice().name;');
        expect(BARRACKS_SOURCE).toContain('if (!campaign.ownsProject(BEQUEST_GATE)) return;');
        expect(BARRACKS_SOURCE).toContain('if (campaign.cardArchive.length === 0) return;');
        expect(BARRACKS_SOURCE).toContain('isAtDeckCap(soldier, soldier.startingDeck.length, soldier.cardsInMasterDeck.length)');
        expect(BARRACKS_SOURCE).toContain(`Bequeath from Archive (£\${BEQUEST_COST})`);
    });

    it('bequest deducts the fee, moves the card out of the archive, and copies it onto the soldier', () => {
        expect(BARRACKS_SOURCE).toContain('gameState.moneyInVault -= BEQUEST_COST;');
        expect(BARRACKS_SOURCE).toContain('campaign.cardArchive = campaign.cardArchive.filter(c => c !== card);');
        expect(BARRACKS_SOURCE).toContain('const copy = card.Copy();');
        expect(BARRACKS_SOURCE).toContain('soldier.addCard(copy);');
        expect(BARRACKS_SOURCE).toContain("kind: 'bequest'");
    });
});

// --- Batch D: second wave (Testimonials Board, Wattle & Gray, School of
// Musketry, Bonded Warehouse, Gratuities Ledger). Pure pieces are
// real-unit-tested elsewhere (pickMostServedClient in ClientReputation.test.ts,
// the mergeStockWithLoadout cap parameter in SortieManagerClamp.test.ts);
// these lints cover the Phaser-side wiring, per convention.
const TESTIMONIALS_SOURCE = fs.readFileSync(
    path.resolve(process.cwd(), 'src/strategic_projects/LongServiceTestimonialsBoard.ts'), 'utf-8'
);
const SALVAGE_SOURCE = fs.readFileSync(
    path.resolve(process.cwd(), 'src/strategic_projects/WattleAndGraySalvageAuctioneers.ts'), 'utf-8'
);
const MUSKETRY_SOURCE = fs.readFileSync(
    path.resolve(process.cwd(), 'src/strategic_projects/SchoolOfMusketry.ts'), 'utf-8'
);
const WAREHOUSE_SOURCE = fs.readFileSync(
    path.resolve(process.cwd(), 'src/strategic_projects/TheBondedWarehouse.ts'), 'utf-8'
);
const GRATUITIES_SOURCE = fs.readFileSync(
    path.resolve(process.cwd(), 'src/strategic_projects/EntertainmentsAndGratuitiesLedger.ts'), 'utf-8'
);
const QUARTERMASTER_SOURCE = fs.readFileSync(
    path.resolve(process.cwd(), 'src/screens/campaign/hq_ux/panels/QuartermasterPanel.ts'), 'utf-8'
);

describe('Batch D constants', () => {
    it('all five tuning constants match the amendment', () => {
        expect(TESTIMONIALS_SOURCE).toContain('TESTIMONIAL_VP_PER_LEVEL = 20;');
        expect(SALVAGE_SOURCE).toContain('SALVAGE_SELL_FRACTION = 0.5;');
        expect(MUSKETRY_SOURCE).toContain('DRILL_COST = 40;');
        expect(MUSKETRY_SOURCE).toContain('DRILL_XP = 20;');
        expect(MUSKETRY_SOURCE).toContain('DRILL_MAX_LEVEL = 4;');
        expect(WAREHOUSE_SOURCE).toContain('WAREHOUSE_STOCK_BONUS = 3;');
        expect(GRATUITIES_SOURCE).toContain('GRATUITIES_CREDIT_PER_QUARTER = 1;');
    });
});

describe('Retire with Testimonial (BarracksPanel)', () => {
    it('routes banked VP to the OWNED project instance and strikes the soldier from the roster', () => {
        expect(BARRACKS_SOURCE).toContain('const board = campaign.ownedStrategicProjects.find(p => p.name === RETIRE_GATE);');
        expect(BARRACKS_SOURCE).toContain('if (board) board.victoryPoints += vp;');
        expect(BARRACKS_SOURCE).toContain('campaign.roster = campaign.roster.filter(c => c !== soldier);');
        expect(BARRACKS_SOURCE).toContain('const vp = TESTIMONIAL_VP_PER_LEVEL * soldier.level;');
    });

    it('is arm-confirmed (irreversible) and refuses the last roster soldier', () => {
        expect(BARRACKS_SOURCE).toContain('private armedRetirement: PlayerCharacter | null = null;');
        expect(BARRACKS_SOURCE).toContain('Click again to confirm the citation.');
        expect(BARRACKS_SOURCE).toContain('const isLastSoldier = campaign.roster.length <= 1;');
        expect(BARRACKS_SOURCE).toContain('The Company cannot retire its last soldier.');
    });
});

describe('Drill (BarracksPanel)', () => {
    it('gates on ownership and DRILL_MAX_LEVEL, adds DRILL_XP, never resolves levels itself', () => {
        expect(BARRACKS_SOURCE).toContain('if (!campaign.ownsProject(DRILL_GATE)) return startY;');
        expect(BARRACKS_SOURCE).toContain('if (soldier.level >= DRILL_MAX_LEVEL) return startY;');
        expect(BARRACKS_SOURCE).toContain('soldier.xp += DRILL_XP;');
        const drillBody = extractMethod(BARRACKS_SOURCE, 'private buildDrillAction(soldier: PlayerCharacter, width: number, startY: number): number');
        expect(drillBody).not.toContain('soldier.level =');
        expect(drillBody).not.toContain('level++');
    });
});

describe('Salvage (Wattle & Gray)', () => {
    it('Quartermaster sells held consumables at floor(basePrice * SALVAGE_SELL_FRACTION)', () => {
        expect(QUARTERMASTER_SOURCE).toContain('Math.floor(consumable.basePrice * SALVAGE_SELL_FRACTION)');
        expect(QUARTERMASTER_SOURCE).toContain('campaign.consumables = campaign.consumables.filter(c => c !== consumable);');
        expect(QUARTERMASTER_SOURCE).toContain("record('sale', { kind: 'consumable'");
    });

    it('Barracks armoury picker sells unequipped relics at floor(price * SALVAGE_SELL_FRACTION)', () => {
        expect(BARRACKS_SOURCE).toContain('Math.floor(relic.price * SALVAGE_SELL_FRACTION)');
        expect(BARRACKS_SOURCE).toContain('campaign.armoury = campaign.armoury.filter(r => r !== relic);');
        expect(BARRACKS_SOURCE).toContain("record('sale', { kind: 'relic'");
    });
});

describe('Consumable stock cap (The Bonded Warehouse)', () => {
    it('getConsumableStockCap derives from ownership (roster-cap pattern) and every consumer uses it', () => {
        const body = extractMethod(CAMPAIGN_UI_STATE_SOURCE, 'public getConsumableStockCap(): number');
        expect(body).toContain('MAX_CONSUMABLE_STOCK');
        expect(body).toContain('TheBondedWarehouse');
        expect(body).toContain('WAREHOUSE_STOCK_BONUS');

        const fullBody = extractMethod(CAMPAIGN_UI_STATE_SOURCE, 'public isConsumableStockFull(): boolean');
        expect(fullBody).toContain('this.getConsumableStockCap()');

        expect(SORTIE_MANAGER_SOURCE).toContain('mergeStockWithLoadout(campaign.consumables, gameState.consumables, campaign.getConsumableStockCap())');
        expect(SORTIE_MANAGER_SOURCE).toContain('gameState.maxConsumables = campaign.getConsumableStockCap();');
        expect(QUARTERMASTER_SOURCE).toContain('campaign.getConsumableStockCap()');
    });
});

describe('Gratuities Ledger (creditClientRelationship)', () => {
    it('the ctx hook mutates the one owner and records the stationery minutes line', () => {
        expect(CAMPAIGN_UI_STATE_SOURCE).toContain('creditClientRelationship: (client: string, n: number) => {');
        expect(CAMPAIGN_UI_STATE_SOURCE).toContain('this.contractsCompletedByClient[client] =');
        expect(CAMPAIGN_UI_STATE_SOURCE).toContain("Entertainments & gratuities rendered to ${client}. The ledger notes 'stationery.'");
        expect(CAMPAIGN_UI_STATE_SOURCE).toContain('retainerClients: Object.keys(CLIENT_RETAINER_ORDER_IDS)');
    });

    it('the project picks via the pure helper and credits GRATUITIES_CREDIT_PER_QUARTER, never importing CampaignUiState', () => {
        const body = extractMethod(GRATUITIES_SOURCE, 'public override onQuarterEnd(ctx: QuarterEndContext): void');
        expect(body).toContain('pickMostServedClient(ctx.contractsCompletedByClient, ctx.retainerClients)');
        expect(body).toContain('ctx.creditClientRelationship(client, GRATUITIES_CREDIT_PER_QUARTER)');
        // Doc comments may MENTION CampaignUiState; an import STATEMENT of
        // it (or of anything under screens/) is what would break the
        // layering. Import lines here are single-line, anchored at column 0.
        expect(GRATUITIES_SOURCE).not.toMatch(/^import[^\n]*CampaignUiState/m);
        expect(GRATUITIES_SOURCE).not.toMatch(/^import[^\n]*screens\//m);
    });
});
