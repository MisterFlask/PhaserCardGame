#!/usr/bin/env node
// scripts/measure-combat-rates.mjs — combat win-rate measurement bridge.
// Boots the game (same harness as qa-headless-combat.mjs), then for every
// cell of {act 1-4} x {squadSize 2,3,4} x {policy: randomLegal, greedy} runs
// N headless combats with a fresh CharacterGenerator squad against a real
// encounter drawn from that act's segment-0/segment-1 tables (sampled
// evenly), recording win rate, mean turns, mean surviving-HP fraction, and a
// wound-proxy rate (fraction of surviving squads with any member below 50%
// HP). Writes the full table to
// src/campaign/sim/combat-rates.fixture.json with a generation header.
//
// This is a measurement tool, not a tuning tool: it does NOT retune any
// economy constant. See CampaignSimulator.ts's `combatModel: 'fixture'` mode
// for how the numbers this script produces get consumed.
//
// Usage: node scripts/measure-combat-rates.mjs [N]                 (full 24-cell sweep, writes fixture)
//        node scripts/measure-combat-rates.mjs --breakdown [N] [--acts 2,3] [--squad 3] [--policy greedy]
//                                                                   (per-encounter breakdown mode, does NOT write fixture)
//
// Breakdown mode reports win rate PER INDIVIDUAL ENCOUNTER (not pooled per
// segment) so specific outlier comps can be identified. Defaults to acts
// 2,3 / squad 3 / greedy since that's the balance-pass hot path, but any
// combination of acts/squad/policy can be requested.

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');
const OVERALL_TIMEOUT_MS = 10 * 60 * 1000;
const BOOT_TIMEOUT_MS = 60 * 1000;

const argv = process.argv.slice(2);
const BREAKDOWN = argv.includes('--breakdown');
const flagValue = (name, fallback) => {
    const idx = argv.indexOf(name);
    return idx >= 0 && argv[idx + 1] !== undefined ? argv[idx + 1] : fallback;
};
const N = Number(argv.find(a => /^\d+$/.test(a)) ?? 40);
const BREAKDOWN_ACTS = flagValue('--acts', '2,3').split(',').map(Number);
const BREAKDOWN_SQUAD = Number(flagValue('--squad', '3'));
const BREAKDOWN_POLICY = flagValue('--policy', 'greedy');
const OUT_PATH = path.join(REPO_ROOT, 'src', 'campaign', 'sim', 'combat-rates.fixture.json');

const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8', '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8', '.map': 'application/json; charset=utf-8',
    '.png': 'image/png', '.jpg': 'image/jpeg', '.ogg': 'audio/ogg', '.css': 'text/css; charset=utf-8',
};
const contentTypeFor = p => MIME_TYPES[path.extname(p).toLowerCase()] ?? 'application/octet-stream';

function startServer() {
    const server = http.createServer((req, res) => {
        try {
            const urlPath = decodeURIComponent((req.url ?? '/').split('?')[0]);
            const resolved = path.normalize(path.join(REPO_ROOT, urlPath === '/' ? '/index.html' : urlPath));
            if (!resolved.startsWith(REPO_ROOT)) { res.writeHead(403); res.end(); return; }
            fs.readFile(resolved, (err, data) => {
                if (err) { res.writeHead(404); res.end(); return; }
                res.writeHead(200, { 'Content-Type': contentTypeFor(resolved) });
                res.end(data);
            });
        } catch (e) { res.writeHead(500); res.end(String(e)); }
    });
    return new Promise((resolve, reject) => {
        server.on('error', reject);
        server.listen(0, '127.0.0.1', () => resolve(server));
    });
}

const ACTS = [1, 2, 3, 4];
const SQUAD_SIZES = [2, 3, 4];
const POLICIES = ['randomLegal', 'greedy'];

async function runBreakdown(page) {
    const cells = await page.evaluate(async (N, ACTS, squadSize, policyName) => {
        const L = (m, x) => console.log('[MTEST] ' + m + (x !== undefined ? ' :: ' + JSON.stringify(x) : ''));
        const segmentsForAct = (act) => {
            const seg0 = window.ActSegment[`Act${act}_Segment0`];
            const seg1 = window.ActSegment[`Act${act}_Segment1`];
            return [seg0, seg1].filter(Boolean);
        };
        const results = {};
        for (const act of ACTS) {
            const segments = segmentsForAct(act);
            for (const seg of segments) {
                for (let encIdx = 0; encIdx < seg.encounters.length; encIdx++) {
                    const encounterTemplate = seg.encounters[encIdx];
                    const label = encounterTemplate.enemies.map(e => e.name).join(' + ');
                    const key = `act${act}_seg${seg.segment}_enc${encIdx}[${label}]`;
                    const runs = [];
                    for (let i = 0; i < N; i++) {
                        const enemies = encounterTemplate.enemies.map(e => e.Copy());
                        const seed = 900000 + act * 10000 + seg.segment * 1000 + encIdx * 100 + i;
                        try {
                            const r = await window.runHeadlessCombat({
                                squadSize, enemies, seed,
                                policy: policyName === 'greedy' ? 'greedy' : 'random',
                            });
                            runs.push(r);
                        } catch (e) {
                            runs.push({ victory: false, timedOut: false, turns: -1, error: String(e && e.message || e), survivingPlayerHp: [], survivingEnemyHp: [], queueErrors: [] });
                        }
                    }
                    const wins = runs.filter(r => r.victory).length;
                    const thrown = runs.filter(r => r.error).length;
                    results[key] = { act, segment: seg.segment, encIdx, label, n: N, wins, winRate: runs.length ? wins / runs.length : 0, thrown };
                    L('encounter done', results[key]);
                }
            }
        }
        return results;
    }, N, BREAKDOWN_ACTS, BREAKDOWN_SQUAD, BREAKDOWN_POLICY);
    return cells;
}

async function main() {
    const server = await startServer();
    const { port } = server.address();
    const url = `http://127.0.0.1:${port}/index.html`;
    console.log(`[measure-combat-rates] serving at ${url}`);
    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    let exitCode = 1;
    try {
        const page = await browser.newPage();
        page.on('console', msg => { const t = msg.text(); if (t.includes('[MTEST]') || msg.type() === 'error') console.log(`[page:${msg.type()}] ${t}`); });
        page.on('pageerror', err => console.log(`[page:pageerror] ${err.message}`));
        await page.goto(url, { waitUntil: 'load', timeout: BOOT_TIMEOUT_MS });
        await page.waitForFunction('typeof window.runHeadlessCombat === "function"', { timeout: BOOT_TIMEOUT_MS });
        await page.waitForFunction("window.game && window.game.scene.getScenes(true).some(s => s.scene.key === 'HqScene')", { timeout: BOOT_TIMEOUT_MS });

        if (BREAKDOWN) {
            console.log(`[measure-combat-rates] BREAKDOWN mode: acts=${BREAKDOWN_ACTS} squad=${BREAKDOWN_SQUAD} policy=${BREAKDOWN_POLICY} n=${N}`);
            const cells = await runBreakdown(page);
            const rows = Object.values(cells).sort((a, b) => a.winRate - b.winRate);
            console.log('[measure-combat-rates] BREAKDOWN RESULT (sorted by win rate, ascending):');
            for (const r of rows) {
                console.log(`  act${r.act} seg${r.segment} enc${r.encIdx} [${r.label}]: ${(r.winRate * 100).toFixed(1)}% (${r.wins}/${r.n})${r.thrown ? ' THROWN=' + r.thrown : ''}`);
            }
            exitCode = 0;
        } else {
            const cells = await page.evaluate(async (N, ACTS, SQUAD_SIZES, POLICIES) => {
                const L = (m, x) => console.log('[MTEST] ' + m + (x !== undefined ? ' :: ' + JSON.stringify(x) : ''));

                // Mirrors window.runHeadlessCombat's own encounter-table access
                // (src/screens/CombatAndMapScene.ts): ActSegment is a global-ish
                // static registry reachable off the bundle. We can't `import` it
                // from page.evaluate, so pull it the same way the debug hooks
                // reach their own dependencies -- via the already-booted game's
                // module graph exposed on window. CharacterGenerator/ActSegment
                // aren't separately exposed on window today, so this script
                // drives everything through window.runHeadlessCombat's own
                // squadSize/enemies params instead of re-implementing squad/
                // encounter construction here: enemies is populated by asking
                // runHeadlessCombat to build its OWN default act-1 encounter
                // only when no override is given, so for acts 2-4 and for
                // segment-1 sampling we need the encounter tables directly.
                //
                // window.ActSegment is exposed directly by CombatAndMapScene.ts
                // for this script's benefit (see the comment next to
                // `(window as any).ActSegment = ActSegment;` there).
                const results = {};
                const segmentsForAct = (act) => {
                    // Segment 0 and Segment 1 only ("sample 1 and 2 evenly") --
                    // Segment2/Boss are deliberately excluded, matching the
                    // brief's "act X segment 1/2" framing (0-indexed segment0/
                    // segment1 in ActSegment's own naming).
                    const seg0 = window.ActSegment[`Act${act}_Segment0`];
                    const seg1 = window.ActSegment[`Act${act}_Segment1`];
                    return [seg0, seg1].filter(Boolean);
                };

                for (const act of ACTS) {
                    const segments = segmentsForAct(act);
                    const encounterPool = segments.flatMap(s => s.encounters);
                    for (const squadSize of SQUAD_SIZES) {
                        for (const policyName of POLICIES) {
                            const key = `act${act}_squad${squadSize}_${policyName}`;
                            const runs = [];
                            for (let i = 0; i < N; i++) {
                                // Evenly sample across the pooled segment-0/segment-1
                                // encounters (round-robin by index, not random, so N
                                // covers the pool evenly rather than clumping).
                                const encounterTemplate = encounterPool[i % encounterPool.length];
                                const enemies = encounterTemplate.enemies.map(e => e.Copy());
                                const seed = 500000 + act * 10000 + squadSize * 1000 + (policyName === 'greedy' ? 500 : 0) + i;
                                try {
                                    const r = await window.runHeadlessCombat({
                                        squadSize,
                                        enemies,
                                        seed,
                                        policy: policyName === 'greedy' ? 'greedy' : 'random',
                                    });
                                    runs.push(r);
                                } catch (e) {
                                    runs.push({ victory: false, timedOut: false, turns: -1, error: String(e && e.message || e), survivingPlayerHp: [], survivingEnemyHp: [], queueErrors: [] });
                                }
                            }

                            const wins = runs.filter(r => r.victory).length;
                            const completed = runs.filter(r => r.turns >= 0);
                            const avgTurns = completed.length ? completed.reduce((a, r) => a + r.turns, 0) / completed.length : 0;

                            // Surviving-HP fraction and wound-proxy are only
                            // meaningful for WINS (a loss has no meaningful
                            // "surviving squad"). Computed per-win over that
                            // win's own squad, then averaged across wins.
                            const winRuns = runs.filter(r => r.victory);
                            let hpFractions = [];
                            let woundedSquads = 0;
                            for (const r of winRuns) {
                                const fracs = r.survivingPlayerHp.map(p => p.maxHitpoints > 0 ? Math.max(0, p.hitpoints) / p.maxHitpoints : 0);
                                hpFractions.push(...fracs);
                                if (fracs.some(f => f < 0.5)) woundedSquads++;
                            }
                            const avgSurvivingHpFraction = hpFractions.length ? hpFractions.reduce((a, b) => a + b, 0) / hpFractions.length : 0;
                            const woundProxyRate = winRuns.length ? woundedSquads / winRuns.length : 0;

                            const thrown = runs.filter(r => r.error).length;
                            const queueErrorRuns = runs.filter(r => (r.queueErrors || []).length > 0).length;

                            results[key] = {
                                act, squadSize, policy: policyName, n: N,
                                wins, winRate: runs.length ? wins / runs.length : 0,
                                avgTurns, avgSurvivingHpFraction, woundProxyRate,
                                thrown, queueErrorRuns,
                            };
                            L('cell done', results[key]);
                        }
                    }
                }
                return results;
            }, N, ACTS, SQUAD_SIZES, POLICIES);

            console.log('[measure-combat-rates] RESULT:');
            console.log(JSON.stringify(cells, null, 2));

            const anyThrown = Object.values(cells).some(c => c.thrown > 0 || c.queueErrorRuns > 0);

            const fixture = {
                generatedAt: new Date().toISOString(),
                n: N,
                policyVersions: {
                    randomLegal: 'RandomLegalPolicy v1 (src/combat/sim/RandomLegalPolicy.ts)',
                    greedy: 'GreedyPolicy v1 (src/combat/sim/GreedyPolicy.ts)',
                },
                cells,
            };
            fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
            fs.writeFileSync(OUT_PATH, JSON.stringify(fixture, null, 2) + '\n');
            console.log(`[measure-combat-rates] wrote ${OUT_PATH}`);

            exitCode = anyThrown ? 1 : 0;
        }
    } catch (e) {
        console.error('[measure-combat-rates] failed:', e instanceof Error ? e.stack ?? e.message : e);
    } finally {
        await browser.close();
        server.close();
    }
    process.exit(exitCode);
}

const watchdog = setTimeout(() => { console.error('[measure-combat-rates] overall timeout'); process.exit(1); }, OVERALL_TIMEOUT_MS);
watchdog.unref();
main().catch(e => { console.error('[measure-combat-rates] unhandled:', e); process.exit(1); });
