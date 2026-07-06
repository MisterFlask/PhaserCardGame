#!/usr/bin/env node
// Generate one game art asset via the OpenAI image API (gpt-image-1) and
// save it into the repo. Usage:
//
//   node generate-image.js --out "resources/Sprites/Enemies/v2/foo.png" \
//     --size 1024x1024 --background transparent \
//     --prompt "..." [--quality medium]
//
// --out is repo-relative. Requires OPENAI_API_KEY in the environment.
// Sizes gpt-image-1 accepts: 1024x1024, 1536x1024 (landscape), 1024x1536.

const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '..', '..', '..', '..');

function arg(name, fallback) {
    const i = process.argv.indexOf('--' + name);
    return i !== -1 ? process.argv[i + 1] : fallback;
}

const out = arg('out');
const size = arg('size', '1024x1024');
const background = arg('background', 'transparent');
const prompt = arg('prompt');
const quality = arg('quality', 'medium');

if (!process.env.OPENAI_API_KEY) {
    console.error('OPENAI_API_KEY is not set in the environment. Stop and report this to the user; do not try to work around it.');
    process.exit(1);
}
if (!out || !prompt) {
    console.error('Required: --out <repo-relative path> --prompt "..."');
    process.exit(1);
}

(async () => {
    const res = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ model: 'gpt-image-1', prompt, size, quality, background, n: 1 }),
    });
    if (!res.ok) {
        console.error(`HTTP ${res.status}: ${(await res.text()).slice(0, 600)}`);
        process.exit(1);
    }
    const data = await res.json();
    const b64 = data.data?.[0]?.b64_json;
    if (!b64) {
        console.error('No b64_json in API response.');
        process.exit(1);
    }
    const abs = path.join(REPO_ROOT, out);
    fs.mkdirSync(path.dirname(abs), { recursive: true });
    fs.writeFileSync(abs, Buffer.from(b64, 'base64'));
    console.log(`OK ${out} (${Math.round(fs.statSync(abs).size / 1024)} KB)`);
})();
