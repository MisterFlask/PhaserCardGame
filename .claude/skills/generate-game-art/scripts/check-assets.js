// Diff the ImageUtils.ts asset manifest against resources/ on disk, and
// detect texture-key collisions (two manifest entries resolving to the same
// Phaser texture key). Exposed as a requireable module (no side effects on
// import) plus a thin CLI entry guarded by `require.main === module` so it
// can be required from a vitest test (src/utils/__tests__/AssetManifestLint.test.ts)
// without exiting the host process.
const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '..', '..', '..', '..');

/**
 * Parses the ImageUtils.ts manifest source and returns a flat list of
 * { category, prefix, file, key } entries.
 * (Crude regex parse — quoted strings inside comments in the files arrays
 * will false-positive, so keep manifest comments free of quoted filenames.)
 */
function parseManifest(source) {
    const catRe = /(\w+):\s*\{\s*prefix:\s*'([^']+)'\s*,\s*files:\s*\[([\s\S]*?)\]/g;
    const entries = [];
    let m;
    while ((m = catRe.exec(source)) !== null) {
        const category = m[1];
        const prefix = m[2];
        const files = [...m[3].matchAll(/['"]([^'"]+)['"]/g)].map(x => x[1]);
        for (const file of files) {
            const key = file.replace(/\.(png|webp|svg)$/, '');
            entries.push({ category, prefix, file, key });
        }
    }
    return entries;
}

/** Reads and parses the real repo manifest. */
function loadManifest(repoRoot = REPO_ROOT) {
    const src = fs.readFileSync(path.join(repoRoot, 'src/utils/ImageUtils.ts'), 'utf8');
    return parseManifest(src);
}

/** Returns manifest entries whose file does not exist on disk. */
function findMissingFiles(entries, repoRoot = REPO_ROOT) {
    return entries.filter(e => !fs.existsSync(path.join(repoRoot, 'resources', e.prefix, e.file)));
}

/**
 * Returns texture-key collisions: groups of 2+ manifest entries that share a
 * key but point at different files (identical prefix+file duplicates are not
 * reported as collisions — same asset, listed twice).
 */
function findKeyCollisions(entries) {
    const byKey = new Map();
    for (const e of entries) {
        const loc = e.prefix + e.file;
        if (!byKey.has(e.key)) byKey.set(e.key, new Set());
        byKey.get(e.key).add(loc);
    }
    const collisions = [];
    for (const [key, locs] of byKey.entries()) {
        if (locs.size > 1) collisions.push({ key, locations: [...locs] });
    }
    return collisions;
}

function runCheck(repoRoot = REPO_ROOT) {
    const entries = loadManifest(repoRoot);
    const missing = findMissingFiles(entries, repoRoot);
    const collisions = findKeyCollisions(entries);
    return { total: entries.length, missing, collisions };
}

function printReport(result) {
    console.log(`Manifest entries: ${result.total}, missing on disk: ${result.missing.length}, key collisions: ${result.collisions.length}`);
    result.missing.forEach(e => console.log('  MISSING ' + e.prefix + e.file));
    result.collisions.forEach(c => console.log('  KEY COLLISION ' + c.key + ': ' + c.locations.join(' vs ')));
}

module.exports = {
    REPO_ROOT,
    parseManifest,
    loadManifest,
    findMissingFiles,
    findKeyCollisions,
    runCheck,
    printReport,
};

if (require.main === module) {
    const result = runCheck();
    printReport(result);
    process.exit(result.missing.length > 0 ? 1 : 0);
}
