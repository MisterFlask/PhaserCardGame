---
name: generate-game-art
description: Generate or replace art assets for this game (enemy sprites, character portraits, backgrounds, icons) via the OpenAI image API. Use this whenever asked to create art, fix placeholder or missing art, add portraits for a class, give an enemy a real image, replace a mislabeled texture, or when boot logs show texture 404s. Also use it to audit the asset manifest against disk. Requires OPENAI_API_KEY in the environment.
---

# Generate Game Art

This repo's art is manifest-driven: `src/utils/ImageUtils.ts` declares every
asset as `resources/<category prefix><filename>`, and the **texture key is the
filename minus `.png`**. Adding art = generate the PNG into the right
`resources/` path + add the filename to the right category in the manifest.

Two scripts live next to this file:

- `scripts/generate-image.js` — one API call, one saved PNG. Requires
  `OPENAI_API_KEY` env var; if it's missing, stop and report — don't hunt for
  keys or work around it.
- `scripts/check-assets.js` — diffs the manifest against disk and detects
  texture-key collisions. Run it after every change; it must end with
  `missing on disk: 0`.

Cost: ~$0.04 per image at `medium` quality. A handful of images is fine
without asking; for batches over ~15, get the owner's go-ahead first —
that's real money spent silently.

## Workflow

1. **Find the target.** Locate the asset's category in `ImageUtils.images`
   (or pick the right category for a new asset). If replacing a reference,
   find who uses the key: `portraitName` on enemies/events, `imageName` on
   intents. Subject flavor lives in `src/docs/worldbuilding.md` (Victorian
   colonial Hell, 1890s).
2. **Pick the style block** for the category (below) and compose the prompt:
   style block + subject description + the no-background sentence when
   transparency is needed.
3. **Generate:**
   ```
   node .claude/skills/generate-game-art/scripts/generate-image.js \
     --out "resources/Sprites/Enemies/v2/my-enemy.png" \
     --size 1024x1024 --background transparent \
     --prompt "<style block>. Subject: <description>. <no-background sentence>"
   ```
   Sizes: `1024x1024` (sprites/portraits/icons), `1536x1024` (backgrounds).
4. **Look at the result** (Read the PNG) and judge it against the style
   examples before proceeding. IMPORTANT: for transparent assets, a
   baked-looking background/vignette in the preview is usually NOT real —
   previews composite residual RGB under alpha-0 pixels. Check corner alpha
   before regenerating over it (tested snippet):
   ```powershell
   Add-Type -AssemblyName System.Drawing
   $bmp = New-Object System.Drawing.Bitmap("C:\dev\PhaserCardGame\resources\...\file.png")
   $bmp.GetPixel(5,5).A   # 0 means the corner is transparent - it's fine
   $bmp.Dispose()
   ```
   One regeneration with an adjusted prompt is normal; if it's still wrong
   after two attempts, report rather than burning more calls.
5. **Wire it up.** Add the filename to the manifest category. Update any
   `portraitName`/`imageName` reference. Rules that have bitten before:
   - Keys are global across ALL categories. `check-assets.js` reports
     collisions — a duplicate filename in two categories means one silently
     wins. Pick a distinct filename instead (this is why the intent icon is
     `pentacle-intent.png`, not `pentacle.png`).
   - Don't put quoted filenames in manifest comments; the checker's parser
     reads them.
6. **Rebuild before any browser check:** `npm run build`. The dev server is
   a static `http-server` serving `dist/bundle.js`, not a watcher — a
   manifest edit is invisible in the browser until you rebuild, and skipping
   this gives a false-negative texture check.
7. **Verify:** `node .claude/skills/generate-game-art/scripts/check-assets.js`
   (must be 0 missing; 8 key collisions are pre-existing and tolerated —
   the bar is "no NEW collisions") and `npm run typecheck`. If a browser is
   available, boot the game (see CLAUDE.md) and confirm
   `game.textures.exists('<key>')` and no load errors in the console.
8. Per repo protocol (CLAUDE.md): don't commit — report what you changed.

## Style blocks (tested — reuse verbatim, then append the subject)

**Enemy sprites** (`Sprites/Enemies/v2/`, transparent):
> 2D video game enemy sprite, bold cel-shading, thick dark outlines, flat
> colors with simple shading, dark muted palette with red accents, small
> drawn shadow ellipse under the figure, in the style of a polished indie
> RPG monster sprite

**Backgrounds** (`Backgrounds/**`, opaque, 1536x1024):
> dark fantasy oil painting style, painterly brushwork, muted Victorian
> palette with infernal red accents

Then describe the scene; end with "no characters, no text, no watermark".

**Class portraits** (`Portraits/<Class>Portraits/<gender>/`, transparent):
House convention — the faces are deliberately BLANK: pale featureless skin,
no eyes, no nose, no mouth (accessories like round spectacles are fine and
read well). Head-and-shoulders bust, anime-adjacent clean lineart, soft cel
shading, class-flavored headwear/props (Archon: red military cap; Diabolist:
wide-brimmed occult hat; Cog: goggles/brass; Blackhand: cigar/scarring).
Add: "head and shoulders bust only, face is completely blank featureless
pale skin with no facial features". The existing set itself varies (one
archon has black-bar eyes; the rest are fully blank) — treat "blank or
near-blank" as acceptable and don't over-iterate chasing perfection.
Portraits render small (~200px) — keep silhouettes bold. New files follow the numbered pattern
(`archon_female_3.png`) and join the class's manifest category, which makes
them immediately eligible for random recruit portraits.

**Flat UI/intent icons** (`Sprites/IntentIcons/` etc., transparent):
> Flat 2D game UI icon: <subject>. A single solid off-white glyph with clean
> bold strokes, style of game-icons.net. The glyph is the ONLY content.

**The no-background sentence** (append for every transparent asset):
> The background must be fully transparent alpha — no backdrop, no gradient,
> no vignette, nothing behind the subject. No text, no watermark.

## Gotchas

- **Transparency looks broken in previews but usually isn't.** Image
  previews composite residual RGB under alpha-0 pixels, so a "baked brown
  background" may actually be transparent. Before regenerating over a
  background complaint, check corner alpha programmatically (PowerShell:
  `(New-Object System.Drawing.Bitmap($path)).GetPixel(5,5).A` after
  `Add-Type -AssemblyName System.Drawing`) — alpha 0 at the corners means
  it's fine.
- **Painterly prompts fight transparency.** "Oil painting" language makes
  the model paint edge-to-edge. For transparent assets use the cel-shaded /
  flat-icon blocks and always include the no-background sentence.
- Generated PNGs are 1–2 MB. Acceptable for placeholders; don't generate
  hundreds without raising the repo-size question.
