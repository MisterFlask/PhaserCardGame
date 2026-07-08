import { describe, expect, it } from 'vitest';
import { ContractGenerator } from '../ContractGenerator';
import {
    UNION_TERRITORY_REGION, unionFreightRatePerCrate, unionHostile, unionHostilityTier,
    unionLaborFrictionActive, unionOrderSlotPenalty, unionRecruitCost, unionTherapyCost, unionWoundWeeks,
} from '../FactionPressures';
import { FactionHostilityTier } from '../Factions';

// Union standing = -(Barons completions) - (Overseers completions) (Factions.ts:
// the Union has two rivals and no clients of its own).
const FRICTION_MAP = {
    'The Brimstone Barons, jointly': 3,
    'Dis Foundry Belt Board of Overseers': 3,
}; // standing -6: Blacklisted, not Hostile

const HOSTILE_MAP = {
    'The Brimstone Barons, jointly': 5,
    'Dis Foundry Belt Board of Overseers': 4,
}; // standing -9: Hostile

describe('FactionPressures: tier gating', () => {
    it('an empty map is a total no-op', () => {
        expect(unionRecruitCost(100, {})).toBe(100);
        expect(unionTherapyCost(30, {})).toBe(30);
        expect(unionWoundWeeks(2, {})).toBe(2);
        expect(unionOrderSlotPenalty({})).toBe(0);
        expect(unionFreightRatePerCrate(45, UNION_TERRITORY_REGION, {})).toBe(45);
        expect(unionHostilityTier({})).toBe(FactionHostilityTier.CORDIAL);
        expect(unionLaborFrictionActive({})).toBe(false);
        expect(unionHostile({})).toBe(false);
    });

    it('standing -6 (Blacklisted): friction active but NOT hostile', () => {
        expect(unionHostilityTier(FRICTION_MAP)).toBe(FactionHostilityTier.BLACKLISTED);
        expect(unionLaborFrictionActive(FRICTION_MAP)).toBe(true);
        expect(unionHostile(FRICTION_MAP)).toBe(false);

        expect(unionRecruitCost(100, FRICTION_MAP)).toBe(125);
        expect(unionTherapyCost(30, FRICTION_MAP)).toBe(40); // 30*1.25=37.5 -> Math.round(37.5/5)*5 = Math.round(7.5)*5 = 8*5 = 40
        expect(unionOrderSlotPenalty(FRICTION_MAP)).toBe(0);
        expect(unionFreightRatePerCrate(45, UNION_TERRITORY_REGION, FRICTION_MAP)).toBe(45);
    });

    it('standing -9 (Hostile): everything applies', () => {
        expect(unionHostilityTier(HOSTILE_MAP)).toBe(FactionHostilityTier.HOSTILE);
        expect(unionLaborFrictionActive(HOSTILE_MAP)).toBe(true);
        expect(unionHostile(HOSTILE_MAP)).toBe(true);

        expect(unionRecruitCost(100, HOSTILE_MAP)).toBe(125);
        expect(unionWoundWeeks(2, HOSTILE_MAP)).toBe(3);
        expect(unionOrderSlotPenalty(HOSTILE_MAP)).toBe(1);
        expect(unionFreightRatePerCrate(45, UNION_TERRITORY_REGION, HOSTILE_MAP)).toBe(35);
    });
});

describe('FactionPressures: rounding (re-round to £5, Math.round semantics)', () => {
    it('90 x1.25 = 112.5 -> Math.round(112.5/5)*5 = 115', () => {
        expect(unionRecruitCost(90, HOSTILE_MAP)).toBe(115);
    });

    it('a clean case: 100 x1.25 = 125, already a multiple of 5', () => {
        expect(unionRecruitCost(100, HOSTILE_MAP)).toBe(125);
    });
});

describe('FactionPressures: wounds', () => {
    it('adds exactly 1 week under friction', () => {
        expect(unionWoundWeeks(2, FRICTION_MAP)).toBe(3);
    });

    it('leaves wounds unchanged when not under friction', () => {
        const notedMap = { 'The Brimstone Barons, jointly': 3 }; // standing -3, Noted
        expect(unionWoundWeeks(2, notedMap)).toBe(2);
    });
});

describe('FactionPressures: freight', () => {
    it('Dis Foundry Belt, hostile: -£10/crate', () => {
        expect(unionFreightRatePerCrate(45, 'Dis Foundry Belt', HOSTILE_MAP)).toBe(35);
    });

    it('a different region is untouched even while hostile', () => {
        expect(unionFreightRatePerCrate(45, 'Styx Delta', HOSTILE_MAP)).toBe(45);
    });

    it('floors at £5/crate ("crates get mishandled")', () => {
        expect(unionFreightRatePerCrate(10, 'Dis Foundry Belt', HOSTILE_MAP)).toBe(5);
    });
});

describe('FactionPressures: UNION_TERRITORY_REGION sanity', () => {
    it('the trade-run template pool is non-empty (lint-style sanity)', () => {
        expect(ContractGenerator.getAllTradeRunTemplates().length).toBeGreaterThan(0);
    });

    // getAllTradeRunTemplates() flattens templates and does not carry region
    // names (TradeRunRegion is not exposed), so this asserts the registry
    // constant against the literal from ContractGenerator's TRADE_RUN_REGIONS
    // ("Dis Foundry Belt") rather than cross-checking an exposed region list.
    // Noted in the implementation report per the brief.
    it('UNION_TERRITORY_REGION matches the real "Dis Foundry Belt" trade-run region', () => {
        expect(UNION_TERRITORY_REGION).toBe('Dis Foundry Belt');
    });
});
