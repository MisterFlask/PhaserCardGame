// Calendar/contract DTO conversions. Phaser-free (Contract and
// CampaignCalendar are pure), so these are unit-testable under Node;
// CampaignSerializer delegates to them.

import { CampaignCalendar } from "../campaign/CampaignCalendar";
import { Contract, ContractType } from "../campaign/Contract";
import { STANDING_ORDER_REGISTRY, StandingOrdersState } from "../campaign/orders/StandingOrdersState";
import { CalendarDTO, ContractDTO, StandingOrdersDTO } from "./SaveDTOs";

export function calendarToDTO(cal: CampaignCalendar): CalendarDTO {
    return {
        week: cal.week,
        shareholderSatisfaction: cal.shareholderSatisfaction,
        currentDividendExpectation: cal.currentDividendExpectation,
        boardEvents: cal.boardEvents.map(e => ({ ...e })),
    };
}

export function calendarFromDTO(dto: CalendarDTO): CampaignCalendar {
    const cal = new CampaignCalendar();
    cal.week = dto.week;
    cal.shareholderSatisfaction = dto.shareholderSatisfaction;
    cal.currentDividendExpectation = dto.currentDividendExpectation;
    cal.boardEvents = dto.boardEvents.map(e => ({ ...e }));
    return cal;
}

export function contractToDTO(c: Contract): ContractDTO {
    return {
        name: c.name,
        description: c.description,
        type: c.type,
        client: c.client,
        paymentClause: c.paymentClause,
        act: c.act,
        segment: c.segment,
        difficultyStars: c.difficultyStars,
        numCombats: c.numCombats,
        deadlineWeeks: c.deadlineWeeks,
        durationWeeks: c.durationWeeks,
        payout: c.payout,
        squadSize: c.squadSize,
        regionName: c.regionName,
        consumableRewardName: c.consumableRewardName,
        maxCrates: c.maxCrates,
        freightRatePerCrate: c.freightRatePerCrate,
        vpReward: c.vpReward,
        exemptFromBoardSlots: c.exemptFromBoardSlots,
        // Omitted entirely (not null) on non-recovery contracts, keeping
        // their DTO shape unchanged from v15.
        ...(c.recoveryOfSouls ? { recoveryOfSouls: [...c.recoveryOfSouls] } : {}),
    };
}

export function contractFromDTO(dto: ContractDTO): Contract {
    const contract = new Contract({
        name: dto.name,
        description: dto.description,
        type: dto.type as ContractType,
        client: dto.client,
        paymentClause: dto.paymentClause,
        act: dto.act,
        segment: dto.segment,
        difficultyStars: dto.difficultyStars,
        numCombats: dto.numCombats,
        deadlineWeeks: dto.deadlineWeeks,
        durationWeeks: dto.durationWeeks,
        payout: dto.payout,
        squadSize: dto.squadSize,
        regionName: dto.regionName,
        consumableRewardName: dto.consumableRewardName,
        maxCrates: dto.maxCrates,
        freightRatePerCrate: dto.freightRatePerCrate,
        vpReward: dto.vpReward,
    });
    // Not a constructor arg (set post-construction by generateLegationContract,
    // same as the generator does) — absent on pre-v15 shapes, so default false.
    contract.exemptFromBoardSlots = dto.exemptFromBoardSlots ?? false;
    if (dto.recoveryOfSouls) {
        contract.recoveryOfSouls = [...dto.recoveryOfSouls];
    }
    return contract;
}

export function standingOrdersToDTO(state: StandingOrdersState): StandingOrdersDTO {
    return {
        active: [...state.activeOrderIds],
        pending: state.pendingOrderIds === null ? null : [...state.pendingOrderIds],
        bonusSlots: state.bonusSlots,
    };
}

/** Unknown order ids are dropped (with a warning) rather than crashing the load. */
export function applyStandingOrdersDTO(state: StandingOrdersState, dto: StandingOrdersDTO): void {
    const filterKnown = (ids: string[]): string[] => ids.filter(id => {
        const known = STANDING_ORDER_REGISTRY.has(id);
        if (!known) console.warn(`StandingOrdersState: unknown order id "${id}" in save, dropping`);
        return known;
    });

    state.activeOrderIds = filterKnown(dto.active);
    state.pendingOrderIds = dto.pending === null ? null : filterKnown(dto.pending);
    state.bonusSlots = dto.bonusSlots;
}
