import { describe, expect, it } from 'vitest';
import { mergeStockWithLoadout, MAX_CONSUMABLE_STOCK } from '../ConsumableStock';

describe('mergeStockWithLoadout', () => {
    it('merges and clamps to MAX_CONSUMABLE_STOCK', () => {
        const stock = ['a', 'b', 'c'];
        const loadout = ['d', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o'];
        const result = mergeStockWithLoadout(stock, loadout);
        expect(result).toHaveLength(MAX_CONSUMABLE_STOCK);
        expect(result).toEqual(['a', 'b', 'c']);
    });

    it('keeps stock items first and discards overflow from end', () => {
        const stock = ['campaign1', 'campaign2'];
        const loadout = ['loadout1', 'loadout2'];
        const result = mergeStockWithLoadout(stock, loadout);
        expect(result).toHaveLength(MAX_CONSUMABLE_STOCK);
        expect(result).toEqual(['campaign1', 'campaign2', 'loadout1']);
    });

    it('merges correctly with small stock and small loadout', () => {
        const stock: string[] = [];
        const loadout = ['x', 'y'];
        const result = mergeStockWithLoadout(stock, loadout);
        expect(result).toEqual(['x', 'y']);
    });

    it('merges correctly with stock at cap and single loadout item', () => {
        const stock = ['a', 'b', 'c'];
        const loadout = ['d'];
        const result = mergeStockWithLoadout(stock, loadout);
        expect(result).toEqual(['a', 'b', 'c']);
    });

    // Capital Works Rebuild second wave (The Bonded Warehouse): the cap is
    // now a parameter — callers pass CampaignUiState.getConsumableStockCap()
    // (base 3, +WAREHOUSE_STOCK_BONUS when owned); this module stays pure
    // and project-ignorant, defaulting to MAX_CONSUMABLE_STOCK.
    it('honors a widened cap when one is passed (Bonded Warehouse: 3 + 3)', () => {
        const stock = ['a', 'b', 'c'];
        const loadout = ['d', 'e', 'f', 'g'];
        const result = mergeStockWithLoadout(stock, loadout, MAX_CONSUMABLE_STOCK + 3);
        expect(result).toEqual(['a', 'b', 'c', 'd', 'e', 'f']);
    });

    it('a widened cap still keeps stock first and discards overflow from the end', () => {
        const stock = ['s1', 's2', 's3', 's4', 's5'];
        const loadout = ['l1', 'l2', 'l3'];
        const result = mergeStockWithLoadout(stock, loadout, 6);
        expect(result).toEqual(['s1', 's2', 's3', 's4', 's5', 'l1']);
    });

    it('an explicit cap equal to the default behaves identically to omitting it', () => {
        const stock = ['a', 'b'];
        const loadout = ['c', 'd'];
        expect(mergeStockWithLoadout(stock, loadout, MAX_CONSUMABLE_STOCK))
            .toEqual(mergeStockWithLoadout(stock, loadout));
    });
});
