import { describe, expect, it } from 'vitest';
import { pushWithArchiveCap, selectNonStarterCards, settleDeaths } from '../DeathSettlement';

// Real unit tests for the pure death-settlement rules (Capital Works Rebuild
// Batch C — amendment table #3/#4 and the binding Rulings section). The
// Phaser-side application of these plans (SortieManager/CampaignUiState) is
// source-lint covered in CapitalWorksRebuild.test.ts, matching convention.

describe('settleDeaths — the four settlement branches', () => {
    const deaths = ['Pte. Ostrander', 'Cpl. Weeks'];

    it('squad wipe: witness rule voids both escrow and probate — the dead are simply gone', () => {
        const plan = settleDeaths({ soulCollateralOwned: true, probateOwned: true, squadWiped: true, deaths });
        expect(plan.escrow).toEqual([]);
        expect(plan.archiveCardsOf).toEqual([]);
        expect(plan.permanentlyDead).toEqual(deaths);
        expect(plan.postRecoveryContract).toBe(false);
    });

    it('Soul Collateral owned on a won sortie: ALL dead go to escrow behind ONE contract; probate waits', () => {
        const plan = settleDeaths({ soulCollateralOwned: true, probateOwned: true, squadWiped: false, deaths });
        expect(plan.escrow).toEqual(deaths);
        expect(plan.archiveCardsOf).toEqual([]); // probate-ordering ruling: final death only
        expect(plan.permanentlyDead).toEqual([]);
        expect(plan.postRecoveryContract).toBe(true);
    });

    it('Probate alone: the dead are permanent and their cards archive immediately', () => {
        const plan = settleDeaths({ soulCollateralOwned: false, probateOwned: true, squadWiped: false, deaths });
        expect(plan.escrow).toEqual([]);
        expect(plan.archiveCardsOf).toEqual(deaths);
        expect(plan.permanentlyDead).toEqual(deaths);
        expect(plan.postRecoveryContract).toBe(false);
    });

    it('neither office: permanent loss, nothing else', () => {
        const plan = settleDeaths({ soulCollateralOwned: false, probateOwned: false, squadWiped: false, deaths });
        expect(plan.escrow).toEqual([]);
        expect(plan.archiveCardsOf).toEqual([]);
        expect(plan.permanentlyDead).toEqual(deaths);
        expect(plan.postRecoveryContract).toBe(false);
    });

    it('no deaths: an empty plan, never a contract', () => {
        const plan = settleDeaths({ soulCollateralOwned: true, probateOwned: true, squadWiped: false, deaths: [] });
        expect(plan).toEqual({ escrow: [], archiveCardsOf: [], permanentlyDead: [], postRecoveryContract: false });
    });

    it('the forfeit path re-enters with the collateral gone: probate fires at that moment', () => {
        // CampaignUiState.advanceWeeks forfeits a lapsed escrow by calling
        // settleDeaths with soulCollateralOwned=false — the lapsed souls are
        // finally dead and probate (if owned) applies NOW.
        const lapsed = settleDeaths({ soulCollateralOwned: false, probateOwned: true, squadWiped: false, deaths: ['Pte. Ostrander'] });
        expect(lapsed.archiveCardsOf).toEqual(['Pte. Ostrander']);
        expect(lapsed.permanentlyDead).toEqual(['Pte. Ostrander']);
        expect(lapsed.postRecoveryContract).toBe(false);
    });
});

describe('selectNonStarterCards — probate intake', () => {
    it('keeps master-deck cards whose name is absent from the starting kit', () => {
        const master = [{ name: 'Defend' }, { name: 'Fire Revolver' }, { name: 'Pyrestarter' }, { name: 'Smokescreen' }];
        const starters = [{ name: 'Defend' }, { name: 'Fire Revolver' }];
        expect(selectNonStarterCards(master, starters).map(c => c.name)).toEqual(['Pyrestarter', 'Smokescreen']);
    });

    it('an upgraded (renamed) starter counts as non-starter — the Company keeps what it improved', () => {
        const master = [{ name: 'Defend+🔮' }, { name: 'Defend' }];
        const starters = [{ name: 'Defend' }, { name: 'Defend' }];
        expect(selectNonStarterCards(master, starters).map(c => c.name)).toEqual(['Defend+🔮']);
    });

    it('a soldier with only their starting kit archives nothing', () => {
        const kit = [{ name: 'Defend' }, { name: 'Fire Revolver' }];
        expect(selectNonStarterCards(kit, kit)).toEqual([]);
    });
});

describe('pushWithArchiveCap — capacity 12, oldest struck off', () => {
    it('appends under the cap without dropping anything', () => {
        expect(pushWithArchiveCap([1, 2], [3, 4], 12)).toEqual([1, 2, 3, 4]);
    });

    it('drops the OLDEST entries (front of the array) past the cap', () => {
        const archive = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
        expect(pushWithArchiveCap(archive, [13, 14], 12)).toEqual([3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]);
    });

    it('an oversized single intake keeps only the newest cap-many cards', () => {
        const incoming = Array.from({ length: 15 }, (_, i) => i + 1);
        expect(pushWithArchiveCap([], incoming, 12)).toEqual(incoming.slice(3));
    });
});
