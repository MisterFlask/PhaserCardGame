#!/usr/bin/env node
// scripts/qa-headless-combat.mjs — ONE-OFF QA tool (not committed to CI).
// Boots the game (same harness as qa-spawn.mjs), waits for
// window.runHeadlessCombat to exist, then runs it N times in a row with the
// v1 random-legal IPlayPolicy against a fixed default enemy encounter.
// Reports win-rate, turn-count distribution, per-combat wall-clock time,
// and any ActionQueue errors captured during the run. See
// src/combat/sim/HeadlessCombat.ts and TODO.md's "Headless combat
// simulator" entry.

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');
const OVERALL_TIMEOUT_MS = 10 * 60 * 1000;
const BOOT_TIMEOUT_MS = 60 * 1000;
const NUM_COMBATS = Number(process.argv[2] ?? 50);

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

async function main() {
    const server = await startServer();
    const { port } = server.address();
    const url = `http://127.0.0.1:${port}/index.html`;
    console.log(`[qa-headless-combat] serving at ${url}`);
    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    let exitCode = 1;
    try {
        const page = await browser.newPage();
        page.on('console', msg => { const t = msg.text(); if (t.includes('[HTEST]') || msg.type() === 'error') console.log(`[page:${msg.type()}] ${t}`); });
        page.on('pageerror', err => console.log(`[page:pageerror] ${err.message}`));
        await page.goto(url, { waitUntil: 'load', timeout: BOOT_TIMEOUT_MS });
        await page.waitForFunction('typeof window.runHeadlessCombat === "function"', { timeout: BOOT_TIMEOUT_MS });
        // Let HqScene finish create so GameState/CampaignUiState are in their
        // normal post-boot shape before we start hammering GameState.
        await page.waitForFunction("window.game && window.game.scene.getScenes(true).some(s => s.scene.key === 'HqScene')", { timeout: BOOT_TIMEOUT_MS });

        const result = await page.evaluate(async (numCombats) => {
            const L = (m, x) => console.log('[HTEST] ' + m + (x !== undefined ? ' :: ' + JSON.stringify(x) : ''));

            const results = [];
            const errors = [];
            for (let i = 0; i < numCombats; i++) {
                const t0 = performance.now();
                try {
                    const r = await window.runHeadlessCombat({ seed: 1000 + i });
                    const wallMs = performance.now() - t0;
                    results.push({
                        i,
                        victory: r.victory,
                        timedOut: r.timedOut,
                        turns: r.turns,
                        wallMs: Math.round(wallMs),
                        queueErrorCount: r.queueErrors.length
                    });
                    if (r.queueErrors.length > 0) {
                        errors.push({ i, queueErrors: r.queueErrors });
                    }
                    L('combat done', { i, victory: r.victory, turns: r.turns, wallMs: Math.round(wallMs) });
                } catch (e) {
                    const wallMs = performance.now() - t0;
                    results.push({ i, victory: false, timedOut: false, turns: -1, wallMs: Math.round(wallMs), error: String(e && e.message || e) });
                    L('combat THREW', { i, err: String(e && e.message || e) });
                }
            }

            const wins = results.filter(r => r.victory).length;
            const timeouts = results.filter(r => r.timedOut).length;
            const thrown = results.filter(r => r.error).length;
            const turnsOfCompleted = results.filter(r => r.turns >= 0).map(r => r.turns);
            const wallMsAll = results.map(r => r.wallMs);
            const avg = arr => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
            const sorted = [...turnsOfCompleted].sort((a, b) => a - b);
            const median = sorted.length ? sorted[Math.floor(sorted.length / 2)] : 0;

            return {
                numCombats,
                wins,
                losses: results.length - wins - timeouts - thrown,
                timeouts,
                thrown,
                winRate: results.length ? wins / results.length : 0,
                turns: { min: Math.min(...turnsOfCompleted), max: Math.max(...turnsOfCompleted), avg: avg(turnsOfCompleted), median },
                wallClockMs: { min: Math.min(...wallMsAll), max: Math.max(...wallMsAll), avg: avg(wallMsAll) },
                queueErrorRuns: errors,
                results
            };
        }, NUM_COMBATS);

        console.log('[qa-headless-combat] RESULT:');
        console.log(JSON.stringify(result, null, 2));
        exitCode = (result.thrown === 0 && result.queueErrorRuns.length === 0) ? 0 : 1;
    } catch (e) {
        console.error('[qa-headless-combat] failed:', e instanceof Error ? e.stack ?? e.message : e);
    } finally {
        await browser.close();
        server.close();
    }
    process.exit(exitCode);
}

const watchdog = setTimeout(() => { console.error('[qa-headless-combat] overall timeout'); process.exit(1); }, OVERALL_TIMEOUT_MS);
watchdog.unref();
main().catch(e => { console.error('[qa-headless-combat] unhandled:', e); process.exit(1); });
