#!/usr/bin/env node
// scripts/ci-smoke.mjs
//
// Headless-Chrome smoke test runner for CI (and local use).
//
// Serves the repo root (index.html + dist/bundle.js + resources/) over a
// tiny built-in HTTP server on an ephemeral port, launches headless Chromium
// via puppeteer, waits for the game to boot to HqScene and expose
// `window.runSmokeTest` (see src/utils/SmokeTest.ts), calls it, and prints
// the full { passed, steps, errors } result as JSON.
//
// Exit code is 0 iff the smoke test result has `passed === true`.
//
// Prerequisite: `npm run build` must have already produced dist/bundle.js.
// This script does NOT build the game itself.
//
// Usage: node scripts/ci-smoke.mjs

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');

// Whole-run budget, per task spec: generous because the game logs a lot and
// a hidden/headless tab throttles timers (see CLAUDE.md "sharp edges").
const OVERALL_TIMEOUT_MS = 5 * 60 * 1000;
// How long to wait for window.runSmokeTest to appear (game boot + bundle
// eval). Kept separate from the in-page smoke test's own step timeouts.
const BOOT_TIMEOUT_MS = 60 * 1000;

const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.mjs': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.map': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
    '.mp3': 'audio/mpeg',
    '.ogg': 'audio/ogg',
    '.wav': 'audio/wav',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.css': 'text/css; charset=utf-8',
};

function contentTypeFor(filePath) {
    return MIME_TYPES[path.extname(filePath).toLowerCase()] ?? 'application/octet-stream';
}

/** Minimal static file server scoped to REPO_ROOT. No directory listing,
 *  no caching headers beyond the defaults — this only needs to survive a
 *  single CI run. */
function startServer() {
    const server = http.createServer((req, res) => {
        try {
            const urlPath = decodeURIComponent((req.url ?? '/').split('?')[0]);
            const relativePath = urlPath === '/' ? '/index.html' : urlPath;
            const resolved = path.normalize(path.join(REPO_ROOT, relativePath));

            // Guard against path traversal outside the repo root.
            if (!resolved.startsWith(REPO_ROOT)) {
                res.writeHead(403);
                res.end('Forbidden');
                return;
            }

            fs.readFile(resolved, (err, data) => {
                if (err) {
                    res.writeHead(404);
                    res.end('Not found');
                    return;
                }
                res.writeHead(200, { 'Content-Type': contentTypeFor(resolved) });
                res.end(data);
            });
        } catch (e) {
            res.writeHead(500);
            res.end(String(e));
        }
    });

    return new Promise((resolve, reject) => {
        server.on('error', reject);
        // Port 0 -> OS-assigned ephemeral port; avoids clashing with the
        // dev "game" launch.json config (fixed port 8123) or anything else
        // that might be running on the CI runner.
        server.listen(0, '127.0.0.1', () => resolve(server));
    });
}

function withTimeout(promise, timeoutMs, label) {
    let timer;
    const timeout = new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error(`Timed out after ${timeoutMs}ms waiting for: ${label}`)), timeoutMs);
    });
    return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

async function main() {
    console.log('[ci-smoke] Starting static file server for repo root...');
    const server = await startServer();
    const { port } = server.address();
    const url = `http://127.0.0.1:${port}/index.html`;
    console.log(`[ci-smoke] Serving ${REPO_ROOT} at ${url}`);

    console.log('[ci-smoke] Launching headless Chromium via puppeteer...');
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    let exitCode = 1;
    try {
        const page = await browser.newPage();

        // Pipe all page console output through to stdout so CI failures are
        // diagnosable without re-running locally.
        page.on('console', msg => {
            console.log(`[page:${msg.type()}] ${msg.text()}`);
        });
        page.on('pageerror', err => {
            console.log(`[page:error] ${err.message}`);
        });
        page.on('requestfailed', req => {
            console.log(`[page:requestfailed] ${req.url()} - ${req.failure()?.errorText}`);
        });

        console.log(`[ci-smoke] Navigating to ${url}...`);
        await page.goto(url, { waitUntil: 'load', timeout: BOOT_TIMEOUT_MS });

        console.log('[ci-smoke] Waiting for window.runSmokeTest to be defined (game boot to HQ)...');
        await withTimeout(
            page.waitForFunction('typeof window.runSmokeTest === "function"', { timeout: BOOT_TIMEOUT_MS }),
            BOOT_TIMEOUT_MS,
            'window.runSmokeTest to be defined'
        );

        console.log('[ci-smoke] Calling window.runSmokeTest()...');
        const result = await withTimeout(
            page.evaluate(() => window.runSmokeTest()),
            OVERALL_TIMEOUT_MS,
            'window.runSmokeTest() to resolve'
        );

        console.log('[ci-smoke] Smoke test result:');
        console.log(JSON.stringify(result, null, 2));

        exitCode = result && result.passed === true ? 0 : 1;
    } catch (e) {
        console.error('[ci-smoke] Smoke test runner failed:', e instanceof Error ? e.stack ?? e.message : e);
        exitCode = 1;
    } finally {
        await browser.close();
        server.close();
    }

    process.exit(exitCode);
}

// Enforce the overall wall-clock budget even if something inside main()
// hangs on a promise that never settles (belt-and-braces alongside the
// per-step withTimeout calls above).
const watchdog = setTimeout(() => {
    console.error(`[ci-smoke] Overall timeout of ${OVERALL_TIMEOUT_MS}ms exceeded; forcing exit.`);
    process.exit(1);
}, OVERALL_TIMEOUT_MS + BOOT_TIMEOUT_MS);
watchdog.unref();

main().catch(e => {
    console.error('[ci-smoke] Unhandled error:', e instanceof Error ? e.stack ?? e.message : e);
    process.exit(1);
});
