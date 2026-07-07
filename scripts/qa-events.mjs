#!/usr/bin/env node
// scripts/qa-events.mjs — ONE-OFF QA tool (not committed, not CI).
// Headless render-QA pass over the pooled narrative events (see
// window.listEventNames() / window.showEventByName in
// src/screens/CombatAndMapScene.ts). Dispatches one sortie to get into
// CombatScene, then for every pooled event: shows it via the debug hook,
// asserts it rendered non-empty description text and at least one choice
// button, and dismisses it without firing choice effects where possible
// (destroys the EventWindow directly instead of clicking a choice).
// Combat-swapping choices (DeadEndStartEncounterChoice) are never an issue
// here since we never click choices at all — see DISMISSAL note below.

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');
const OVERALL_TIMEOUT_MS = 10 * 60 * 1000;
const BOOT_TIMEOUT_MS = 60 * 1000;

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
    console.log(`[qa-events] serving at ${url}`);
    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    let exitCode = 1;
    try {
        const page = await browser.newPage();
        const pageErrors = [];
        await page.evaluateOnNewDocument(() => {
            window.__qaPageErrors = [];
            window.addEventListener('error', (e) => { window.__qaPageErrors.push(String(e.error && e.error.message || e.message)); });
            window.addEventListener('unhandledrejection', (e) => { window.__qaPageErrors.push('unhandledrejection: ' + String(e.reason && e.reason.message || e.reason)); });
        });
        page.on('console', msg => { const t = msg.text(); if (t.includes('[ETEST]') || msg.type() === 'error') console.log(`[page:${msg.type()}] ${t}`); });
        page.on('pageerror', err => { console.log(`[page:pageerror] ${err.message}`); pageErrors.push(err.message); });
        await page.goto(url, { waitUntil: 'load', timeout: BOOT_TIMEOUT_MS });
        await page.waitForFunction('typeof window.runSmokeTest === "function"', { timeout: BOOT_TIMEOUT_MS });
        // let HqScene finish create
        await page.waitForFunction("window.game && window.game.scene.getScenes(true).some(s => s.scene.key === 'HqScene')", { timeout: BOOT_TIMEOUT_MS });

        const result = await page.evaluate(async () => {
            const L = (m, x) => console.log('[ETEST] ' + m + (x !== undefined ? ' :: ' + JSON.stringify(x) : ''));
            const wait = (pred, ms, desc) => new Promise((res, rej) => {
                const t0 = Date.now();
                const t = setInterval(() => { try {
                    if (pred()) { clearInterval(t); res(); }
                    else if (Date.now() - t0 > ms) { clearInterval(t); rej(new Error('timeout: ' + desc)); }
                } catch (e) { clearInterval(t); rej(e); } }, 120);
            });
            const findIn = (list, pred) => { for (const o of list) { if (pred(o)) return o; if (Array.isArray(o.list)) { const f = findIn(o.list, pred); if (f) return f; } } return null; };
            const findAllIn = (list, pred, acc = []) => { for (const o of list) { if (pred(o)) acc.push(o); if (Array.isArray(o.list)) findAllIn(o.list, pred, acc); } return acc; };
            const scene = () => window.game.scene.getScenes(true)[0];
            const gs = window.getGameState(); const cs = window.getCampaignState();

            // --- Dispatch one sortie so we have a live CombatScene to host events. ---
            cs.roster.forEach(r => { if (r.weeksWoundedRemaining) r.weeksWoundedRemaining = 0; });
            const hq = window.game.scene.getScene('HqScene');
            cs.ensureContractsPopulated();
            const contract = cs.availableContracts[0];
            contract.act = 1; contract.segment = 1;
            cs.selectedContract = contract;
            const panel = hq.contractBoardPanel;
            panel.selectedSquad = cs.roster.filter(c => c.isFitForDuty).slice(0, contract.squadSize);
            if (panel.selectedSquad.length < contract.squadSize) {
                return { error: 'not enough fit-for-duty roster members to fill squad size ' + contract.squadSize, results: [] };
            }
            L('dispatch');
            setTimeout(() => panel.handleLaunch(), 30);
            await wait(() => scene() && scene().scene.key === 'CombatScene', 30000, 'combat start');
            const combatScene = scene();
            L('combat scene reached');

            // --- Walk every pooled event via the debug hooks. ---
            const names = window.listEventNames();
            L('event pool size', { count: names.length });
            const results = [];

            for (const name of names) {
                const entry = { name, rendered: false, textLength: 0, choices: 0, dismissal: null, error: null };
                try {
                    const errBefore = window.__qaPageErrors.length;
                    const shown = window.showEventByName(name);
                    if (!shown) {
                        entry.error = 'showEventByName returned null (no active CombatScene or name mismatch)';
                        results.push(entry);
                        continue;
                    }
                    // Wait a beat for the EventWindow to mount and animate in.
                    await new Promise(r => setTimeout(r, 400));

                    // Locate the EventWindow in the scene display list by constructor name
                    // (CombatUiManager keeps no public getter, so we search the tree like
                    // qa-spawn.mjs does for other rexUI/game objects).
                    const eventWindow = findIn(combatScene.children.list, o => o.constructor && o.constructor.name === 'EventWindow');
                    if (!eventWindow) {
                        entry.error = 'EventWindow not found in scene display list after showEventByName';
                        results.push(entry);
                        continue;
                    }

                    // Description TextBox: constructor name 'TextBox', has getText().
                    const textBoxes = findAllIn(eventWindow.list, o => o.constructor && o.constructor.name === 'TextBox' && typeof o.getText === 'function');
                    const descriptionLength = textBoxes.reduce((max, tb) => Math.max(max, (tb.getText() || '').length), 0);
                    entry.textLength = descriptionLength;
                    entry.rendered = descriptionLength > 0;

                    // Choice buttons: constructor name 'EventButton'.
                    const choiceButtons = findAllIn(eventWindow.list, o => o.constructor && o.constructor.name === 'EventButton');
                    entry.choices = choiceButtons.length;

                    if (window.__qaPageErrors.length > errBefore) {
                        entry.error = 'page error(s) fired while rendering: ' + window.__qaPageErrors.slice(errBefore).join(' | ');
                    }

                    // Dismiss WITHOUT triggering choice effects: EventWindow has no
                    // close/cancel affordance (see src/ui/EventWindow.ts), and clicking
                    // any choice runs AbstractChoice.effect() — for
                    // DeadEndStartEncounterChoice that tears down/restarts combat via
                    // ActionManager.cleanupAndRestartCombat, which would kill our shared
                    // CombatScene mid-sweep. So instead we destroy() the EventWindow
                    // object directly, same as CombatUiManager.showEvent() does when
                    // replacing one event with another. destroy() only tears down game
                    // objects (frame/portrait/text/buttons/tooltips) - it does not run
                    // any AbstractChoice.effect(), so no state pollution from this step
                    // itself. (Earlier events in the pool may still have queued actions
                    // from a clicked choice in other QA flows - not applicable here since
                    // we never click.)
                    eventWindow.destroy();
                    entry.dismissal = 'destroyed EventWindow directly (no choice clicked)';
                } catch (e) {
                    entry.error = String(e && e.message || e);
                }
                results.push(entry);
                L('event checked', entry);
            }

            return { error: null, results };
        }).catch(e => ({ error: 'evaluate threw: ' + String(e && e.message || e), results: [] }));

        console.log('[qa-events] RESULT:');
        console.log(JSON.stringify(result, null, 2));

        const resultsList = result.results ?? [];
        const total = resultsList.length;
        const failures = resultsList.filter(r => r.error || !r.rendered || r.choices < 1);
        console.log('\n[qa-events] SUMMARY TABLE:');
        console.log('name'.padEnd(40) + 'rendered'.padEnd(10) + 'textLen'.padEnd(9) + 'choices'.padEnd(9) + 'error');
        for (const r of resultsList) {
            console.log(
                r.name.padEnd(40) +
                String(r.rendered).padEnd(10) +
                String(r.textLength).padEnd(9) +
                String(r.choices).padEnd(9) +
                (r.error ?? '')
            );
        }
        console.log(`\n[qa-events] ${total - failures.length}/${total} events passed.`);
        if (result.error) { console.log('[qa-events] top-level error: ' + result.error); }
        if (pageErrors.length) { console.log('[qa-events] page errors during run:', pageErrors); }

        exitCode = (!result.error && failures.length === 0 && pageErrors.length === 0) ? 0 : 1;
    } catch (e) {
        console.error('[qa-events] failed:', e instanceof Error ? e.stack ?? e.message : e);
    } finally {
        await browser.close();
        server.close();
    }
    process.exit(exitCode);
}

const watchdog = setTimeout(() => { console.error('[qa-events] overall timeout'); process.exit(1); }, OVERALL_TIMEOUT_MS);
watchdog.unref();
main().catch(e => { console.error('[qa-events] unhandled:', e); process.exit(1); });
