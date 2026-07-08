// PlaytestJournal.ts
//
// Append-only playtest telemetry. One played campaign should be able to
// answer nearly every open balance question (economy tuning, standing
// orders, trade-run rates, hardening numbers, Cog power, client
// specialization, roster equilibrium) — this module is how that campaign's
// data gets out of the browser.
//
// Deliberately its own localStorage key, NOT the campaign save (no
// save-format change, no SaveRegistries entry needed — this is diagnostic
// data, not game state). Capped at ~2MB with oldest-first eviction so a long
// campaign can't blow out localStorage.
//
// Every public method is fail-silent (try/catch around all storage I/O and
// JSON work): telemetry must never be able to break the game. Recording is
// synchronous and cheap (an array push + a debounced-ish flush), so overhead
// is near zero.
//
// Console access (registered alongside the other debug hooks in
// CombatAndMapScene.ts): window.playtestJournal.{dump,download,clear,summary}.

const STORAGE_KEY = 'eic-playtest-journal';
const MAX_BYTES = 2 * 1024 * 1024; // ~2MB

/**
 * Aggregate surviving HP fraction (sum of current HP / sum of max HP) for a
 * won combat's squad. Small pure helper so the CombatAndMapScene call site
 * stays a single instrumentation line (house rule 6 / task brief: "no logic
 * at call sites"). Accepts the minimal shape rather than PlayerCharacter to
 * avoid pulling any Phaser-adjacent types into this module's signature.
 */
export function survivingHpFraction(characters: { hitpoints: number; maxHitpoints: number }[]): number {
    const totalMax = characters.reduce((sum, c) => sum + c.maxHitpoints, 0);
    if (totalMax <= 0) return 0;
    const totalCurrent = characters.reduce((sum, c) => sum + Math.max(0, c.hitpoints), 0);
    return Math.round((totalCurrent / totalMax) * 1000) / 1000;
}

export interface JournalRecord {
    /** ISO timestamp. */
    t: string;
    type: string;
    [key: string]: unknown;
}

/**
 * Append-only, size-capped telemetry log. A thin wrapper over localStorage:
 * every write reads the current array, appends, evicts from the front until
 * the serialized size fits the cap, and writes back. Simpler than an
 * in-memory cache with periodic flush (avoids a "the tab crashed and we lost
 * the last hour" failure mode); playtests are short enough sessions that the
 * extra read/write per event is not a concern.
 */
export class PlaytestJournal {
    private static instance: PlaytestJournal;

    public static getInstance(): PlaytestJournal {
        if (!PlaytestJournal.instance) {
            PlaytestJournal.instance = new PlaytestJournal();
        }
        return PlaytestJournal.instance;
    }

    private constructor() {}

    /**
     * Record one event. `payload` is spread onto the record alongside `t`
     * (auto-stamped) and `type`. Fail-silent: any error (storage full,
     * localStorage unavailable, circular payload, etc.) is swallowed after a
     * console.warn so a telemetry bug can never break the game.
     */
    public record(type: string, payload: Record<string, unknown> = {}): void {
        try {
            const record: JournalRecord = { t: new Date().toISOString(), type, ...payload };
            const records = this.readAll();
            records.push(record);
            this.writeAll(this.evictToFit(records));
        } catch (e) {
            try { console.warn('[PlaytestJournal] record failed:', e); } catch { /* ignore */ }
        }
    }

    /** Returns the full array of recorded events (oldest first). */
    public dump(): JournalRecord[] {
        try {
            return this.readAll();
        } catch {
            return [];
        }
    }

    /** Triggers a browser download of the full journal as a JSON file. */
    public download(): void {
        try {
            const records = this.readAll();
            const blob = new Blob([JSON.stringify(records, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `eic-playtest-journal-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
        } catch (e) {
            try { console.warn('[PlaytestJournal] download failed:', e); } catch { /* ignore */ }
        }
    }

    /** Empties the journal. */
    public clear(): void {
        try {
            localStorage.removeItem(STORAGE_KEY);
        } catch (e) {
            try { console.warn('[PlaytestJournal] clear failed:', e); } catch { /* ignore */ }
        }
    }

    /**
     * Aggregates the journal into the balance-session summary: sorties by
     * act/type/outcome, a quarterly cashflow table, deaths, and average
     * combat turns. This is deliberately the first thing a balance pass
     * reads — every open question in the task brief maps to one of these
     * buckets.
     */
    public summary(): Record<string, unknown> {
        try {
            const records = this.readAll();

            const sortiesByActType: Record<string, number> = {};
            const sortiesByOutcome: Record<string, number> = {};
            let totalDeaths = 0;
            let totalWounds = 0;
            const combatTurns: number[] = [];
            const quarterly: Record<string, { income: number; wages: number; dividendDue: number; dividendPaid: number; satisfactionAfter: number }> = {};

            for (const r of records) {
                switch (r.type) {
                    case 'sortie_dispatched': {
                        const key = `act${r.act ?? '?'}/${r.contractType ?? 'unknown'}`;
                        sortiesByActType[key] = (sortiesByActType[key] ?? 0) + 1;
                        break;
                    }
                    case 'sortie_resolved': {
                        const outcome = String(r.outcome ?? 'unknown');
                        sortiesByOutcome[outcome] = (sortiesByOutcome[outcome] ?? 0) + 1;
                        totalDeaths += Array.isArray(r.casualties) ? r.casualties.length : (typeof r.deaths === 'number' ? r.deaths : 0);
                        totalWounds += Array.isArray(r.wounds) ? r.wounds.length : (typeof r.woundsCount === 'number' ? r.woundsCount : 0);
                        break;
                    }
                    case 'combat_ended': {
                        if (typeof r.turns === 'number') combatTurns.push(r.turns);
                        break;
                    }
                    case 'board_meeting_settled': {
                        const key = `y${r.year ?? '?'}q${r.quarter ?? '?'}`;
                        quarterly[key] = {
                            income: Number(r.income ?? 0),
                            wages: Number(r.wagesPaid ?? 0),
                            dividendDue: Number(r.dividendDue ?? 0),
                            dividendPaid: Number(r.dividendPaid ?? 0),
                            satisfactionAfter: Number(r.satisfactionAfter ?? 0),
                        };
                        break;
                    }
                    default:
                        break;
                }
            }

            const avgCombatTurns = combatTurns.length > 0
                ? combatTurns.reduce((a, b) => a + b, 0) / combatTurns.length
                : 0;

            return {
                totalRecords: records.length,
                sortiesByActType,
                sortiesByOutcome,
                totalDeaths,
                totalWounds,
                avgCombatTurns: Math.round(avgCombatTurns * 100) / 100,
                combatCount: combatTurns.length,
                quarterlyCashflow: quarterly,
            };
        } catch (e) {
            try { console.warn('[PlaytestJournal] summary failed:', e); } catch { /* ignore */ }
            return { totalRecords: 0, sortiesByActType: {}, sortiesByOutcome: {}, totalDeaths: 0, totalWounds: 0, avgCombatTurns: 0, combatCount: 0, quarterlyCashflow: {} };
        }
    }

    private readAll(): JournalRecord[] {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return [];
            const parsed = JSON.parse(raw);
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return [];
        }
    }

    private writeAll(records: JournalRecord[]): void {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    }

    /** Evicts oldest-first until the serialized array fits MAX_BYTES. */
    private evictToFit(records: JournalRecord[]): JournalRecord[] {
        let working = records;
        let serialized = JSON.stringify(working);
        // Rough byte length via string length is fine here (mostly ASCII
        // JSON); no need for exact UTF-8 byte counting for a soft 2MB cap.
        while (serialized.length > MAX_BYTES && working.length > 1) {
            working = working.slice(Math.ceil(working.length * 0.1) || 1);
            serialized = JSON.stringify(working);
        }
        return working;
    }
}
