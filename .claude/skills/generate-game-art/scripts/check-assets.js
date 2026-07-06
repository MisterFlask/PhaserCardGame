#!/usr/bin/env node
// Diff the ImageUtils.ts asset manifest against resources/ on disk.
// Run after any manifest or asset change; exit code 1 if anything is missing.
const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '..', '..', '..', '..');
const src = fs.readFileSync(path.join(REPO_ROOT, 'src/utils/ImageUtils.ts'), 'utf8');

// Extract each category block: prefix + files array. (Crude regex parse —
// quoted strings inside comments in the files arrays will false-positive,
// so keep manifest comments free of quoted filenames.)
const catRe = /prefix:\s*'([^']+)'\s*,\s*files:\s*\[([\s\S]*?)\]/g;
let m, total = 0;
const missing = [];
const keyOwners = new Map(); // texture key -> first file that claims it
const collisions = [];
while ((m = catRe.exec(src)) !== null) {
    const prefix = m[1];
    const files = [...m[2].matchAll(/['"]([^'"]+)['"]/g)].map(x => x[1]);
    for (const f of files) {
        total++;
        if (!fs.existsSync(path.join(REPO_ROOT, 'resources', prefix, f))) missing.push(prefix + f);
        const key = f.replace(/\.(png|webp)$/, '');
        if (keyOwners.has(key) && keyOwners.get(key) !== prefix + f) {
            collisions.push(`${key}: ${keyOwners.get(key)} vs ${prefix}${f}`);
        } else {
            keyOwners.set(key, prefix + f);
        }
    }
}
console.log(`Manifest entries: ${total}, missing on disk: ${missing.length}, key collisions: ${collisions.length}`);
missing.forEach(f => console.log('  MISSING ' + f));
collisions.forEach(c => console.log('  KEY COLLISION ' + c));
process.exit(missing.length > 0 ? 1 : 0);
