// Lint-style guard for the relic armoury acquisition path (source scan, not a
// live import): AbstractRelic's concrete subclasses transitively pull in
// Phaser via ActionManager/BaseCharacter (mirrors ConsumablesLint.test.ts's
// rationale exactly), so RelicsLibrary cannot be constructed under plain-Node
// vitest. Instead this scans source text.
//
// Two things must hold for the armoury save round-trip to work
// (src/docs/relic_equipment_design.md):
//  1. Every relic RelicsLibrary's beneficialRelics/cursedCargoRelics/
//     specialRelics arrays construct must exist as a file under src/relics/
//     with a literal getDisplayName() return — that's the name
//     CampaignSerializer's RelicDTO keys off of (RelicsLibrary.getRelicByName
//     resolves it). specialRelics holds relics that never appear in a random
//     shop/event pool (currently just EmergencyTeleporter, which seeds the
//     fresh-campaign armoury directly) but still need name resolution.
//  2. No relic constructor takes a required (non-defaulted) parameter beyond
//     a `stacks`-shaped one. RelicDTO only captures `stacks` (see
//     AbstractBuff.stacks / AbstractBuff.copy(), which already round-trips
//     stacks generically for every relic) — a relic whose behavior depends
//     on other constructor-supplied state would silently lose that state on
//     save/load, so this test fails loudly instead ("constructor-state
//     offenders" per the design doc) rather than resolving it silently.

import * as fs from 'fs';
import * as path from 'path';
import { describe, expect, it } from 'vitest';

const SRC = path.resolve(process.cwd(), 'src');

function read(relPath: string): string {
    return fs.readFileSync(path.join(SRC, relPath), 'utf-8');
}

/** Class names constructed (via `new X(...)`) inside a named array literal
 *  in RelicsLibrary.ts, e.g. `beneficialRelics = [new Foo(), new Bar()];`. */
function libraryConstructorNames(arrayFieldName: string): string[] {
    const source = read('relics/RelicsLibrary.ts');
    const re = new RegExp(`${arrayFieldName}\\s*(?::[^=]*)?=\\s*\\[([\\s\\S]*?)\\];`);
    const listMatch = source.match(re);
    expect(listMatch, `could not locate ${arrayFieldName} array in RelicsLibrary.ts`).toBeTruthy();
    const body = listMatch![1].replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
    return Array.from(body.matchAll(/new\s+([A-Za-z0-9_]+)\s*\(/g)).map(m => m[1]);
}

/** Locate a class's own source file by scanning every .ts file under
 *  src/relics for `class <className> extends AbstractRelic`. Relic files
 *  don't follow a single fixed directory convention (common/, rare/,
 *  cursedcargo/, special/, uncommon/, boss/), so a naming-convention lookup
 *  (like ConsumablesLint's `consumables/${className}.ts`) isn't reliable
 *  here — a directory walk is. */
function findRelicFile(className: string): string {
    const relicsDir = path.join(SRC, 'relics');
    const found: string[] = [];
    function walk(dir: string) {
        fs.readdirSync(dir, { withFileTypes: true }).forEach(entry => {
            const full = path.join(dir, entry.name);
            if (entry.isDirectory()) { walk(full); return; }
            if (!entry.name.endsWith('.ts')) return;
            const source = fs.readFileSync(full, 'utf-8');
            if (new RegExp(`class\\s+${className}\\s+extends\\s+AbstractRelic\\b`).test(source)) {
                found.push(full);
            }
        });
    }
    walk(relicsDir);
    expect(found.length, `expected exactly one file defining class ${className} extends AbstractRelic, found ${found.length}`).toBe(1);
    return found[0];
}

function sourceFor(className: string): string {
    return fs.readFileSync(findRelicFile(className), 'utf-8');
}

function displayNameFor(className: string): string {
    const source = sourceFor(className);
    const match = source.match(/getDisplayName\(\)\s*:\s*string\s*\{\s*return\s*"([^"]*)"/);
    expect(match, `${className}: could not find a literal getDisplayName() return`).toBeTruthy();
    return match![1];
}

/** True if the class's constructor signature is empty or takes only a
 *  single optional numeric parameter (the `stacks`-shaped pattern used by
 *  e.g. BelphegorsRounds(stacks: number = 1)) — anything else is a
 *  constructor-state offender per the design doc. */
function hasOnlyStacksLikeConstructorParams(className: string): boolean {
    const source = sourceFor(className);
    const ctorMatch = source.match(/constructor\s*\(([^)]*)\)/);
    if (!ctorMatch) return true; // no explicit constructor: implicit no-arg, fine
    const params = ctorMatch[1].trim();
    if (params === '') return true;
    // Single optional parameter with a numeric default, e.g. "stacks: number = 1".
    return /^\w+\s*:\s*number\s*=\s*-?\d+$/.test(params);
}

describe('Relic armoury acquisition path (source lint)', () => {
    const beneficialNames = libraryConstructorNames('beneficialRelics');
    const cursedNames = libraryConstructorNames('cursedCargoRelics');
    const specialNames = libraryConstructorNames('specialRelics');
    const allNames = Array.from(new Set([...beneficialNames, ...cursedNames, ...specialNames]));

    it('sanity: found a non-trivial relic list', () => {
        expect(beneficialNames.length).toBeGreaterThanOrEqual(5);
        expect(cursedNames.length).toBeGreaterThanOrEqual(5);
        expect(specialNames.length).toBeGreaterThanOrEqual(1);
    });

    it('every relic in RelicsLibrary resolves to exactly one file with a literal getDisplayName()', () => {
        allNames.forEach(className => {
            expect(() => displayNameFor(className)).not.toThrow();
        });
    });

    it('every relic name is unique (RelicDTO round-trips by name, so collisions would be ambiguous)', () => {
        const names = allNames.map(displayNameFor);
        const seen = new Set<string>();
        const dupes: string[] = [];
        names.forEach(name => {
            if (seen.has(name)) dupes.push(name);
            seen.add(name);
        });
        expect(dupes, `duplicate relic display names: ${dupes.join(', ')}`).toEqual([]);
    });

    it('no relic in RelicsLibrary has constructor-supplied state beyond a stacks-shaped parameter', () => {
        const offenders = allNames.filter(className => !hasOnlyStacksLikeConstructorParams(className));
        expect(offenders, `Relics with constructor state RelicDTO cannot capture (only \`stacks\` round-trips — ` +
            `see RelicEquipmentLint.test.ts doc comment): ${offenders.join(', ')}`).toEqual([]);
    });
});
