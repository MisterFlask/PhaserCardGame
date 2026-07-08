# Backlog

Standing work items for future sessions/agents. Each entry is written to be
actionable cold — read CLAUDE.md first for house rules and the delegation
protocol. Ordered within sections by priority. Delete items when done.

## Dangling systems (July 2026 gap audit — half-connected, silently broken today)

- **Relic equipment: v1 shipped (July 2026, save v12)** — armoury, 2 slots
  (+1 at level 6), £40 insurance, lost-with-the-body, per
  `src/docs/relic_equipment_design.md`. Residual: a relic SHOP/acquisition
  surface at HQ (acquisition is still sortie-only), selling relics, and the
  CampaignSimulator Monte Carlo baseline test flaked once at its 89/90
  threshold — if it flakes again, widen that band one notch.

## Gameplay & design

- **Trade-run spice pass** — the balance half closed July 2026 with the
  data-driven nerf (freight £15×act, 5 crates; sim + longplay agreed the
  launch numbers printed money — see trade_run_design.md's post-nerf
  section). Remaining: the spec's deferred spice (breakage/theft events
  targeting cargo, in-combat cargo effects) once human play confirms the
  lane is fun at the new rates.
- **Roster-economy equilibrium — RULED (July 2026, delegated): accepted as
  shipped** — rush treatment (£20/wound-week) shipped and browser-verified,
  but the sim proved it cannot close the lean-vs-hoard gap at any price:
  whole-squad wipes cost a lean roster proportionally more, structurally.
  Ruling: legitimate XCOM texture, not a bug — hoarding is no longer FREE
  (wages £25, idle bleed), lean play is viable (~40% parity) with real
  mid-quarter agency. Future lever ONLY if human play disagrees: partial
  survival on squad wipe (weakens the roster-pays-the-price stakes; take
  reluctantly).
- **Negative-Lethality idiom is cosmetic** — Lethality(-2) self-prunes to 0
  on characters without positive stacks (Lethality lacks canGoNegative), so
  the Stress-threshold "-2 Strength" and three older usages (BloomOfSorrow,
  HellDiseases) mostly no-op. Playtest-era design call: either a real
  stat-down buff or reprice those effects.
- **Human playtest — THE gate for everything below it (instrumented, July
  2026)** — the game now records every decision to a playtest journal
  (console: `playtestJournal.download()` / `.summary()`). One played
  campaign produces the dataset that unblocks: economy feel, standing-order
  balance, trade-run rates/spice, hardening numbers, Cog power, client
  specialization, roster equilibrium, negative-Lethality repricing,
  reward-screen revival, hero-slot judgment, and the Regions 5+ go/no-go.
  When the owner plays: ask for the journal file, then run a balance cycle
  against it.
- **Standing Orders balance pass** — the launch numbers (payout +20%,
  wound +1w, recruit ×0.6, escalation ×0.75 …) are design-doc sketches,
  untested against the economy sim or human play. Revisit after a few
  played campaign-years.
- **Contract board hero slot** — art-director critique item, originally "no
  visual entry point among equal-weight notices." The July 2026 survey-map
  rework (pins scattered by region, wax-seal difficulty) partially answers
  this; revisit whether a "priority contract" pin treatment (larger seal,
  ribbon) is still wanted.
- **Region hardening: fully shipped (July 2026)** — year scaling applies in
  both `SortieManager.launchNextCombat` and event-spawned combats
  (`DeadEndStartEncounterChoice.effect()`). Residual: the numbers (+8%
  HP/year, +1 Lethality/3yr) are balance sketches untested against human
  play; the sim models difficulty only as win rate, so this is playtest
  material.
- **VP endgame: COMPLETE (July 2026)** — Prestige Commissions, Charter
  Buyback, and the Levi-Maxwell three-stage capstone (save v13, staged
  Capital Works infrastructure now general) per
  `src/docs/vp_endgame_design.md`. All numbers are balance sketches
  pending play; the staged-projects capability is reusable for future
  multi-stage ventures.
- **Faction reputation v2** — v1 shipped July 2026 per
  `src/docs/faction_reputation_design.md` (tiers from completion counts, six
  retainer orders, Chartered Partner +10%). Explicitly deferred there:
  retainers for the remaining six clients, embassies/Revolutionary
  Contacts, recruitment gating by reputation, and intelligence products
  (Actuarial Review / de Veer enemy-comp preview — wants a pre-dispatch
  scouting UI first). Revisit after human play shows whether players
  actually specialize in clients.

## Content breadth

- **Regions 5+** — Brimstone Badlands shipped as act 4 (July 2026, spec:
  `src/docs/act4_brimstone_badlands_design.md` — the repeatable template
  for region expansions: survey → lead spec → content dispatch → art
  batch). Remaining from worldbuilding: Screaming Forests, Clockwork
  Wastes, Abyssal Frontier. Each wants the same pipeline; decide unlock
  laddering beyond year 7 first (a 5th act needs charter-length thought —
  maybe regions 5+ are parallel year-7 unlocks, not deeper tiers).
- **Enemy spawn QA residual** — 7 of 10 new act 2/3 enemies runtime-verified
  via `scripts/qa-spawn.mjs` across ~30 error-free forced sorties; Foundry
  Tick, Union Runner, Ironclad Picket (all registered, idiom-identical to
  verified siblings) keep missing the random draws. Low risk; closes
  naturally next time anyone plays act 3, or add a target-encounter
  override to qa-spawn if it nags.
- **Cog: the Manufactory shipped (July 2026)** — Rivet tokens + six
  manufacture cards + real lore per `src/docs/cog_class_design.md` (ruling:
  four classes stays). Residual: the six new cards reference no art keys
  yet (they'll ride the placeholder path — add them to a future art batch),
  and the class wants a balance look once human play reaches it.

## Flavor (from the July 2026 flavor audit)

- **Flavor lines: cargo + reachable relics shipped (July 2026)** — residual:
  regular player CARDS and buffs remain mechanics-only (flavorText renders
  already; it's pure writing, per-class batch work), and the ~15
  unreachable boss/rare relics get lines when they actually ship.
- **Reward screen: dormant by ruling (July 2026, delegated)** — defeat
  overlay shipped (SERVICES RENDERED IN FULL gate at squad wipe); the
  GeneralRewardScreen stays dormant-but-styled (getRewardsForCurrentCombat
  hardcoded []) as a free hook for future per-combat drops (consumables?
  £ spoils?). Delete it only if two more quarters pass with no use found.

## Engineering

- **Card-asset loader spam** — the longplay logs show a Diabolist card
  asset (`terror`) re-requesting via the loader on nearly every action for
  the whole campaign (~thousands of attempts; it loads fine, the spam is
  the bug). Find who calls the load path per-render instead of once
  (likely a dynamic loadImage in a card render/tooltip path) and cache it.
  Cosmetic + log-noise + minor perf; good Haiku-size task with a repro
  (any longplay run's log).

- **DOM test environment: CLOSED NEGATIVE (July 2026 spike)** — happy-dom
  cannot host Phaser under vitest: after stubbing canvas 2D, Phaser's
  WebGLRenderer hits `if (typeof WEBGL_DEBUG) require('phaser3spectorjs')`
  — webpack DefinePlugin dead-code syntax that is unconditionally truthy
  under raw Node (typeof an undeclared global is a non-empty string) and
  unfixable via vitest alias (node_modules requires bypass Vite). Do not
  retry without patching Phaser. Character round-trips stay browser-only;
  the real fix arrives with the headless combat simulator extraction
  (stubs at OUR layer, not Phaser's). happy-dom stays installed as a
  devDependency for non-Phaser DOM needs.

- **Audio: minimal pass shipped (July 2026)** — Kenney CC0 clicks/whoosh/
  thud/board-sting via SoundUtils registry, persisted mute toggle.
  Residual: per-region ambient loops (bigger files, wants taste), volume
  settings, and more event-specific stings (victory, promotion, wipe).
- **Missing-art allowlist: 94 rows left** — five batches shipped (all enemy
  portraits acts 1-4, twenty icons; prompts recorded in commits 06bb963 /
  37f58bb). Remaining rows are deeper content (cards, portraits variants)
  plus two deliberate holds: the `"shield"` literal is shared by a buff
  icon AND Defend's card portrait (rename one ref before arting either),
  and the node-map location-buff refs are dead code — delete the buffs
  instead of arting them.
- **Deploy pipeline: done (July 2026)** — referenced-only staging +
  sharp compression ships 77MB instead of 284MB (assemble-site.mjs,
  --compress in the CI deploy). Residual: ~50MB of the staged payload is
  manifest-wired-but-unreleased content (unshipped card sets, portrait
  variants) — pruning those from the MANIFEST (not the deploy script) is
  the next size lever if it matters.

- **Combat-restart race hardening** — `cleanupAndRestartCombat`
  (CombatAndMapScene) recreates managers and re-queues actions while the old
  action queue may still be resolving, and `CombatUIManager.initialize()`'s
  obliterate-then-replace has no protection if teardown throws. This path is
  LIVE now (narrative events swap combats in). Wants a queue-drained gate.
- **Headless combat: SHIPPED (July 2026)** — `window.runHeadlessCombat` +
  IPlayPolicy + `scripts/qa-headless-combat.mjs` run scene-free combats at
  ~85ms each (50-combat harness green). Follow-ons, in payoff order:
  (1) **wire real combat win-rates into the economy sim** — replace the
  campaign sim's win-rate scalar with measured headless outcomes per
  squad-comp/act (the whole point of the extraction); (2) smarter policies
  than randomLegal (greedy-damage, block-aware) so measured rates mean
  something; (3) determinism pass if reproducibility ever matters (rules
  code calls raw Math.random — same limit as the campaign sim).

## Cost optimization (verification & delegation)

- **Haiku lane for mechanical briefs — first trial passed** (July 2026: the
  consumable cap clamp ran on Haiku: correct first try, 0 bounces, ~32k
  tokens / 83s vs a typical Sonnet feature at ~220k). Keep routing
  exact-template briefs (boilerplate, rename sweeps, single-function+test)
  to Haiku and keep noting bounce rates; escalate to Sonnet on the first
  bounce.
- **Codex lane A/B** — hand the next content batch (enemies/events) to both
  the Sonnet lane and Codex (branch+PR, AGENTS.md, green CI) with the same
  brief; compare bounce rates and review load.
- **Brief hygiene** — cap agent report length (~400 words + evidence);
  prefer state assertions over screenshots; when screenshots are needed for
  visual judgment, capture at half resolution.
