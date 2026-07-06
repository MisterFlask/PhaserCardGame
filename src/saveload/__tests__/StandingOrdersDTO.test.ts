import { beforeEach, describe, expect, it } from 'vitest';
import { StandingOrdersState } from '../../campaign/orders/StandingOrdersState';
import { applyStandingOrdersDTO, standingOrdersToDTO } from '../PureDTOConversions';

describe('Standing Orders DTO round-trip', () => {
    beforeEach(() => {
        StandingOrdersState.getInstance().reset();
    });

    it('preserves active ids, pending ids, and bonusSlots through JSON', () => {
        const state = StandingOrdersState.getInstance();
        state.enact('aggressive-tendering', 5);
        state.enact('punctuality-clause', 5);
        state.queueReplace('punctuality-clause', 'hazard-pay-schedule');
        state.bonusSlots = 1;

        const dto = JSON.parse(JSON.stringify(standingOrdersToDTO(state)));

        state.reset();
        applyStandingOrdersDTO(state, dto);

        expect(state.activeOrderIds).toEqual(['aggressive-tendering', 'punctuality-clause']);
        expect(state.pendingOrderIds).toEqual(['aggressive-tendering', 'hazard-pay-schedule']);
        expect(state.bonusSlots).toBe(1);
    });

    it('preserves a null pending (no queued change)', () => {
        const state = StandingOrdersState.getInstance();
        state.enact('aggressive-tendering', 5);
        const dto = JSON.parse(JSON.stringify(standingOrdersToDTO(state)));

        state.reset();
        applyStandingOrdersDTO(state, dto);

        expect(state.pendingOrderIds).toBeNull();
    });

    it('drops unknown order ids on load with a warning, keeping known ones', () => {
        const state = StandingOrdersState.getInstance();
        const dto = { active: ['aggressive-tendering', 'ghost-order'], pending: ['ghost-order'], bonusSlots: 0 };

        applyStandingOrdersDTO(state, dto);

        expect(state.activeOrderIds).toEqual(['aggressive-tendering']);
        expect(state.pendingOrderIds).toEqual([]);
    });
});
