# Backlog

Standing work items for future sessions/agents. Each entry is written to be
actionable cold — read CLAUDE.md first for house rules and the delegation
protocol. Ordered within sections by priority. Delete items when done.

## Dangling systems (July 2026 gap audit — half-connected, silently broken today)

- **Relic equipment slots (design)** — (corrected July 2026: an earlier
  version of this entry claimed campaign relic persistence had shipped as
  `CampaignUiState.relicsOwned` / save v6 — it has not; relics exist only in
  run-scoped `GameState.relicsInventory` and are never serialized.) The
  design doc's idea — relics as assignable equipment, 2-3 slots per
  character, lost on death unless insured — NEEDS A DESIGN SESSION WITH THE
  OWNER; campaign-level relic persistence should ride that design, not
  precede it.

## Gameplay & design

- **Trade-run balance + spice pass** — v1 shipped (July 2026, save v8) per
  `src/docs/trade_run_design.md`: freight stepper, cargo dead-draws, base +
  £30×act/crate. Launch numbers are sketches (full load ≈ 2× a combat
  contract for 12 dead cards across 3 decks) — revisit after play. The
  spec's deferred spice (breakage/theft events targeting cargo, in-combat
  cargo effects like explosive crates) is good follow-on once the base
  mechanic proves fun.
- **Roster-economy equilibrium — RULED (July 2026, delegated): accepted as
  shipped** — rush treatment (£20/wound-week) shipped and browser-verified,
  but the sim proved it cannot close the lean-vs-hoard gap at any price:
  whole-squad wipes cost a lean roster proportionally more, structurally.
  Ruling: legitimate XCOM texture, not a bug — hoarding is no longer FREE
  (wages £25, idle bleed), lean play is viable (~40% parity) with real
  mid-quarter agency. Future lever ONLY if human play disagrees: partial
  survival on squad wipe (weakens the roster-pays-the-price stakes; take
  reluctantly).
- **Human playtest of the economy tuning** — payouts/dividends were calibrated
  against a lossless simulation (see commit history: +1wk sortie overhead,
  £120 dividend base). The sim validates the shape, not the fun. Someone has
  to actually play a few years and report.
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
- **VP endgame: v1 shipped (July 2026, save v11)** — Prestige Commissions
  (year 3+) and Charter Buyback (year 8+, 1.3:1) per
  `src/docs/vp_endgame_design.md`; sim-ratcheted (convert-late wins score
  52.5% of pairs with better survival). Residual: the Levi-Maxwell
  three-stage capstone stays spec'd-deferred until strategic projects
  support staged purchases; balance numbers are sketches pending play.
- **Faction reputation v2** — v1 shipped July 2026 per
  `src/docs/faction_reputation_design.md` (tiers from completion counts, six
  retainer orders, Chartered Partner +10%). Explicitly deferred there:
  retainers for the remaining six clients, embassies/Revolutionary
  Contacts, recruitment gating by reputation, and intelligence products
  (Actuarial Review / de Veer enemy-comp preview — wants a pre-dispatch
  scouting UI first). Revisit after human play shows whether players
  actually specialize in clients.

## Content breadth

- **Regions 4+** — worldbuilding.md already describes the Brimstone
  Badlands, Screaming Forests, Clockwork Wastes, and Abyssal Frontier;
  none are in the game (3 acts only). Each new region = contract templates
  + encounter tables + enemies. Also the natural fix for late-campaign
  variety alongside region hardening. Good Codex-lane batch work once the
  enemy-design spec exists.
- **Enemy spawn QA residual** — 7 of 10 new act 2/3 enemies runtime-verified
  via `scripts/qa-spawn.mjs` across ~30 error-free forced sorties; Foundry
  Tick, Union Runner, Ironclad Picket (all registered, idiom-identical to
  verified siblings) keep missing the random draws. Low risk; closes
  naturally next time anyone plays act 3, or add a target-encounter
  override to qa-spawn if it nags.
- **Cog class identity** — one of four classes has placeholder lore and the
  thinnest mechanical identity (Manufactured cards). Either invest (design
  pass + cards) or consider whether four classes is right at all.

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

- **Decide: jsdom/happy-dom vitest environment** — anything importing
  PlayerCharacter/PlayableCard transitively pulls Phaser, which throws under
  plain-Node vitest, so character/perk save round-trips can only be
  verified in the browser today (the leveling work hit this directly).
  Adding a DOM test environment would let DTO round-trip tests cover
  characters; it's a build-infra change with cross-cutting effects, so it
  wants a deliberate pass, not a drive-by.

- **Audio: sourcing DECIDED (July 2026, delegated authority) — CC0 packs** —
  use CC0 sources (Kenney UI/impact packs + one ambient loop per region from
  freesound CC0), no licensing risk, individually replaceable later.
  Implementation pass: download into resources/Sounds/, manifest entries,
  Phaser audio wiring for UI clicks, card play, damage, a board-meeting
  sting, and per-region ambience. Volume settings can wait; a mute toggle
  cannot.
- **Burn down the 145 missing-art references** — AssetManifestLint.test.ts
  (July 2026) found 145 imageName/portraitName references to texture keys
  that were never declared; every one silently renders placeholder art
  (the "hermit" bug class — e.g. HermitProphetOfTheDelta). All are pinned
  in the test's EXPECTED_MISSING_IMAGE_REFS allowlist, so the count can
  only shrink. Work through them with the generate-game-art skill (needs
  OPENAI_API_KEY), removing allowlist entries as art lands — good
  incremental batch work, prioritize enemies the player actually meets
  (act 1 first).
- **Deployment target + bundle hygiene** — no deploy pipeline exists;
  index.html loads two CDN Phaser builds plus the 13.7MB bundled one
  (known sharp edge), and resources/ is 170MB. Decide the distribution
  target (itch.io web build?), then: single Phaser instance, asset
  compression/pruning, and a build that doesn't ship the whole resources
  tree.

- **Combat-restart race hardening** — `cleanupAndRestartCombat`
  (CombatAndMapScene) recreates managers and re-queues actions while the old
  action queue may still be resolving, and `CombatUIManager.initialize()`'s
  obliterate-then-replace has no protection if teardown throws. This path is
  LIVE now (narrative events swap combats in). Wants a queue-drained gate.
- **Headless combat simulator** — full extraction plan exists (architecture
  review, July 2026): four seams — HeadlessActionManager (override animation/
  emit methods), IPlayPolicy interface (replaces the two UI-blocking card
  selection actions), stub CombatUiManager + CombatCardManager. ~35-40 files,
  mostly mechanical. PREREQS DONE (July 2026): rules/animation split in
  ActionManager (incidentally fixed a latent bug — dealDamage skipped all
  rules effects for targets without a physicalCard) and scene-optional
  intent texture checks. Ready for the main extraction whenever a session
  wants a big mechanical push; payoff is combat balance ratchets in the
  economy sim (real fights instead of win-rate scalars).

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
