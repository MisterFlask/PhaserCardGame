// Lint-style guard for the consumable acquisition path (source scan, not a
// live import): AbstractConsumable's concrete subclasses transitively pull
// in Phaser via ActionManager/BaseCharacter, so ConsumablesLibrary cannot be
// constructed under plain-Node vitest. Instead this scans source text the
// same way SaveRegistriesLint.test.ts does.
//
// Two things must hold for the save round-trip and contract rewards to work:
//  1. Every class ConsumablesLibrary's constructor list references must
//     exist as a file under src/consumables/ with a getDisplayName() that
//     returns a literal string — that's the name CampaignSerializer and
//     ContractGenerator's reward table key off of.
//  2. Every name in ConsumableStock.CONSUMABLE_REWARD_NAMES must exactly
//     match one of those getDisplayName() literals, so
//     ConsumablesLibrary.getConsumableByName resolves it.

import * as fs from 'fs';
import * as path from 'path';
import { describe, expect, it } from 'vitest';

const SRC = path.resolve(process.cwd(), 'src');

function read(relPath: string): string {
    return fs.readFileSync(path.join(SRC, relPath), 'utf-8');
}

/** Class names referenced in ConsumablesLibrary's consumableConstructors list. */
function libraryConstructorNames(): string[] {
    const source = read('consumables/ConsumablesLibrary.ts');
    const listMatch = source.match(/consumableConstructors\s*:.*=\s*\[([\s\S]*?)\];/);
    expect(listMatch, 'could not locate consumableConstructors array in ConsumablesLibrary.ts').toBeTruthy();
    return listMatch![1]
        .split(',')
        .map(s => s.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '').trim())
        .filter(s => s.length > 0);
}

/** The literal string returned by a class's getDisplayName() override, read
 *  from its own file (src/consumables/<ClassName>.ts by convention). */
function displayNameFor(className: string): string {
    const source = read(`consumables/${className}.ts`);
    const match = source.match(/getDisplayName\(\)\s*:\s*string\s*\{\s*return\s*"([^"]*)"/);
    expect(match, `${className}.ts: could not find a literal getDisplayName() return`).toBeTruthy();
    return match![1];
}

describe('Consumables acquisition path (source lint)', () => {
    const classNames = libraryConstructorNames();

    it('sanity: found a non-trivial constructor list', () => {
        expect(classNames.length).toBeGreaterThanOrEqual(12);
    });

    it('every class in ConsumablesLibrary resolves to a file with a literal getDisplayName()', () => {
        classNames.forEach(className => {
            expect(() => displayNameFor(className)).not.toThrow();
        });
    });

    it('CONSUMABLE_REWARD_NAMES all resolve against ConsumablesLibrary display names', () => {
        const allDisplayNames = new Set(classNames.map(displayNameFor));

        const stockSource = read('campaign/ConsumableStock.ts');
        const rewardNamesMatch = stockSource.match(/CONSUMABLE_REWARD_NAMES[^=]*=\s*\[([\s\S]*?)\];/);
        expect(rewardNamesMatch, 'could not locate CONSUMABLE_REWARD_NAMES array').toBeTruthy();
        const rewardNames = Array.from(rewardNamesMatch![1].matchAll(/"([^"]*)"/g)).map(m => m[1]);
        expect(rewardNames.length).toBeGreaterThan(0);

        const missing = rewardNames.filter(name => !allDisplayNames.has(name));
        expect(missing, `CONSUMABLE_REWARD_NAMES entries with no matching consumable: ${missing.join(', ')}`)
            .toEqual([]);
    });
});
