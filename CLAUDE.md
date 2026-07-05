# The East Infernal Company (working title)

Roguelike deckbuilder: XCOM-style strategic layer (contract board, roster,
quarterly shareholder dividends) over Slay-the-Spire-style tactical combat.
Victorian colonial Hell, 1890s. Design intent lives in
`src/docs/strategic_layer_redesign.md` (strategic layer, authoritative) and
`src/docs/overall_game_concept.md` + `src/docs/worldbuilding.md` (theme).

## Commands

- `npm test` — vitest, ~200ms, no browser. Run after every change.
- `npm run typecheck` — tsc, much faster than a build for catching errors.
- `npm run build` — webpack → `dist/bundle.js`.
- Play/verify: serve repo root (`.claude/launch.json` defines the "game"
  server, port 8123). Debug hooks: `window.game`, `window.getGameState()`,
  `window.getCampaignState()`. Drive scenes from the console/eval; win combats
  by zeroing `combatState.enemies[].hitpoints`; advance sorties via
  `combatScene.mapButton.emit('pointerdown'/'pointerup')`. rexUI buttons
  ignore synthetic canvas pointer events — emit on the game objects directly.

## Definition of done

A gameplay change is done when: typecheck clean, all vitest tests pass, the
build compiles, AND a full sortie loop has been driven in the browser
(contract board → dispatch → combat → payout → back at HQ) without errors.
State-layer changes must also survive a save/reload round-trip.

## House rules

1. **Game rules stay Phaser-free.** `src/campaign/` and the pure parts of
   `src/saveload/` must import nothing that transitively pulls in Phaser
   (AbstractCard does!). New rules logic goes in pure modules with injectable
   randomness, unit-tested under `__tests__/`. Only scenes/panels/UI touch
   Phaser.
2. **One currency.** `GameState.moneyInVault` (£) is the only money. Do not
   reintroduce per-run currencies.
3. **State has one owner.** Campaign-lifetime state (roster, calendar,
   contracts, projects) lives on `CampaignUiState`; `GameState` holds only the
   deployed squad and combat state. Never duplicate a fact across both.
4. **Saves are HQ-only checkpoints.** Never serialize mid-combat or mid-sortie
   state. Any buff or card that can persist on a roster deck must be
   registered in `src/saveload/SaveRegistries.ts` — the lint test
   (`SaveRegistriesLint.test.ts`) enforces this and will name the offender.
   Bump `SAVE_FORMAT_VERSION` when the save shape changes.
5. **The node map is dead.** The old Slay-the-Spire 15-floor map, trade
   routes, and liquidation flow were deliberately deleted (July 2026). Don't
   resurrect their patterns; sorties are fixed sequences run by
   `SortieManager`.
6. **No hard-coded special cases.** Prefer registries, data tables, and hooks
   (see ContractGenerator's flavor tables, CardModifierRegistry) over
   if-this-specific-card branches.
7. **UI follows the house pattern.** HQ panels extend `AbstractHqPanel` and
   compose `TextBox`/`TextBoxButton`; register new panels in `HqScene`'s
   `showPanel` switch and navigate via `scene.events.emit('navigate', ...)`.
8. **Flavor voice:** dry corporate humor over Lovecraftian dread (see
   `src/docs/worldbuilding.md`). Player-facing text uses BBCode formatting,
   £ for money, and the Company's bureaucratic register.

## Known sharp edges

- Phaser's loader stalls in hidden browser tabs; `LoaderWatchdog` works around
  it — keep it installed in every scene's `preload`.
- `index.html` loads two CDN Phaser builds plus the bundled one; don't rely on
  `window.Phaser` being the bundle's instance.
- Combat itself (ActionManager, action queue) is scene-bound and cannot run
  headless yet; verify combat behavior in the browser.
