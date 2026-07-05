// Calendar/contract DTO conversions. Phaser-free (Contract and
// CampaignCalendar are pure), so these are unit-testable under Node;
// CampaignSerializer delegates to them.

import { CampaignCalendar } from "../campaign/CampaignCalendar";
import { Contract, ContractType } from "../campaign/Contract";
import { CalendarDTO, ContractDTO } from "./SaveDTOs";

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
        regionName: c.regionName,
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
        regionName: dto.regionName,
    });
}
