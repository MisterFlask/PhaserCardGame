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
});
