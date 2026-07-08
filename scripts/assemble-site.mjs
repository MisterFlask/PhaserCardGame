#!/usr/bin/env node
// scripts/assemble-site.mjs
//
// Builds a `site/` staging directory containing only what the deployed game
// actually needs to boot and play, instead of shipping the whole ~170MB+
// resources/ tree wholesale to gh-pages.
//
// What gets copied:
//   - index.html, favicon.ico (read directly from index.html's own tags)
//   - dist/bundle.js (+ .LICENSE.txt/.map if present, harmless either way)
//   - every resources/ file the ImageUtils.ts manifest references
//     (via check-assets.js's loadManifest(), the manifest parser of record)
//   - an explicit EXTRA_FILES list below for runtime assets the image
//     manifest doesn't know about (sounds, fonts) — deliberately NOT a
//     blind directory copy, so anything new added under resources/ that
//     isn't wired into the manifest or this list will 404 in the staged
//     site and get caught by the smoke test, not silently shipped as dead
//     weight or silently missing.
//
// Usage:
//   node scripts/assemble-site.mjs [--out=site] [--compress] [--quality=80]
//
//   --compress   Optional lossy PNG recompression pass over the staged
//                resources/ (requires the `sharp` devDependency). Skips
//                gracefully with a warning if sharp isn't installed.
//   --quality=N  PNG quality for --compress (default 80).
//   --out=DIR    Staging directory (default "site", matching the CI deploy
//                step's publish_dir).
//
// This script only READS from resources/ and dist/ — it never modifies
// source assets in place (house rule: never touch source PNGs destructively).

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');
const require = createRequire(import.meta.url);

// Manifest parser of record (also used by AssetManifestLint.test.ts).
const { loadManifest } = require('../.claude/skills/generate-game-art/scripts/check-assets.js');

// Runtime resources/ files that aren't declared in the ImageUtils.ts image
// manifest but are loaded directly by the game. Keep this list explicit and
// exhaustive rather than falling back to a directory copy — new additions
// here should come with a comment explaining what loads them.
const EXTRA_FILES = [
    // SoundUtils.sounds — resources/Sounds/Effects/* (SoundUtils.ts prefix).
    'Sounds/Effects/click1.ogg',
    'Sounds/Effects/rollover6.ogg',
    'Sounds/Effects/card-whoosh.ogg',
    'Sounds/Effects/damage-thud.ogg',
    'Sounds/Effects/board-meeting-sting.ogg',
    // UIStyle.ts loads these via FontFace() with a literal resources/Fonts/ URL.
    'Fonts/IMFellEnglishSC-Regular.ttf',
    'Fonts/IMFellEnglish-Regular.ttf',
];

function parseArgs(argv) {
    const args = { out: 'site', compress: false, quality: 80 };
    for (const arg of argv) {
        if (arg === '--compress') args.compress = true;
        else if (arg.startsWith('--quality=')) args.quality = Number(arg.slice('--quality='.length));
        else if (arg.startsWith('--out=')) args.out = arg.slice('--out='.length);
    }
    return args;
}

function dirSizeBytes(dir) {
    let total = 0;
    if (!fs.existsSync(dir)) return 0;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) total += dirSizeBytes(full);
        else total += fs.statSync(full).size;
    }
    return total;
}

function formatBytes(bytes) {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB (${bytes.toLocaleString()} bytes)`;
}

function copyFile(srcRel, destRoot) {
    const src = path.join(REPO_ROOT, srcRel);
    const dest = path.join(destRoot, srcRel);
    if (!fs.existsSync(src)) {
        return { ok: false, srcRel };
    }
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
    return { ok: true, srcRel };
}

/** Extracts local (non-http) src/href references from index.html so the
 *  script never hardcodes what the page loads directly — it reads it. */
function extractIndexHtmlLocalRefs(html) {
    const refs = new Set();
    const attrRe = /(?:src|href)\s*=\s*"([^"]+)"/g;
    let m;
    while ((m = attrRe.exec(html)) !== null) {
        const url = m[1];
        if (/^([a-z]+:)?\/\//i.test(url) || url.startsWith('data:')) continue; // external/inline
        refs.add(url);
    }
    return [...refs];
}

async function maybeCompress(stagedResourcesDir, quality) {
    let sharp;
    try {
        sharp = (await import('sharp')).default;
    } catch (e) {
        console.warn('[assemble-site] --compress requested but `sharp` is not installed; skipping compression.');
        console.warn(`[assemble-site] (${e && e.message ? e.message : e})`);
        return { attempted: false };
    }

    const beforeBytes = dirSizeBytes(stagedResourcesDir);

    function walk(dir, out = []) {
        for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
            const full = path.join(dir, entry.name);
            if (entry.isDirectory()) walk(full, out);
            else if (entry.name.toLowerCase().endsWith('.png')) out.push(full);
        }
        return out;
    }

    const pngFiles = walk(stagedResourcesDir);
    console.log(`[assemble-site] Compressing ${pngFiles.length} staged PNGs at quality ${quality}...`);

    let compressedCount = 0;
    for (const file of pngFiles) {
        const original = fs.readFileSync(file);
        try {
            const output = await sharp(original)
                .png({ quality, compressionLevel: 9, palette: true })
                .toBuffer();
            // Only keep the recompressed version if it's actually smaller —
            // some already-optimized/small PNGs can grow under palette
            // quantization, and there's no point shipping a bigger file.
            if (output.length < original.length) {
                fs.writeFileSync(file, output);
                compressedCount++;
            }
        } catch (e) {
            console.warn(`[assemble-site] sharp failed on ${path.relative(REPO_ROOT, file)}, leaving original: ${e.message}`);
        }
    }

    const afterBytes = dirSizeBytes(stagedResourcesDir);
    console.log(`[assemble-site] Compressed ${compressedCount}/${pngFiles.length} PNGs (rest were already smaller than the recompressed candidate).`);
    return { attempted: true, beforeBytes, afterBytes };
}

async function main() {
    const args = parseArgs(process.argv.slice(2));
    const outDir = path.resolve(REPO_ROOT, args.out);

    console.log(`[assemble-site] Staging directory: ${outDir}`);
    fs.rmSync(outDir, { recursive: true, force: true });
    fs.mkdirSync(outDir, { recursive: true });

    // 1. index.html + whatever it references locally (bundle.js, favicon).
    const indexHtmlPath = path.join(REPO_ROOT, 'index.html');
    const indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');
    fs.copyFileSync(indexHtmlPath, path.join(outDir, 'index.html'));

    const localRefs = extractIndexHtmlLocalRefs(indexHtml);
    const missingRefs = [];
    for (const ref of localRefs) {
        const result = copyFile(ref, outDir);
        if (!result.ok) missingRefs.push(ref);
    }
    if (missingRefs.length > 0) {
        console.error(`[assemble-site] index.html references files that don't exist on disk: ${missingRefs.join(', ')}`);
        process.exit(1);
    }

    // dist/bundle.js.map and .LICENSE.txt aren't referenced by <script> tags
    // (browsers fetch .map lazily via a sourceMappingURL comment / devtools)
    // but are harmless to ship and useful for debugging prod issues; skip
    // silently if absent (e.g. a build without source maps).
    for (const extra of ['dist/bundle.js.map', 'dist/bundle.js.LICENSE.txt']) {
        const src = path.join(REPO_ROOT, extra);
        if (fs.existsSync(src)) copyFile(extra, outDir);
    }

    // 2. Every resources/ file the ImageUtils.ts manifest references.
    const manifestEntries = loadManifest(REPO_ROOT);
    const missingManifestFiles = [];
    for (const entry of manifestEntries) {
        const rel = path.join('resources', entry.prefix, entry.file);
        const result = copyFile(rel, outDir);
        if (!result.ok) missingManifestFiles.push(rel);
    }
    if (missingManifestFiles.length > 0) {
        // AssetManifestLint.test.ts already enforces this repo-wide; if it's
        // green this should never happen, but fail loudly rather than ship
        // a broken site.
        console.error(`[assemble-site] Manifest entries missing on disk: ${missingManifestFiles.join(', ')}`);
        process.exit(1);
    }

    // 3. Explicit extras (sounds, fonts) not covered by the image manifest.
    const missingExtras = [];
    for (const rel of EXTRA_FILES) {
        const result = copyFile(path.join('resources', rel), outDir);
        if (!result.ok) missingExtras.push(rel);
    }
    if (missingExtras.length > 0) {
        console.error(`[assemble-site] EXTRA_FILES entries missing on disk: ${missingExtras.join(', ')}`);
        process.exit(1);
    }

    const fullResourcesBytes = dirSizeBytes(path.join(REPO_ROOT, 'resources'));
    const stagedResourcesBytes = dirSizeBytes(path.join(outDir, 'resources'));
    const stagedTotalBytes = dirSizeBytes(outDir);

    console.log('[assemble-site] Referenced-only staging complete.');
    console.log(`[assemble-site] Full resources/ on disk: ${formatBytes(fullResourcesBytes)}`);
    console.log(`[assemble-site] Staged resources/ (manifest + extras):   ${formatBytes(stagedResourcesBytes)}`);
    console.log(`[assemble-site] Staged site/ total (incl. bundle.js):    ${formatBytes(stagedTotalBytes)}`);

    if (args.compress) {
        const result = await maybeCompress(path.join(outDir, 'resources'), args.quality);
        if (result.attempted) {
            const newTotal = dirSizeBytes(outDir);
            console.log(`[assemble-site] Staged resources/ before compression: ${formatBytes(result.beforeBytes)}`);
            console.log(`[assemble-site] Staged resources/ after compression:  ${formatBytes(result.afterBytes)}`);
            console.log(`[assemble-site] Staged site/ total after compression: ${formatBytes(newTotal)}`);
        }
    }

    console.log(`[assemble-site] Done: ${outDir}`);
}

main().catch(e => {
    console.error('[assemble-site] Failed:', e instanceof Error ? e.stack ?? e.message : e);
    process.exit(1);
});
