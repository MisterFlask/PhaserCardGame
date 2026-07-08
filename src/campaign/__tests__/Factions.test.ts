import { describe, expect, it } from 'vitest';
import { ContractGenerator } from '../ContractGenerator';
import {
    BLACKLISTED_STANDING_THRESHOLD, CLIENT_FACTIONS, Faction, FactionHostilityTier,
    filterBlacklistedTemplates, getFactionForClient, getFactionStanding, getHostilityTier,
    isFactionBlacklisted, NOTED_STANDING_THRESHOLD, offendedFactionsForClient, rivalsOf, RIVALRIES,
} from '../Factions';

describe('CLIENT_FACTIONS / RIVALRIES registry (lint)', () => {
    it('every generator client string (bounty + trade run) maps to a faction', () => {
        const realClients = [
            ...ContractGenerator.getAllTemplates().map(t => t.client),
            ...ContractGenerator.getAllTradeRunTemplates().map(t => t.client),
        ];
        const unmapped = realClients.filter(c => getFactionForClient(c) === undefined);
        expect(unmapped, `Generator clients with no Factions.ts entry: ${unmapped.join(', ')}`).toEqual([]);
    });

    it('every RIVALRIES pair references two distinct declared factions', () => {
        const declared = new Set(Object.values(Faction));
        for (const [a, b] of RIVALRIES) {
            expect(declared.has(a), `Rivalry pair references undeclared faction: ${a}`).toBe(true);
            expect(declared.has(b), `Rivalry pair references undeclared faction: ${b}`).toBe(true);
            expect(a, `Rivalry pair must reference two distinct factions: ${a} / ${b}`).not.toBe(b);
        }
    });
});

describe('standing math', () => {
    it('an empty map gives every faction a standing of 0', () => {
        for (const faction of Object.values(Faction)) {
            expect(getFactionStanding(faction, {})).toBe(0);
        }
    });

    it('Ferry completions credit the Boatmen\'s Guild and debit the mirrored British Crown', () => {
        const map = { 'Styx Delta Ferry & Lighterage Company': 6 };
        expect(getFactionStanding(Faction.BOATMENS_GUILD, map)).toBe(6);
        expect(getFactionStanding(Faction.BRITISH_CROWN, map)).toBe(-6);
    });

    it('the Stokers\' Union two-rival case sums both Barons and Overseers completions', () => {
        const map = {
            'Dis Foundry Belt Board of Overseers': 3,
            'The Brimstone Barons, jointly': 2,
        };
        expect(getFactionStanding(Faction.STOKERS_UNION, map)).toBe(-5);
    });

    it('multiple clients of the same faction sum together', () => {
        const map = {
            'The Styx Dam Project Office': 2,
            'The British Trade Delegation, Delta Office': 1,
            'The British Trade Delegation, Continental Office': 4,
        };
        expect(getFactionStanding(Faction.BRITISH_CROWN, map)).toBe(7);
    });
});

describe('rivalsOf', () => {
    it('reads both directions of a pair', () => {
        expect(rivalsOf(Faction.BRITISH_CROWN)).toEqual([Faction.BOATMENS_GUILD]);
        expect(rivalsOf(Faction.BOATMENS_GUILD)).toEqual([Faction.BRITISH_CROWN]);
    });

    it('the Stokers\' Union has two rivals', () => {
        const rivals = rivalsOf(Faction.STOKERS_UNION);
        expect(rivals).toHaveLength(2);
        expect(rivals).toContain(Faction.BRIMSTONE_BARONS);
        expect(rivals).toContain(Faction.DIS_OVERSEERS);
    });

    it('a faction with no rivalry has none', () => {
        expect(rivalsOf(Faction.UNDERWRITERS_POOL)).toEqual([]);
    });
});

describe('hostility tiers', () => {
    it('thresholds match the design doc (-3 / -6)', () => {
        expect(NOTED_STANDING_THRESHOLD).toBe(-3);
        expect(BLACKLISTED_STANDING_THRESHOLD).toBe(-6);
    });

    it('-2 is Cordial', () => {
        expect(getHostilityTier(-2)).toBe(FactionHostilityTier.CORDIAL);
    });

    it('-3 and -5 are Noted', () => {
        expect(getHostilityTier(-3)).toBe(FactionHostilityTier.NOTED);
        expect(getHostilityTier(-5)).toBe(FactionHostilityTier.NOTED);
    });

    it('-6 and -20 are Blacklisted', () => {
        expect(getHostilityTier(-6)).toBe(FactionHostilityTier.BLACKLISTED);
        expect(getHostilityTier(-20)).toBe(FactionHostilityTier.BLACKLISTED);
    });

    it('+6 is Cordial', () => {
        expect(getHostilityTier(6)).toBe(FactionHostilityTier.CORDIAL);
    });

    it('does not declare a Hostile tier', () => {
        expect(Object.values(FactionHostilityTier)).toEqual(['Cordial', 'Noted', 'Blacklisted']);
    });
});

describe('isFactionBlacklisted / filterBlacklistedTemplates', () => {
    it('drops templates whose client belongs to a Blacklisted faction, keeping the rest', () => {
        const map = { 'Styx Delta Ferry & Lighterage Company': 6 };
        expect(isFactionBlacklisted(Faction.BRITISH_CROWN, map)).toBe(true);

        const mixedTemplates = ContractGenerator.getAllTemplates().filter(t =>
            getFactionForClient(t.client) !== undefined
        );
        // Sanity: the flavor tables do carry British Crown clients alongside
        // others, so this is actually exercising the filter, not a no-op.
        expect(mixedTemplates.some(t => getFactionForClient(t.client) === Faction.BRITISH_CROWN)).toBe(true);

        const filtered = filterBlacklistedTemplates(mixedTemplates, map);
        expect(filtered.some(t => getFactionForClient(t.client) === Faction.BRITISH_CROWN)).toBe(false);
        expect(filtered.length).toBeGreaterThan(0);
        expect(filtered.length).toBeLessThan(mixedTemplates.length);
    });

    it('falls back to the original list unchanged when filtering would empty it', () => {
        const map = { 'Styx Delta Ferry & Lighterage Company': 6 };
        const onlyBritishTemplates = ContractGenerator.getAllTemplates().filter(t =>
            getFactionForClient(t.client) === Faction.BRITISH_CROWN
        );
        expect(onlyBritishTemplates.length).toBeGreaterThan(0);
        const filtered = filterBlacklistedTemplates(onlyBritishTemplates, map);
        expect(filtered).toBe(onlyBritishTemplates);
    });
});

describe('effect wiring: faction blacklist in ContractGenerator', () => {
    it('a Blacklisted faction\'s clients never appear, but other clients still do', () => {
        const gen = ContractGenerator.getInstance();
        const map = { 'Styx Delta Ferry & Lighterage Company': 6 };
        let sawNonBritish = false;
        for (let i = 0; i < 300; i++) {
            const contract = gen.generateContract(1, 0, map);
            expect(getFactionForClient(contract.client)).not.toBe(Faction.BRITISH_CROWN);
            if (getFactionForClient(contract.client) !== Faction.BRITISH_CROWN) sawNonBritish = true;
        }
        expect(sawNonBritish).toBe(true);
    });
});

describe('offendedFactionsForClient', () => {
    it('a Barons client offends the Stokers\' Union', () => {
        expect(offendedFactionsForClient('Brimstone Barons Equipment Leasing Consortium')).toEqual([Faction.STOKERS_UNION]);
    });

    it('an Underwriters client offends no one (the always-open fallback)', () => {
        expect(offendedFactionsForClient('Infernal Marine & Postal Underwriters, Ltd.')).toEqual([]);
    });

    it('the internal Court of Directors client is unmapped and offends no one', () => {
        expect(offendedFactionsForClient('The Court of Directors')).toEqual([]);
        expect(getFactionForClient('The Court of Directors')).toBeUndefined();
    });
});

describe('CLIENT_FACTIONS sanity', () => {
    it('has no entry for the internal Court of Directors client', () => {
        expect(CLIENT_FACTIONS['The Court of Directors']).toBeUndefined();
    });

    it('never maps a client to the Stokers\' Union (labor commissions no mercenaries)', () => {
        expect(Object.values(CLIENT_FACTIONS)).not.toContain(Faction.STOKERS_UNION);
    });
});
