# Art Pass Plan — Placeholder Inventory & Execution Spec

Status: **blocked on environment config** (July 2026). This document is the
complete, executable spec for the pass so it can run the moment the blockers
clear. Inventory below was produced by a full sweep of every card, relic,
enemy, intent, event, consumable, strategic project, and buff class against
the `ImageUtils` manifest.

## Blockers (both are Claude-Code-on-the-web environment settings)

1. `OPENAI_API_KEY` is not set in the remote environment. Add it as an
   environment secret.
2. The environment's network policy denies `api.openai.com` (CONNECT 403
   from the agent proxy). Allow that domain in the environment's network
   policy.

Generation uses `.claude/skills/generate-game-art` (style blocks, scripts,
and verification steps live there — follow it verbatim). Cost ≈ $0.04/image
at medium quality; the full pass below is ~230 images ≈ **$9–10**.

## Inventory summary (verified string → manifest key, July 2026)

| Category | Swept | Real art | Placeholder |
|---|---|---|---|
| Cards (incl. statuses, curses, cargo, tokens) | 139 | 21 | **118** |
| Relics | 41 | 41 | 0 |
| Enemies (incl. legacy EncounterManager) | 77 | 77 | 0 |
| Intent icons | all | all | 0 |
| Narrative event backgrounds | 25 | 0 | **25** |
| Consumables | 13 | 0 | **13** |
| Strategic projects (HQ cards) | 11 | 0 | **11** |
| Status/buff icons (non-relic) | 201 | 32 | **~169** (60 broken ref + ~96 unset) |

Priority by player visibility: **(1) core combat status icons, (2) event
backgrounds, (3) cards, (4) consumables, (5) strategic projects, (6) long
tail of buff/perk/persona icons.**

## Work package 1 — core status/buff icons (~60 images)

These render on every combat turn. 60 buffs set an `imageName` that does
not exist in the manifest — the name documents the intended subject, so the
prompt writes itself. Core set: `Vulnerable→broken-shield`,
`Weak→fist-weakness`, `Poisoned→poison-bottle` (NB: `poison-bottle-2`
exists but is the intent icon — keep keys distinct), `Burning→burning-icon`,
`Holy→holy`, `Cursed→cursed`, `Armored→armored`, `Blind→blind`,
`Intangible→intangible`, `Ward→ward`, `Tense→tense`, `Fearless→fearless`,
`Intimidation→intimidate`, `Bloodsucker→blood`, `Implacable→skull`, plus
the `AngelicTattooBuffs.ts` (10) and `HellDiseases.ts` (7) sets. Grep
`imageName = '...'` under `src/gamecharacters/buffs/**` and diff against the
manifest for the full list.

- Style: the flat-icon block from the skill (single off-white glyph,
  game-icons.net style, transparent).
- Wiring: drop PNGs in a new `Sprites/StatusIcons/` category (avoid key
  collisions with intent icons), add manifest category, no code changes —
  the declared `imageName`s start resolving.
- The ~96 buffs with `imageName` unset (perks, personas, card-mechanic
  tags) are lower value; verify each actually renders an icon before
  spending images on it.

## Work package 2 — event backgrounds (25 images)

All 25 events under `src/encounters/events/` default to
`placeholder_event_background_1/2`. Each event's flavor text is in its file;
compose one 1536x1024 opaque background per event using the skill's
background style block (dark fantasy oil painting, Victorian palette,
infernal accents, "no characters, no text, no watermark").

- Wiring: set `portraitName` in each event's constructor; add files to a
  new `Backgrounds/Events/` manifest category.
- Verify with `node scripts/qa-events.mjs` (renders every pooled event).

## Work package 3 — cards — DONE (July 2026, no generation needed)

Completed without the OpenAI pipeline: it turned out large curated
game-icons pools already existed on disk (Archon 35, Cog 71, Diabolist 32,
Blackhand 37, Rookie/Sifter/Hammer/Madness) — most unwired. All 118
placeholder cards now have art: ~80 assigned from those pools (wired into
the manifest under cards_archon/cards_cog/etc.), 37 authored as SVG
glyphs matching the gradient-on-black icon convention (SVG sources
committed beside the PNGs; rasterized via scripts/rasterize-card-svg.mjs,
which uses the local headless Chromium), and a handful of key
renames/reuses. 17 allowlist rows removed; the "shield" literal hold was
resolved by renaming Defend's icon to rookie-defend. Verified: typecheck,
202/202 vitest, build, smoke. The original spec below is retained for
reference.

## ~~Work package 3 — cards (118 images)~~ (superseded, see above)

**Convention (owner note): card art must stay simple and easily readable —
flat white game-icons.net-style glyphs, same as the existing 17 bespoke
card icons. Do not introduce full-color painted card art.**

Two sub-buckets:

1. **18 cards whose `portraitName` points at a missing texture** (the name
   already says what to draw): HoldTheLine→`CourageUnderFire`,
   FireRevolver→`gun`, Rummage→`rummage`, Defend→`shield`,
   RageFueledAxe, InfernaliteCache (rename its debug key `enrage-test`),
   Pyrestarter, AxeMeAQuestion, HazmatSpecialist, ReIgnition, Smokescreen,
   BloodShield, and the six Trauma curses (`addiction-curse`,
   `berserk-curse`, `greedy-curse`, `idolatrous-curse`, `paranoid-curse`,
   `vain-curse`). Generate to the declared key (or fix the key while
   you're there).
2. **100 cards with no `portraitName` at all**, grouped: Archon ~22 (the
   whole class), Diabolist 16, Cog 15, Blackhand 5, other/tokens 17,
   cargo 8 (all), statuses/curses 8, enemy-token cards 5, relic-token
   cards 3. Each card's file contains name + effect for prompt subjects.
   Set `portraitName` in each constructor; art goes in the class's
   category (`Sprites/Cards/<Class>/`).

Batching: ~6 dispatch batches by class; run
`node .claude/skills/generate-game-art/scripts/check-assets.js` (0 missing,
no new key collisions) + `npm run typecheck` after each batch, and one
`npm run smoke` at the end.

## Work package 4 — consumables (13 images)

All 13 classes under `src/consumables/` leave `imageName = ""`. These are
physical objects (potions, kits, purses) — painted-object style à la the
cursed-cargo set is appropriate (consumable icons render untinted), or flat
glyphs for consistency; owner's call, default to painted objects.
Wire: set `this.imageName` in each constructor, new `Sprites/Consumables/`
manifest category.

## Work package 5 — strategic projects (11 images)

Every project under `src/strategic_projects/` declares a snake_case
`portraitName` that doesn't exist (CompanySecretariat has `""`). These are
HQ capital works — Victorian corporate-infernal subjects (bond
certificates, poppy fields, foundries). Painted style reads well at HQ
scale, but they extend AbstractCard, so confirm with the owner whether the
flat-glyph card convention should apply. Generate to the declared keys,
new `Sprites/StrategicProjects/` category.

## Interaction with the missing-art allowlist (owner rulings apply)

`EXPECTED_MISSING_IMAGE_REFS` in
`src/utils/__tests__/AssetManifestLint.test.ts` is the authoritative list of
known broken image refs (the "94 rows" in TODO.md). When arting any ref from
that list, remove its row in the same change. Standing owner holds (TODO.md):
rows for unreleased content wait until that content ships; rename one side of
the shared `"shield"` literal before arting either; delete rather than art
any dead refs. Work packages 1 and 3.1 above overlap that list — reconcile
against it before generating.

## Adjacent findings (not art, worth a look while in here)

- `AbstractRelic.init()` checks only `!this.imageName`, not
  `textures.exists()` — a typo'd relic image renders as a broken texture
  instead of falling back to a placeholder (latent; all 41 current relics
  resolve).
- Orphaned-but-real art: boss relics BurningAntlers/CharonPrice/FancyHat
  and several uncommons aren't wired into RelicsLibrary; Hammer/Sifter
  portrait sets exist on disk with no implemented class.
- `Artiste.ts` has a token card display-named "Afpoiasdoif" (debug string).
