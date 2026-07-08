# The East Infernal Company (working title)

Roguelike deckbuilder: XCOM-style strategic layer (contract board, roster,
quarterly shareholder dividends) over Slay-the-Spire-style tactical combat.
Victorian colonial Hell, 1890s. Design intent lives in
`src/docs/strategic_layer_redesign.md` (strategic layer, authoritative) and
`src/docs/overall_game_concept.md` + `src/docs/worldbuilding.md` (theme).

## Commands

- `npm test` — vitest, <1s, no browser. Run after every change.
- `npm run typecheck` — tsc, much faster than a build for catching errors.
- `npm run build` — webpack dev → `dist/bundle.js` (~14MB);
  `npm run build:prod` — production (~3MB, what the deploy ships).
- `npm run smoke` — headless-Chrome full sortie loop (HQ → dispatch →
  combat → payout → save/reload); this IS the definition-of-done browser
  check and also gates the CI deploy. Build first.
- Headless QA harnesses (build first, each spawns its own browser):
  `node scripts/qa-spawn.mjs` (force-spawns act/segment encounters —
  verify new enemies), `node scripts/qa-events.mjs` (renders every pooled
  narrative event), `node scripts/qa-headless-combat.mjs N` (N scene-free
  combats via `window.runHeadlessCombat` + IPlayPolicy),
  `node scripts/measure-combat-rates.mjs` (win-rate sweep → regenerates
  `src/campaign/sim/combat-rates.fixture.json`).
- Balance simulation: `src/campaign/sim/CampaignSimulator.ts` (pure, seeded)
  with ratchet tests in `src/campaign/__tests__/CampaignSimulator.test.ts` —
  balance changes must keep the ratchets green or retune them WITH a
  recorded ruling.
- Play/verify manually: serve repo root (`.claude/launch.json` "game"
  server, port 8123). Debug hooks: `window.game`, `getGameState()`,
  `getCampaignState()`, `runSmokeTest()`, `runHeadlessCombat()`,
  `showEventByName()`/`listEventNames()`, `playtestJournal` (if present).
  Win combats by zeroing `combatState.enemies[].hitpoints`; advance via
  `combatScene.mapButton.emit('pointerdown'/'pointerup')`. rexUI buttons
  ignore synthetic canvas pointer events — emit on the game objects.
  KNOWN TOOLING TRAP: the shared preview's eval channel dies permanently
  once a CombatScene starts — do combat-phase verification via the
  headless harnesses, never the preview.

## Definition of done

A gameplay change is done when: typecheck clean, all vitest tests pass
(including the lint tests — SaveRegistries, AssetManifest, Consumables,
RelicEquipment — and the sim ratchets), the build compiles, AND
`npm run smoke` passes. New enemies also need a `qa-spawn` run; new events
a `qa-events` run; combat-balance changes a `measure-combat-rates` sweep.
State-layer changes must survive a save/reload round-trip (smoke covers
the basic one).

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

## Working protocol (token economics)

The lead model (Fable) is scarce/expensive; implementation goes to dispatched
Sonnet agents. Division of labor:

- **Lead plans, reviews, commits.** Task decomposition, specs, final review,
  integration verification, and all git commits stay with the lead.
- **Merge to master once verification is green — no user approval needed.**
  Session work branches exist so parallel agents don't trip over each other,
  not as a review gate; after the definition-of-done checks pass and the lead
  has reviewed, merge to master directly. (External-agent lanes still go
  through PRs + green CI, below.)
- **Sonnet agents implement.** Dispatch briefs must carry: file pointers, the
  relevant house rules, explicit decision points, acceptance criteria, and the
  exact verification commands. Agents run typecheck + tests + the relevant
  browser smoke BEFORE returning and include the evidence in their report.
- **Agents stop on unlisted decisions.** If implementation surfaces a design
  choice the brief didn't anticipate, report it back instead of picking
  silently — silent-but-coherent wrong choices are the main delegation risk.
- **Agents do the work themselves.** Implementation agents must not
  sub-delegate to further agents; it breaks the review chain and the
  notification flow.
- **Agents never stage or commit.** No `git add`, no `git mv` (it stages
  implicitly — rename via the filesystem instead). Staged agent work rides
  along silently with the lead's next commit; the lead runs `git status`
  before every commit to catch strays.
- **Bounce to the same agent** (SendMessage) rather than re-dispatching; it
  keeps context.
- **Reserved for the lead:** novel debugging/root-causing, design forks,
  cross-system refactors, the save system, and anything where three failed
  agent attempts would cost more than direct work.
- **Parallel dispatches get disjoint file ownership.** Every brief names the
  exact files the agent owns; agents must not touch files owned by a
  concurrently-running agent (or, if overlap is unavoidable, use worktree
  isolation).
- Exploration/survey subagents default to Sonnet (or Haiku for pure grep
  sweeps) — never the lead model.
- **External agents (Codex etc.)** work on branches and open PRs; CI must be
  green before merge, and the lead reviews against these house rules. Never
  push directly to master from an external lane. Best suited to isolated,
  spec-complete batch work (new enemies, events, card sets).

Standing backlog lives in **TODO.md** — check it when looking for the next
piece of work; delete items you complete.

## Known sharp edges

- Phaser's loader stalls in hidden browser tabs; `LoaderWatchdog` works around
  it — keep it installed in every scene's `preload`.
- `index.html` loads a single bundled script; Phaser and the rex plugins ship
  inside `dist/bundle.js` (no CDN dependencies, no `window.Phaser` reliance).
  `npm run build:prod` produces the 2.9MB production bundle the deploy uses;
  dev builds are ~14MB.
- Combat itself (ActionManager, action queue) is scene-bound and cannot run
  headless yet; verify combat behavior in the browser.
