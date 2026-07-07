#!/usr/bin/env node
// scripts/qa-spawn.mjs — ONE-OFF QA tool (not committed, not CI).
// Boots the game headless (same harness as ci-smoke.mjs) and force-dispatches
// sorties with contract.act/segment overridden to 2/3, so the ten new act-2/3
// enemies actually spawn at runtime. Reports every enemy spawned, which new
// ones were hit, and any action-queue errors.

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
    console.log(`[qa-spawn] serving at ${url}`);
    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    let exitCode = 1;
    try {
        const page = await browser.newPage();
        page.on('console', msg => { const t = msg.text(); if (t.includes('[ETEST]') || msg.type() === 'error') console.log(`[page:${msg.type()}] ${t}`); });
        page.on('pageerror', err => console.log(`[page:pageerror] ${err.message}`));
        await page.goto(url, { waitUntil: 'load', timeout: BOOT_TIMEOUT_MS });
        await page.waitForFunction('typeof window.runSmokeTest === "function"', { timeout: BOOT_TIMEOUT_MS });
        // let HqScene finish create
        await page.waitForFunction("window.game && window.game.scene.getScenes(true).some(s => s.scene.key === 'HqScene')", { timeout: BOOT_TIMEOUT_MS });

        const result = await page.evaluate(async () => {
            const L = (m, x) => console.log('[ETEST] ' + m + (x !== undefined ? ' :: ' + JSON.stringify(x) : ''));
            const NEW_ENEMIES = ['Revenant Auditor','Maxwell-Coil','Duelist','Quartermaster','Line-Breaker','Foundry Tick','Overpressure Stoker','Company Bailiff','Union Runner','Ironclad Picket'];
            const wait = (pred, ms, desc) => new Promise((res, rej) => {
                const t0 = Date.now();
                const t = setInterval(() => { try {
                    if (pred()) { clearInterval(t); res(); }
                    else if (Date.now() - t0 > ms) { clearInterval(t); rej(new Error('timeout: ' + desc)); }
                } catch (e) { clearInterval(t); rej(e); } }, 120);
            });
            const findIn = (list, pred) => { for (const o of list) { if (pred(o)) return o; if (Array.isArray(o.list)) { const f = findIn(o.list, pred); if (f) return f; } } return null; };
            const scene = () => window.game.scene.getScenes(true)[0];
            const gs = window.getGameState(); const cs = window.getCampaignState();
            const seen = new Set(); const failures = []; const configs = [[3,1],[3,1],[3,1],[2,1],[2,1],[3,1],[3,1],[2,1]];
            for (let i = 0; i < configs.length; i++) {
                const [act, seg] = configs[i];
                try {
                    cs.roster.forEach(r => { if (r.weeksWoundedRemaining) r.weeksWoundedRemaining = 0; });
                    const hq = window.game.scene.getScene('HqScene');
                    cs.ensureContractsPopulated();
                    const contract = cs.availableContracts[0];
                    contract.act = act; contract.segment = seg;
                    cs.selectedContract = contract;
                    const panel = hq.contractBoardPanel;
                    panel.selectedSquad = cs.roster.filter(c => c.isFitForDuty).slice(0, contract.squadSize);
                    if (panel.selectedSquad.length < contract.squadSize) { L('skip', {i, reason: 'squad'}); continue; }
                    const errBefore = window.getActionQueueErrors().length;
                    L('dispatch', {i, act, seg});
                    setTimeout(() => panel.handleLaunch(), 30);
                    await wait(() => scene() && scene().scene.key === 'CombatScene', 30000, 'combat ' + i);
                    let guard = 0;
                    while (scene().scene.key !== 'HqScene' && guard < 600) {
                        guard++;
                        const s = scene();
                        if (s.scene.key === 'CombatScene') {
                            (gs.combatState.enemies || []).forEach(e => {
                                if (!seen.has(e.name)) { seen.add(e.name); L('spawned', {name: e.name, hp: e.maxHitpoints, act, seg}); }
                                e.hitpoints = 0;
                            });
                            const done = findIn(s.children.list, o => o.textBoxName === 'doneButton'); if (done) done.emit('pointerdown');
                            const evt = findIn(s.children.list, o => o.constructor && o.constructor.name === 'EventButton'); if (evt) evt.emit('pointerdown');
                            const mb = findIn(s.children.list, o => o.textBoxName === 'mapButton');
                            const lbl = mb && mb.getText ? mb.getText() : '';
                            if (mb && (lbl.includes('Continue') || lbl.includes('Return to HQ'))) { mb.emit('pointerdown'); mb.emit('pointerup'); }
                        }
                        await new Promise(r => setTimeout(r, 250));
                    }
                    if (scene().scene.key !== 'HqScene') { failures.push('sortie ' + i + ' stuck in ' + scene().scene.key); L('STUCK', {i, scene: scene().scene.key}); break; }
                    L('sortie done', {i, queueErrorsDelta: window.getActionQueueErrors().length - errBefore});
                    for (let k = 0; k < 30; k++) {
                        const hq2 = window.game.scene.getScene('HqScene');
                        const btn = findIn(hq2.children.list, o => o.getText && typeof o.getText === 'function' && (o.getText() || '').includes('File the Report'));
                        if (btn) { btn.emit('pointerdown'); break; }
                        await new Promise(r => setTimeout(r, 200));
                    }
                } catch (e) { failures.push('sortie ' + i + ': ' + String(e && e.message || e)); L('SORTIE FAILED', {i, err: String(e && e.message || e)}); }
            }
            const newHits = [...seen].filter(n => NEW_ENEMIES.some(k => n.includes(k)));
            return { spawned: [...seen], newHits, failures, queueErrors: window.getActionQueueErrors() };
        });
        console.log('[qa-spawn] RESULT:');
        console.log(JSON.stringify(result, null, 2));
        exitCode = result.failures.length === 0 ? 0 : 1;
    } catch (e) {
        console.error('[qa-spawn] failed:', e instanceof Error ? e.stack ?? e.message : e);
    } finally {
        await browser.close();
        server.close();
    }
    process.exit(exitCode);
}

const watchdog = setTimeout(() => { console.error('[qa-spawn] overall timeout'); process.exit(1); }, OVERALL_TIMEOUT_MS);
watchdog.unref();
main().catch(e => { console.error('[qa-spawn] unhandled:', e); process.exit(1); });
