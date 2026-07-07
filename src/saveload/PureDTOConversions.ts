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
    };
}

export function contractFromDTO(dto: ContractDTO): Contract {
    return new Contract({
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
    });
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
