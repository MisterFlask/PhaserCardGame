// Rasterize card-art SVG sources to 512x512 PNGs using the preinstalled
// Chromium (no network, no extra deps). Card icons follow the game-icons
// convention: opaque black square background, single-hue gradient glyph.
//
// Usage:
//   node scripts/rasterize-card-svg.mjs <file.svg | dir> [...more]
//
// Each foo.svg is written as foo.png next to it. SVG sources live beside
// their PNGs under resources/Sprites/Cards/**; keep both in the repo so
// icons stay editable.

import puppeteer from 'puppeteer';
import { readdirSync, statSync } from 'fs';
import { resolve, dirname, basename, join } from 'path';

const SIZE = 512;

function collectSvgs(args) {
  const out = [];
  for (const a of args) {
    const p = resolve(a);
    if (statSync(p).isDirectory()) {
      for (const f of readdirSync(p)) {
        if (f.endsWith('.svg')) out.push(join(p, f));
      }
    } else if (p.endsWith('.svg')) {
      out.push(p);
    }
  }
  return out;
}

const svgs = collectSvgs(process.argv.slice(2));
if (svgs.length === 0) {
  console.error('no .svg inputs found');
  process.exit(1);
}

const browser = await puppeteer.launch({
  executablePath: '/opt/pw-browsers/chromium',
  args: ['--no-sandbox'],
});
const page = await browser.newPage();
await page.setViewport({ width: SIZE, height: SIZE });

for (const svg of svgs) {
  await page.goto('file://' + svg);
  await page.evaluate(() => {
    document.documentElement.style.margin = '0';
    document.body && (document.body.style.margin = '0');
  });
  const png = join(dirname(svg), basename(svg, '.svg') + '.png');
  await page.screenshot({ path: png, clip: { x: 0, y: 0, width: SIZE, height: SIZE } });
  console.log('rasterized', png);
}

await browser.close();
