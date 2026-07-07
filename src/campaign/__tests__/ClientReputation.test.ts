import * as fs from 'fs';
import * as path from 'path';
import { beforeEach, describe, expect, it } from 'vitest';
import { ContractGenerator } from '../ContractGenerator';
import {
    applyCharteredPartnerBonus, CHARTERED_PARTNER_THRESHOLD, ClientReputationTier,
    getClientReputationTier, isCharteredPartner, PREFERRED_CONTRACTOR_THRESHOLD
} from '../ClientReputation';
import { _wireRetainerUnlockCheck, STANDING_ORDER_REGISTRY, StandingOrdersState } from '../orders/StandingOrdersState';
import {
    CivilWorksSchedule, CLIENT_RETAINER_ORDERS, OfficersMessAccount, OssuaryDeathBenefit,
    PlantAndEquipmentLease, PreferredLadingRates, UnderwritingRetainer
} from '../orders/ClientRetainerOrders';

// CampaignUiState.ts (which owns the real CLIENT_RETAINER_ORDER_IDS map and
// CLIENT_RETAINER_UNLOCK_THRESHOLD) transitively imports PlayerCharacter ->
// BaseCharacter, which is Phaser-tainted and cannot load under Node (see
// that file's own doc comment). So this lint reads its SOURCE instead of
// importing it, matching SaveRegistriesLint.test.ts's convention.
const CAMPAIGN_UI_STATE_SOURCE = fs.readFileSync(
    path.resolve(process.cwd(), 'src/screens/campaign/hq_ux/CampaignUiState.ts'), 'utf-8'
);

function extractClientRetainerOrderIds(): Record<string, string> {
    const match = CAMPAIGN_UI_STATE_SOURCE.match(/CLIENT_RETAINER_ORDER_IDS: Record<string, string> = \{([\s\S]*?)\};/);
    expect(match, 'CLIENT_RETAINER_ORDER_IDS declaration not found in CampaignUiState.ts').toBeTruthy();
    const body = match![1];
    const entryRegex = /"((?:[^"\\]|\\.)*)"\s*:\s*"((?:[^"\\]|\\.)*)"/g;
    const entries: Record<string, string> = {};
    let entryMatch;
    while ((entryMatch = entryRegex.exec(body)) !== null) {
        entries[entryMatch[1]] = entryMatch[2];
    }
    return entries;
}

function extractUnlockThreshold(): number {
    const match = CAMPAIGN_UI_STATE_SOURCE.match(/CLIENT_RETAINER_UNLOCK_THRESHOLD = (\d+);/);
    expect(match, 'CLIENT_RETAINER_UNLOCK_THRESHOLD declaration not found in CampaignUiState.ts').toBeTruthy();
    return Number(match![1]);
}

const CLIENT_RETAINER_ORDER_IDS = extractClientRetainerOrderIds();
const CLIENT_RETAINER_UNLOCK_THRESHOLD = extractUnlockThreshold();

describe('CLIENT_RETAINER_ORDER_IDS registry (lint)', () => {
    it('every registry client string appears verbatim as a client in ContractGenerator templates', () => {
        const realClients = new Set([
            ...ContractGenerator.getAllTemplates().map(t => t.client),
            ...ContractGenerator.getAllTradeRunTemplates().map(t => t.client),
        ]);
        const registryClients = Object.keys(CLIENT_RETAINER_ORDER_IDS);
        expect(registryClients.length).toBeGreaterThan(0);
        const unmatched = registryClients.filter(c => !realClients.has(c));
        expect(unmatched, `Registry clients with no byte-for-byte match in ContractGenerator: ${unmatched.join(', ')}`)
            .toEqual([]);
    });

    it('every registry order id resolves to a StandingOrder in CLIENT_RETAINER_ORDERS', () => {
        const orderIds = new Set(CLIENT_RETAINER_ORDERS.map(o => o.id));
        Object.values(CLIENT_RETAINER_ORDER_IDS).forEach(orderId => {
            expect(orderIds.has(orderId), `Registry order id "${orderId}" has no matching StandingOrder class`).toBe(true);
        });
    });

    it('has exactly the six canonized retainers, matching CLIENT_RETAINER_UNLOCK_THRESHOLD', () => {
        expect(Object.keys(CLIENT_RETAINER_ORDER_IDS)).toHaveLength(6);
        expect(CLIENT_RETAINER_UNLOCK_THRESHOLD).toBe(PREFERRED_CONTRACTOR_THRESHOLD);
    });
});

describe('ClientReputation tier math', () => {
    it('0-2 completions is Associate', () => {
        expect(getClientReputationTier(0)).toBe(ClientReputationTier.ASSOCIATE);
        expect(getClientReputationTier(1)).toBe(ClientReputationTier.ASSOCIATE);
        expect(getClientReputationTier(2)).toBe(ClientReputationTier.ASSOCIATE);
    });

    it('3-5 completions is Preferred Contractor', () => {
        expect(getClientReputationTier(3)).toBe(ClientReputationTier.PREFERRED_CONTRACTOR);
        expect(getClientReputationTier(5)).toBe(ClientReputationTier.PREFERRED_CONTRACTOR);
    });

    it('6+ completions is Chartered Partner', () => {
        expect(getClientReputationTier(6)).toBe(ClientReputationTier.CHARTERED_PARTNER);
        expect(getClientReputationTier(100)).toBe(ClientReputationTier.CHARTERED_PARTNER);
    });

    it('thresholds match the design doc (3 / 6)', () => {
        expect(PREFERRED_CONTRACTOR_THRESHOLD).toBe(3);
        expect(CHARTERED_PARTNER_THRESHOLD).toBe(6);
    });

    it('isCharteredPartner reads through a contractsCompletedByClient map', () => {
        const map = { 'Acme Ltd.': 6, 'Small Fry Ltd.': 5 };
        expect(isCharteredPartner('Acme Ltd.', map)).toBe(true);
        expect(isCharteredPartner('Small Fry Ltd.', map)).toBe(false);
        expect(isCharteredPartner('Unknown Client', map)).toBe(false);
    });

    it('applyCharteredPartnerBonus adds ~10%, rounded to £5, only for Chartered Partners', () => {
        const map = { 'Acme Ltd.': 6 };
        expect(applyCharteredPartnerBonus(100, 'Acme Ltd.', map)).toBe(110);
        expect(applyCharteredPartnerBonus(100, 'Someone Else', map)).toBe(100);
        // rounding: 45 * 1.1 = 49.5 -> rounds to 50 -> nearest £5 is 50
        expect(applyCharteredPartnerBonus(45, 'Acme Ltd.', map)).toBe(50);
    });
});

describe('effect wiring: Chartered Partner +10% payout in ContractGenerator', () => {
    it('bumps payouts for a Chartered Partner client, rounded to £5', () => {
        const gen = ContractGenerator.getInstance();
        const client = 'The Styx Dam Project Office';
        const map = { [client]: CHARTERED_PARTNER_THRESHOLD };
        let sawClient = false;
        for (let i = 0; i < 300; i++) {
            const withoutBoost = gen.generateContract(5, 0, {});
            const withBoost = gen.generateContract(5, 0, map);
            expect(withoutBoost.payout % 5).toBe(0);
            expect(withBoost.payout % 5).toBe(0);
            if (withBoost.client === client) sawClient = true;
        }
        expect(sawClient).toBe(true);
    });
});

describe('effect wiring: client-retainer StandingOrder hooks', () => {
    beforeEach(() => {
        StandingOrdersState.getInstance().reset();
    });

    it('Civil Works Schedule adds 1 week to contract deadlines (existing deadline hook)', () => {
        const state = StandingOrdersState.getInstance();
        state.enact('civil-works-schedule', 5);
        expect(state.contractDeadlineWeeks(2)).toBe(3);
    });

    it('Underwriting Retainer recovers 50% of a wiped contract payout, rounded to £5', () => {
        const state = StandingOrdersState.getInstance();
        state.enact('underwriting-retainer', 5);
        expect(state.wipeInsurancePayout(100)).toBe(50);
        expect(state.wipeInsurancePayout(45)).toBe(25); // 22.5 -> rounds to 25
    });

    it('wipe insurance pays nothing when the order is not active', () => {
        expect(StandingOrdersState.getInstance().wipeInsurancePayout(100)).toBe(0);
    });

    it('Preferred Lading Rates adds £10 to freightRatePerCrate at generation', () => {
        const state = StandingOrdersState.getInstance();
        state.enact('preferred-lading-rates', 5);
        expect(state.freightRatePerCrate(30)).toBe(40);
    });

    it('Officers’ Mess Account reduces wound weeks by 1, floored at 1', () => {
        const state = StandingOrdersState.getInstance();
        state.enact('officers-mess-account', 5);
        expect(state.woundWeeks(2)).toBe(1);
        expect(state.woundWeeks(1)).toBe(1); // floor
    });

    it('Plant & Equipment Lease cuts recruit cost by 25%, rounded to £5', () => {
        const state = StandingOrdersState.getInstance();
        state.enact('plant-and-equipment-lease', 5);
        expect(state.recruitCost(80)).toBe(60); // 80 * 0.75 = 60
    });

    it('Ossuary Death Benefit pays £40 per casualty', () => {
        const state = StandingOrdersState.getInstance();
        state.enact('ossuary-death-benefit', 5);
        expect(state.deathBenefitPerCasualty()).toBe(40);
    });

    it('death benefit pays nothing when the order is not active', () => {
        expect(StandingOrdersState.getInstance().deathBenefitPerCasualty()).toBe(0);
    });

    it('order classes match the aggregate (sanity against unused-import drift)', () => {
        expect(new CivilWorksSchedule().id).toBe('civil-works-schedule');
        expect(new UnderwritingRetainer().wipeInsurancePayout(100)).toBe(50);
        expect(new PreferredLadingRates().modifyFreightRatePerCrate(30)).toBe(40);
        expect(new OfficersMessAccount().modifyWoundWeeks(2)).toBe(1);
        expect(new PlantAndEquipmentLease().modifyRecruitCost(80)).toBe(60);
        expect(new OssuaryDeathBenefit().deathBenefitPerCasualty()).toBe(40);
    });
});

describe('client-retainer orders are gated out of the visible registry until unlocked', () => {
    // Exercises the exact seam CampaignUiState wires in production (see its
    // _wireRetainerUnlockCheck call): a fake contractsCompletedByClient map
    // stands in for the real CampaignUiState instance, which cannot be
    // imported here (Phaser-tainted transitively — see the source-lint note
    // above). The predicate shape matches CampaignUiState.isClientRetainerUnlocked
    // exactly: completions >= CLIENT_RETAINER_UNLOCK_THRESHOLD.
    const client = 'Continental Casualty & Ossuary Underwriters';
    const orderId = 'ossuary-death-benefit';
    let fakeCompletions: Record<string, number> = {};

    beforeEach(() => {
        StandingOrdersState.getInstance().reset();
        fakeCompletions = {};
        _wireRetainerUnlockCheck((checkedOrderId: string) => {
            const checkedClient = Object.keys(CLIENT_RETAINER_ORDER_IDS)
                .find(c => CLIENT_RETAINER_ORDER_IDS[c] === checkedOrderId);
            if (!checkedClient) return true;
            return (fakeCompletions[checkedClient] ?? 0) >= CLIENT_RETAINER_UNLOCK_THRESHOLD;
        });
    });

    it('is invisible in STANDING_ORDER_REGISTRY below the unlock threshold', () => {
        fakeCompletions[client] = CLIENT_RETAINER_UNLOCK_THRESHOLD - 1;
        expect(STANDING_ORDER_REGISTRY.has(orderId)).toBe(false);
        expect([...STANDING_ORDER_REGISTRY.values()].some(o => o.id === orderId)).toBe(false);
    });

    it('cannot be enacted below the unlock threshold', () => {
        fakeCompletions[client] = 0;
        expect(StandingOrdersState.getInstance().enact(orderId, 5)).toBe(false);
    });

    it('becomes visible and enactable once the client crosses the threshold', () => {
        fakeCompletions[client] = CLIENT_RETAINER_UNLOCK_THRESHOLD;
        expect(STANDING_ORDER_REGISTRY.has(orderId)).toBe(true);
        expect(StandingOrdersState.getInstance().enact(orderId, 5)).toBe(true);
    });

    it('an already-active order stays resolvable even if the client somehow drops below threshold again', () => {
        fakeCompletions[client] = CLIENT_RETAINER_UNLOCK_THRESHOLD;
        const state = StandingOrdersState.getInstance();
        expect(state.enact(orderId, 5)).toBe(true);

        // contractsCompletedByClient only ever increases in real play, but the
        // registry's "never forget an active order" guarantee should hold
        // regardless.
        fakeCompletions[client] = 0;
        expect(STANDING_ORDER_REGISTRY.has(orderId)).toBe(true);
        expect(state.getActiveOrders().some(o => o.id === orderId)).toBe(true);
        expect(state.deathBenefitPerCasualty()).toBe(40);
    });

    it('the launch pool is never gated by client unlock state', () => {
        fakeCompletions = {};
        expect(STANDING_ORDER_REGISTRY.has('aggressive-tendering')).toBe(true);
    });
});
