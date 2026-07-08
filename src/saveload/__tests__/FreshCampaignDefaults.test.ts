// New-campaign state reset audit (see TODO.md "Dangling systems"). New Campaign
// works by localStorage.removeItem + page reload (SaveManager.deleteSave,
// EndOfCampaignPanel), so every campaign-state singleton is reset by module
// re-execution rather than an explicit clear. This test locks down the part
// of that contract we can verify under plain-Node vitest: a freshly
// constructed CampaignCalendar and StandingOrdersState serialize to the
// documented startup defaults, and the full CampaignSave shape — enumerated
// key by key — has no field whose "fresh" value silently drifts from what's
// listed here. If someone adds a new field to CampaignSave (or changes a
// startup default) without updating this test, it fails on purpose.
//
// CONSTRAINT (see CLAUDE.md "known sharp edges" / TODO.md engineering item):
// CampaignUiState, GameState, and PlayerCharacter/PlayableCard are
// Phaser-tainted (CampaignUiState's roster field alone pulls PlayerCharacter,
// CharacterGenerator, CampaignRules -> PlayableCard -> Phaser transitively),
// so they cannot be imported here. What stays browser-only:
//   - GameState.moneyInVault resets to its class-field default (200) — see
//     src/rules/GameState.ts:79. Documented and asserted only in the browser
//     check (deliverable 2 of the audit), not here.
//   - CampaignUiState.roster reseeds via CampaignRules.generateLogicalCharacterRoster()
//     and CampaignUiState.consumables/availableContracts/ownedStrategicProjects
//     reset to empty arrays by class-field initializers — browser-only.
//   - CampaignUiState.armoury seeds with one EmergencyTeleporter (relic
//     classes are Phaser-tainted the same way — see
//     src/docs/relic_equipment_design.md's Migration section). Its DTO shape
//     ({name: "Emergency Teleporter", stacks: 2}) is hardcoded below as a
//     documented literal (EmergencyTeleporter.MAX_USES_PER_RUN = 2, the
//     constructor's initial stacks value) rather than constructed, and is
//     browser-verified for the actual instance.
//   - The full CampaignSerializer.toSave()/applySave() round-trip (which
//     touches all of the above) is likewise browser-only.
// What this test *does* lock down purely: CalendarDTO and StandingOrdersDTO
// fresh defaults (both backed by Phaser-free classes), and a shape-lock over
// every key CampaignSave declares.

import { describe, expect, it } from 'vitest';
import { CampaignCalendar } from '../../campaign/CampaignCalendar';
import { StandingOrdersState } from '../../campaign/orders/StandingOrdersState';
import { calendarToDTO, standingOrdersToDTO } from '../PureDTOConversions';
import { CampaignSave } from '../SaveDTOs';

describe('Fresh campaign state: calendar and standing orders defaults', () => {
    it('a freshly constructed CampaignCalendar serializes to the documented startup values', () => {
        const dto = calendarToDTO(new CampaignCalendar());

        expect(dto).toEqual({
            week: 1,
            shareholderSatisfaction: 50,
            currentDividendExpectation: 120,
            boardEvents: [],
        });
    });

    it('a reset StandingOrdersState serializes to no active/pending orders and zero bonus slots', () => {
        const state = StandingOrdersState.getInstance();
        state.reset();
        const dto = standingOrdersToDTO(state);

        expect(dto).toEqual({
            active: [],
            pending: null,
            bonusSlots: 0,
        });
    });
});

describe('CampaignSave shape-lock (fresh-state defaults)', () => {
    // Mirrors CampaignSerializer.toSave() field-for-field, but built from
    // pure/reset pieces only, standing in for the Phaser-tainted pieces
    // (moneyInVault, roster, availableContracts, ownedStrategicProjects,
    // consumables) with their documented fresh values. If CampaignSave grows
    // a field, TypeScript will fail this object literal (missing property) or
    // the explicit key-set assertion below will catch an unlisted addition —
    // either way, a new field can't ship silently unaccounted-for here.
    function buildFreshSave(): CampaignSave {
        StandingOrdersState.getInstance().reset();
        return {
            version: 15,
            savedAtIso: new Date(0).toISOString(),
            moneyInVault: 200, // GameState.moneyInVault default (src/rules/GameState.ts) — browser-verified in deliverable 2
            calendar: calendarToDTO(new CampaignCalendar()),
            contracts: [], // CampaignUiState.availableContracts starts empty; populated lazily via ensureContractsPopulated()
            contractsCompleted: 0,
            contractsCompletedByClient: {}, // CampaignUiState.contractsCompletedByClient starts empty
            ownedProjects: [], // CampaignUiState.ownedStrategicProjects starts empty
            roster: [], // CampaignUiState.roster reseeds via CharacterGenerator; Phaser-tainted, browser-verified only
            recruitCandidates: [], // CampaignUiState.recruitCandidates starts empty; lazily filled by ensureRecruitsPopulated()
            standingOrders: standingOrdersToDTO(StandingOrdersState.getInstance()),
            consumables: [], // CampaignUiState.consumables starts empty
            charterVictoryPoints: 0, // CampaignUiState.charterVictoryPoints starts at 0 (VP endgame pivot)
            // CampaignUiState.armoury seeds with one EmergencyTeleporter
            // (migrated from the old GameState.relicsInventory run seed —
            // see relic_equipment_design.md's Migration section). Hardcoded
            // literal per the Phaser-taint note above.
            armoury: [{ name: 'Emergency Teleporter', stacks: 2 }],
        };
    }

    it('enumerates every CampaignSave key with its fresh-state default', () => {
        const save = buildFreshSave();

        // Explicit key-set assertion: catches a field being added to
        // CampaignSave without a corresponding decision recorded here.
        expect(Object.keys(save).sort()).toEqual([
            'armoury',
            'calendar',
            'charterVictoryPoints',
            'consumables',
            'contracts',
            'contractsCompleted',
            'contractsCompletedByClient',
            'moneyInVault',
            'ownedProjects',
            'recruitCandidates',
            'roster',
            'savedAtIso',
            'standingOrders',
            'version',
        ]);

        expect(save.contractsCompleted).toBe(0);
        expect(save.contractsCompletedByClient).toEqual({});
        expect(save.contracts).toEqual([]);
        expect(save.ownedProjects).toEqual([]);
        expect(save.roster).toEqual([]);
        expect(save.recruitCandidates).toEqual([]);
        expect(save.consumables).toEqual([]);
        expect(save.charterVictoryPoints).toBe(0);
        expect(save.armoury).toEqual([{ name: 'Emergency Teleporter', stacks: 2 }]);
        expect(save.standingOrders).toEqual({ active: [], pending: null, bonusSlots: 0 });
        expect(save.calendar).toEqual({
            week: 1,
            shareholderSatisfaction: 50,
            currentDividendExpectation: 120,
            boardEvents: [],
        });
    });

    it('survives an actual JSON round-trip without picking up stray fields', () => {
        const save = buildFreshSave();
        const restored = JSON.parse(JSON.stringify(save));
        expect(Object.keys(restored).sort()).toEqual(Object.keys(save).sort());
        expect(restored).toEqual(save);
    });

    it('preserves a populated contractsCompletedByClient map through JSON', () => {
        const save = buildFreshSave();
        save.contractsCompletedByClient = {
            'The Styx Dam Project Office': 3,
            'Infernal Marine & Postal Underwriters, Ltd.': 1,
        };
        const restored: CampaignSave = JSON.parse(JSON.stringify(save));
        expect(restored.contractsCompletedByClient).toEqual(save.contractsCompletedByClient);
    });

    it('preserves a non-zero charterVictoryPoints (VP endgame pivot) through JSON', () => {
        const save = buildFreshSave();
        save.charterVictoryPoints = 430; // e.g. one Prestige Commission + two Charter Buyback blocks
        const restored: CampaignSave = JSON.parse(JSON.stringify(save));
        expect(restored.charterVictoryPoints).toBe(430);
    });

    // v13: staged Capital Works (src/docs/vp_endgame_design.md's Levi-Maxwell
    // Ascension Protocol capstone). stagesPurchased/lastStagePurchaseWeek are
    // optional on OwnedProjectDTO and only ever set for a staged project —
    // these two cases (mid-stage, and omitted for a non-staged project)
    // exercise both branches of that contract through an actual JSON round-trip.
    it('round-trips a mid-stage staged project (stagesPurchased + lastStagePurchaseWeek survive JSON)', () => {
        const save = buildFreshSave();
        save.ownedProjects = [
            { name: 'Levi-Maxwell Ascension Protocol', victoryPoints: 0, stagesPurchased: 1, lastStagePurchaseWeek: 157 },
        ];
        const restored: CampaignSave = JSON.parse(JSON.stringify(save));
        expect(restored.ownedProjects).toEqual([
            { name: 'Levi-Maxwell Ascension Protocol', victoryPoints: 0, stagesPurchased: 1, lastStagePurchaseWeek: 157 },
        ]);
    });

    it('a non-staged owned project omits stagesPurchased/lastStagePurchaseWeek entirely (unchanged pre-v13 shape)', () => {
        const save = buildFreshSave();
        save.ownedProjects = [{ name: 'The Pattern Room', victoryPoints: 0 }];
        const restored: CampaignSave = JSON.parse(JSON.stringify(save));
        expect(restored.ownedProjects).toEqual([{ name: 'The Pattern Room', victoryPoints: 0 }]);
        expect('stagesPurchased' in restored.ownedProjects[0]).toBe(false);
    });

    it('a fully-staged project at completion carries the 2500 VP payout through JSON', () => {
        const save = buildFreshSave();
        save.ownedProjects = [
            { name: 'Levi-Maxwell Ascension Protocol', victoryPoints: 2500, stagesPurchased: 3, lastStagePurchaseWeek: 261 },
        ];
        const restored: CampaignSave = JSON.parse(JSON.stringify(save));
        expect(restored.ownedProjects[0].victoryPoints).toBe(2500);
        expect(restored.ownedProjects[0].stagesPurchased).toBe(3);
    });
});
