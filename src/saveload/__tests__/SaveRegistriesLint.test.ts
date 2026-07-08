// Lint-style guard for SaveRegistries completeness.
//
// The save system reconstructs class instances by constructor name, so any
// buff or card that can reach a persistent roster deck must be registered in
// SaveRegistries.ts — or it silently drops from save files. The sources that
// can put things on decks import Phaser transitively and can't be executed
// under Node, so this test scans their SOURCE and compares import lists.
//
// Covered surfaces:
//  1. Buffs CharacterGenerator can roll onto starting decks / persona traits.
//  2. Buffs CardModifierRegistry can push onto reward cards.
//  3. Cards pushed into master decks from outside the class pools
//     (relic/curse effects) — inline `cardsInMasterDeck.push(new X(...))`.
// Buffs installed by card constructors are deliberately NOT required here:
// CampaignSerializer merges into the freshly-constructed card, so intrinsic
// buffs self-heal without registry entries.

import * as fs from 'fs';
import * as path from 'path';
import { describe, expect, it } from 'vitest';

const SRC = path.resolve(process.cwd(), 'src');

function read(relPath: string): string {
    return fs.readFileSync(path.join(SRC, relPath), 'utf-8');
}

/** Extract original (pre-`as`) identifiers from import statements whose
 *  module path matches the filter. */
function importedNames(source: string, modulePathFilter: (p: string) => boolean): string[] {
    const names: string[] = [];
    const importRegex = /import\s*(?:type\s*)?{([^}]*)}\s*from\s*['"]([^'"]*)['"]/g;
    let match;
    while ((match = importRegex.exec(source)) !== null) {
        if (!modulePathFilter(match[2])) continue;
        match[1].split(',').forEach(part => {
            const original = part.trim().split(/\s+as\s+/)[0].trim();
            if (original) names.push(original);
        });
    }
    return names;
}

function walkTsFiles(dir: string, out: string[] = []): string[] {
    fs.readdirSync(dir, { withFileTypes: true }).forEach(entry => {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) walkTsFiles(full, out);
        else if (entry.name.endsWith('.ts') && !entry.name.endsWith('.test.ts')) out.push(full);
    });
    return out;
}

const registrySource = read('saveload/SaveRegistries.ts');
const registryBuffNames = new Set(importedNames(registrySource, p => p.includes('/buffs/')));
const registryImportedIdentifiers = new Set(importedNames(registrySource, () => true));

describe('SaveRegistries completeness (source lint)', () => {
    it('registers every buff CharacterGenerator can put on a new character', () => {
        const generatorSource = read('gamecharacters/CharacterGenerator.ts');
        const needed = importedNames(generatorSource, p => p.includes('/buffs/'));
        expect(needed.length).toBeGreaterThan(10); // sanity: the scan found the imports
        const missing = needed.filter(name => !registryBuffNames.has(name));
        expect(missing, `Buffs reachable from CharacterGenerator but missing from SaveRegistries: ${missing.join(', ')}`)
            .toEqual([]);
    });

    it('registers every buff CardModifierRegistry can push onto reward cards', () => {
        const modifierSource = read('rules/modifiers/CardModifierRegistry.ts');
        const needed = importedNames(modifierSource, p => p.includes('/buffs/'));
        expect(needed.length).toBeGreaterThan(10);
        const missing = needed.filter(name => !registryBuffNames.has(name));
        expect(missing, `Buffs reachable from CardModifierRegistry but missing from SaveRegistries: ${missing.join(', ')}`)
            .toEqual([]);
    });

    it('registers every card pushed into master decks from outside the class pools', () => {
        // Class-pool cards are auto-registered (the registry is built from the
        // pools), so only out-of-pool sources need explicit entries.
        const pushRegex = /cardsInMasterDeck\.push\(new\s+([A-Za-z0-9_]+)\s*\(/g;
        const offenders: string[] = [];

        walkTsFiles(SRC).forEach(file => {
            if (file.includes('saveload')) return;
            if (file.includes(path.join('gamecharacters', 'cargo'))) return; // vessel cargo isn't saved (v1)
            const source = fs.readFileSync(file, 'utf-8');
            let match;
            while ((match = pushRegex.exec(source)) !== null) {
                const cardClass = match[1];
                if (!registryImportedIdentifiers.has(cardClass)) {
                    offenders.push(`${cardClass} (${path.relative(SRC, file)})`);
                }
            }
        });

        expect(offenders, `Cards that can enter persistent decks but aren't in SaveRegistries: ${offenders.join(', ')}`)
            .toEqual([]);
    });

    it('keeps legacy buff-name aliases for classes renamed after saves shipped', () => {
        // Saves store buff.constructor.name; these classes were renamed
        // (Pages→Ashes, Iron→Mettle) so the old names must stay resolvable.
        for (const legacyName of ['IncreasePages', 'IncreaseIron']) {
            expect(registrySource, `SaveRegistries.ts lost the legacy alias for "${legacyName}"`)
                .toContain(`${legacyName}:`);
        }
    });
});
