// Lint-style guard for opposition-tag coverage in EncounterManager.ts.
//
// EncounterManager.ts imports AutomatedCharacter (Phaser-tainted, via
// AbstractCard) and cannot be imported directly under vitest. This test
// instead scans the SOURCE text of the ActSegmentData tables, the same
// technique src/saveload/__tests__/SaveRegistriesLint.test.ts uses for
// SaveRegistries completeness.
//
// Checks:
//  (a) every encounter entry in every table carries a non-empty
//      `oppositions: [...]` array.
//  (b) every opposition id used is a valid OppositionId (Oppositions.ts is
//      pure and importable directly).
//  (c) every opposition has >=1 tagged entry in every non-boss segment
//      (0, 1, 2) of its own act -- contracts roll segment 0-2 freely.
//  (d) every opposition used by any ContractGenerator template belongs to
//      that template's own act (ContractGenerator is pure and importable
//      directly).

import * as fs from 'fs';
import * as path from 'path';
import { describe, expect, it } from 'vitest';
import { isOppositionId, OPPOSITIONS, OppositionId } from '../Oppositions';
import { ContractGenerator } from '../ContractGenerator';

const SRC = path.resolve(process.cwd(), 'src');

function read(relPath: string): string {
    return fs.readFileSync(path.join(SRC, relPath), 'utf-8');
}

interface ParsedEntry {
    oppositions: string[];
}

interface ParsedTable {
    varName: string;
    act: number;
    segment: number;
    entries: ParsedEntry[];
}

/**
 * Parses every `static readonly X = new ActSegmentData("...", act, segment, [
 * ...entries... ]);` block out of EncounterManager.ts's source text, and each
 * entry's `oppositions: [...]` array (or its absence).
 */
function parseActSegmentTables(source: string): ParsedTable[] {
    const tables: ParsedTable[] = [];
    // Match each "static readonly Name = new ActSegmentData(displayName, act, segment, [" header,
    // capturing up to the matching top-level closing "]);" for that table.
    const headerRegex = /static readonly (\w+)\s*=\s*new ActSegmentData\(\s*"[^"]*"\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*\[/g;
    let headerMatch: RegExpExecArray | null;
    while ((headerMatch = headerRegex.exec(source)) !== null) {
        const [, varName, actStr, segmentStr] = headerMatch;
        const bodyStart = headerRegex.lastIndex;

        // Walk bracket depth from bodyStart to find the matching "]" that
        // closes this table's entry array.
        let depth = 1;
        let i = bodyStart;
        for (; i < source.length && depth > 0; i++) {
            if (source[i] === '[') depth++;
            else if (source[i] === ']') depth--;
        }
        const body = source.slice(bodyStart, i - 1);

        // Within the table body, each entry is a `{ ... }` object at the top
        // level of the array. Split on top-level braces.
        const entries: ParsedEntry[] = [];
        let braceDepth = 0;
        let entryStart = -1;
        for (let j = 0; j < body.length; j++) {
            if (body[j] === '{') {
                if (braceDepth === 0) entryStart = j;
                braceDepth++;
            } else if (body[j] === '}') {
                braceDepth--;
                if (braceDepth === 0 && entryStart >= 0) {
                    const entryText = body.slice(entryStart, j + 1);
                    const oppositionsMatch = entryText.match(/oppositions:\s*\[([^\]]*)\]/);
                    const oppositions = oppositionsMatch
                        ? oppositionsMatch[1]
                            .split(',')
                            .map(s => s.trim().replace(/^['"]|['"]$/g, ''))
                            .filter(s => s.length > 0)
                        : [];
                    entries.push({ oppositions });
                    entryStart = -1;
                }
            }
        }

        tables.push({
            varName,
            act: parseInt(actStr, 10),
            segment: parseInt(segmentStr, 10),
            entries,
        });
    }
    return tables;
}

const encounterManagerSource = read('encounters/EncounterManager.ts');
const tables = parseActSegmentTables(encounterManagerSource);

describe('EncounterManager opposition-tag coverage (source lint)', () => {
    it('sanity: the scan found the expected number of act-segment tables', () => {
        // 4 acts * (3 regular segments + 1 boss segment) = 16 ActSegmentData
        // tables total (Act1_Segment0/1/2 + Boss_Act1, Act2_Segment0/1/2 +
        // Boss_Act2, Act3_Segment0/1/2 + Boss_Act3, Act4_Segment0/1/2 + Boss_Act4).
        expect(tables.length).toBe(16);
    });

    it('every encounter entry in every table carries a non-empty oppositions array', () => {
        const offenders: string[] = [];
        tables.forEach(table => {
            table.entries.forEach((entry, idx) => {
                if (entry.oppositions.length === 0) {
                    offenders.push(`${table.varName} (act ${table.act}, segment ${table.segment}), entry ${idx}`);
                }
            });
        });
        expect(offenders, `Entries missing an oppositions tag: ${offenders.join('; ')}`).toEqual([]);
    });

    it('every opposition id used is a valid OppositionId', () => {
        const offenders: string[] = [];
        tables.forEach(table => {
            table.entries.forEach((entry, idx) => {
                entry.oppositions.forEach(id => {
                    if (!isOppositionId(id)) {
                        offenders.push(`"${id}" in ${table.varName} (act ${table.act}, segment ${table.segment}), entry ${idx}`);
                    }
                });
            });
        });
        expect(offenders, `Unknown opposition ids: ${offenders.join('; ')}`).toEqual([]);
    });

    it('every opposition has >=1 tagged entry in every non-boss segment (0,1,2) of its own act', () => {
        const offenders: string[] = [];
        (Object.keys(OPPOSITIONS) as OppositionId[]).forEach(oppId => {
            const act = OPPOSITIONS[oppId].act;
            [0, 1, 2].forEach(segment => {
                const table = tables.find(t => t.act === act && t.segment === segment);
                if (!table) {
                    offenders.push(`${oppId}: no table found for act ${act} segment ${segment}`);
                    return;
                }
                const hasCoverage = table.entries.some(e => e.oppositions.includes(oppId));
                if (!hasCoverage) {
                    offenders.push(`${oppId}: no entry in ${table.varName} (act ${act}, segment ${segment})`);
                }
            });
        });
        expect(offenders, `Missing per-segment opposition coverage: ${offenders.join('; ')}`).toEqual([]);
    });

    it('every opposition used by a ContractGenerator template belongs to that template\'s own act', () => {
        const offenders: string[] = [];

        const checkTemplates = (templates: { name: string; opposition?: string }[], actOf: (t: { opposition?: string }) => number) => {
            templates.forEach(t => {
                if (t.opposition === undefined) return; // Prestige templates carry no opposition.
                if (!isOppositionId(t.opposition)) {
                    offenders.push(`Template "${t.name}": unknown opposition id "${t.opposition}"`);
                    return;
                }
                const expectedAct = OPPOSITIONS[t.opposition].act;
                const templateAct = actOf(t);
                if (expectedAct !== templateAct) {
                    offenders.push(`Template "${t.name}": opposition "${t.opposition}" belongs to act ${expectedAct}, but template is act ${templateAct}`);
                }
            });
        };

        // Bounty templates are grouped by region; regenerate the act mapping
        // from the same REGION_FLAVORS the generator itself iterates, via a
        // generated sample -- but getAllTemplates() doesn't carry act
        // directly, so cross-reference via generateContract's actual output
        // instead: draw many contracts and check each one's own act against
        // its own opposition.
        const gen = ContractGenerator.getInstance();
        let seenBounty = 0, seenTradeRun = 0;
        for (let i = 0; i < 2000; i++) {
            const c = gen.generateContract(10); // year 10: every act unlocked
            if (c.isPrestige) continue;
            if (c.opposition === undefined) {
                offenders.push(`Generated contract "${c.name}" (act ${c.act}) has no opposition set`);
                continue;
            }
            if (c.isTradeRun) seenTradeRun++; else seenBounty++;
            if (!isOppositionId(c.opposition)) {
                offenders.push(`Generated contract "${c.name}": unknown opposition id "${c.opposition}"`);
                continue;
            }
            const expectedAct = OPPOSITIONS[c.opposition].act;
            if (expectedAct !== c.act) {
                offenders.push(`Generated contract "${c.name}" (act ${c.act}): opposition "${c.opposition}" belongs to act ${expectedAct}`);
            }
        }
        expect(seenBounty).toBeGreaterThan(0);
        expect(seenTradeRun).toBeGreaterThan(0);

        expect(offenders, `Template/opposition act mismatches: ${offenders.join('; ')}`).toEqual([]);
    });

    it('prestige contracts always have undefined opposition', () => {
        const gen = ContractGenerator.getInstance();
        let seen = 0;
        for (let i = 0; i < 500; i++) {
            const board = gen.refillBoard([], 8);
            const prestige = board.find(c => c.isPrestige);
            if (!prestige) continue;
            seen++;
            expect(prestige.opposition).toBeUndefined();
        }
        expect(seen).toBeGreaterThan(0);
    });
});
