# Backlog

Standing work items for future sessions/agents, written to be actionable
cold — read CLAUDE.md first for house rules, commands, and the delegation
protocol. Delete items when done. Design docs under `src/docs/` are canon;
July 2026 rulings were made under owner-delegated authority and are
recorded in the relevant docs, entries below, and commit messages.

## THE GATE: human playtest (instrumented — start here)

The July 2026 rebuild shipped everything buildable without human play; the
game records every decision to a playtest journal (console:
`playtestJournal.download()` / `.summary()`). **One played campaign
produces the dataset that unblocks most of this file.** When the owner
plays: get the journal file, then run a balance cycle against it covering —
economy feel, standing-order numbers, trade-run fun at the nerfed rates,
hardening numbers, Cog power, client specialization, roster equilibrium,
negative-Lethality repricing, reward-screen revival, hero-slot judgment,
and the Regions 5+ go/no-go.

Also user-gated: **pushing** (66+ local commits; first push runs the
smoke-gated CI and deploys the compressed site to gh-pages).

## Path to banger (July 2026 full-state audit)

Assessment ruling: the loop is complete end-to-end and strongly voiced;
what stands between "complete" and "banger" is (A) the first hour, (B) the
sensory floor, (C) the difficulty curve, (D) late-act content depth. A/B/E
items are pre-playtest-safe (they touch no gated balance numbers); C/D
items note their gates individually.

### A. First hour — a new player must hook inside 30 minutes

- **Title screen + main menu scene** — the game boots straight into
  `HqScene` (scene list in `CombatAndMapScene.ts`; only two scenes exist).
  Add a menu scene: Continue / New Charter (confirm-over-existing-save) /
  Settings. Gives save-delete a proper home; `OnboardingLetter` plays
  after New Charter instead of on raw boot.
- **Settings surface** — mute (a `SoundUtils` localStorage flag) is the
  only option in the game. Settings panel reachable from HQ and combat:
  master/SFX/music volume sliders, mute. Persist in localStorage, never
  in the save.
- **Mechanics glossary + resource tooltips** — stress, Ashes, the five
  combat resources, Lethality, dividend/satisfaction, and Standing Orders
  have zero in-game explanation. Wire `TooltipAttachment` onto
  `CombatResourceDisplay` and the ledger/board-meeting numbers; add a
  registry-driven "Company Handbook" HQ panel (BBCode pages, Cavendish's
  voice) covering the ~10 core mechanics.
- **Scripted first sortie** — onboarding today is one non-interactive
  letter. Script the first contract of a fresh charter: staged, skippable
  hint callouts (energy, drag-to-target, enemy intents, block, stress)
  driven by combat state. Never serialized — HQ-only saves make the
  mid-tutorial-quit case free.

### B. Sensory floor — a deckbuilder with no music reads as a demo

- **Music system** — there is NO music, anywhere. MusicManager (per-scene
  track selection, crossfade, its own volume bus): an HQ theme, one combat
  theme per region (4), board-meeting/defeat/victory stings. CC0 sourcing
  is the standing ruling; Victorian-industrial register. Absorbs the old
  "per-region ambient loops" audio residual.
- **Combat SFX + damage numbers** — five generic SFX exist in
  `SoundUtils.ts`. Add per-category card sounds (attack/skill/power/
  curse), enemy hit + death, £-payout and promotion stings; a distinct
  scaling damage-number popup (damage currently reuses the generic
  word-float in `AnimationPrimitives.floatingText`); upgrade the default
  enemy death from fade to a dissolve/collapse built from existing
  primitives.

### C. Difficulty curve & replay (sim-informed; final numbers play-gated)

- **Act-curve smoothing sweep** — measured greedy win rates run
  97.5 / 85 / 77.5 / 55 by act (`combat-rates.fixture.json`): act 1 is a
  near-freebie and act 4 a coinflip — a cliff, not a ramp. Iterate with
  `measure-combat-rates` toward a monotonic ~88/78/68/58 greedy curve,
  then re-derive the economy ratchets per-act instead of the flat 0.9
  `sortieWinRate` assumption in `CampaignSimulator.test.ts` (T1 currently
  tolerates up to 100% charter survival — late-game tension rests
  entirely on score). Coarse smoothing may precede the playtest; final
  tuning is playtest-era.
- **Charter Terms (difficulty selector / NG+)** — no difficulty,
  ascension, or NG+ mechanism exists. After the first played campaign:
  an XCOM-style "charter terms" ladder chosen at New Charter (harsher
  dividend escalation, faster region hardening, pricier wages — all
  existing named constants in `CampaignCalendar`/`EncounterHardening`/
  `ContractGenerator`). Design doc first; implementation is cheap against
  those knobs.

### D. Content depth — the late acts thin out exactly when stakes peak

- **Blackhand parity batch** — 15 cards vs 21/22/17 for Archon/Cog/
  Diabolist. +6 cards (2 per rarity) via the proven class-identity
  dispatch template (see the Cog Manufactory commits).
- **Act 3/4 enemy depth** — act 3 has 11 regulars (fewest), act 4 has 10
  regulars and a SINGLE boss (`TheNinthBell`) vs 2–4 bosses elsewhere.
  +4–6 act-3 regulars, +4 act-4 regulars, +1 act-4 boss; qa-spawn each
  batch per definition of done.
- **Intelligence family is entirely unshipped** — of the six Standing
  Order families, family 4 has zero representation: no Actuarial Review
  order in `LaunchOrders.ts`, no De Veer project, no enemy-comp preview
  anywhere. Minimal slice: an Actuarial Review Standing Order + a
  pre-dispatch enemy-composition preview on the contract board. Also
  unblocks the faction-rep-v2 "intelligence products" item below.
- **Perk pool slack** — every class has exactly 4 perks, the design-doc
  minimum: a level-8 soldier draws their second perk from 3 and pools
  never surprise. +2–3 perks per class (flavor lines with them — perks
  are currently 0/16 flavored, see the flavor batch item).
- **PROCUREMENT contracts** — enum stub in `Contract.ts`, never emitted by
  `ContractGenerator`. Payout in cards/equipment/consumables instead of £
  — the fourth mechanically distinct contract shape. Hold for playtest
  contact if contract variety already feels sufficient in play.

### E. Craft polish (small, ungated)

- **Deck viewer is programmer-art** — `src/ui/Menu.ts` renders a deck as
  raw `JSON.stringify` in a text box. Replace with the card-grid
  treatment the promotion flow already uses.
- **RelicsLibrary duplicate** — `new SonorousKlaxon()` appears twice in
  `cursedCargoRelics` (RelicsLibrary.ts lines 59/68), silently doubling
  its draw weight.

## Awaiting play (rulings recorded; do not churn without data)

- **Standing Orders numbers** — launch sketches (payout +20%, wound +1w,
  recruit ×0.6…), untested against play.
- **Trade-run spice** — balance closed by data (freight £15×act, 5 crates;
  see trade_run_design.md post-nerf section); breakage/theft events and
  in-combat cargo effects wait on the lane proving fun.
- **Roster equilibrium — RULED: accepted** — hoarding is no longer free
  (wages £25, idle bleed); lean play viable (~40% parity) with rush-healing
  agency; the structural wipe-risk gap is XCOM texture. Reluctant future
  lever if play disagrees: partial survival on squad wipe.
- **Negative-Lethality is cosmetic** — Lethality(-2) self-prunes without
  positive stacks; Stress-threshold "-2 Strength" and three older usages
  mostly no-op. Real stat-down buff vs repricing = playtest-era call.
- **Region hardening numbers** (+8% HP/yr, +1 Lethality/3yr) — sketches.
- **Reward screen: dormant by ruling** — defeat overlay shipped; the
  styled-but-unreachable GeneralRewardScreen stays as a free hook for
  per-combat drops. Delete only if it stays unused past September.
- **Contract-board hero slot** — the survey-map rework partially answers
  the critique; decide if a priority-pin treatment is still wanted.
- **Faction reputation v2** — six more client retainers, embassies,
  recruitment gating, intelligence products (wants an enemy-comp preview
  UI). Revisit after play shows whether players specialize
  (faction_reputation_design.md).
- **Relic economy residuals** — an HQ acquisition surface (shop) and
  selling; acquisition is sortie-only by v1 ruling
  (relic_equipment_design.md).

## Capital Works rebuild residuals

Batches A-C shipped July 2026 (spec + rulings: strategic_layer_redesign.md,
"Amendment: Capital Works Rebuild"; all nine new projects + hooks live,
save v16). Remaining:

- **Numbers are design-sketch tier** like everything else awaiting the
  playtest gate: Store £8/soldier, Gazette 20 VP, Legation ×1.4, Trunk +16,
  escrow 8w/4w/+25 — all named exported constants; retune against the
  played-campaign journal.
- **Death-path browser proof** — smoke can't produce casualties; escrow/
  probate/forfeit are covered by pure-module + serializer round-trip tests
  only. First real playtest death (or a scripted qa harness with forced
  casualties, if ever wanted) closes this.

## Content expansion (template proven, held for act-4 play contact)

- **Regions 5+** — Brimstone Badlands shipped as act 4; the pipeline
  (survey → lead spec → content dispatch → art batch) is repeatable for
  Screaming Forests / Clockwork Wastes / Abyssal Frontier. Decide unlock
  laddering first: a 5th tier stretches the 10-year charter — parallel
  year-7 unlocks may fit better than deeper tiers.
- **Flavor batches (pure writing)** — flavorText renders everywhere
  already; regular cards shipped July 2026. Remaining, per July audit:
  BUFFS (mechanics-only), perks 0/16, consumables 0/14, relics 24/45.
  Per-system batches; Cavendish register.
- **Unreachable boss/rare relics** — 10 fully-coded relic classes are
  imported by nothing (not `RelicsLibrary.ts`, not `SaveRegistries.ts`;
  grep-verified 2026-07-10): MarrowSpike, MachineEffigy, Nightshard,
  StovepipeHat, HemomancyTome, Shatterkiss, Boneflood, EchoHarvest,
  Slaughterbots, SentientSmoke — plus boss-pool relics nothing grants. Wire into
  content (act-4/5 rewards?); register in SaveRegistries the moment any
  becomes grantable (the lint test will name offenders) and give them
  flavor lines when they ship.

## Engineering residuals (small, ungated)

- **Enemy spawn QA stragglers** — Foundry Tick, Union Runner, Ironclad
  Picket registered but never randomly sampled across ~30 forced sorties;
  closes naturally with act-3 play or a qa-spawn target override.
- **Combat-restart race hardening** — `cleanupAndRestartCombat` re-queues
  while the old queue may still resolve; live via event combat-swaps.
  Wants a queue-drained gate. (The smoke harness tolerates the visible
  symptom; the teardown race itself is unaddressed.)
- **Headless-combat determinism** — rules code calls raw Math.random, so
  seeded runs aren't bit-reproducible. (The campaign sim had the same
  limit until 2026-07-08, fixed by threading an injectable rng through
  ContractGenerator — the same pattern applies here if reproducibility
  ever matters. The other two follow-ons — measured win-rates into the
  sim, smarter policies — shipped July 2026.)
- **Missing-art allowlist: 94 rows** — remaining rows are unreleased-
  content cards/portrait variants (art them when the content ships). Two
  deliberate holds: rename one side of the shared `"shield"` literal
  before arting either; delete rather than art any dead refs.
- **Manifest pruning** — ~50MB of the 77MB deploy is manifest-wired but
  unreleased content; prune the MANIFEST (not the deploy script) if size
  starts mattering.
- **DOM test environment: CLOSED NEGATIVE** — do not retry happy-dom/jsdom
  for Phaser imports (WebGLRenderer's `typeof WEBGL_DEBUG` bundler guard is
  unconditionally truthy under Node and alias-proof). Character round-trips
  stay browser-only; headless-combat covers the practical need.

## Cost optimization (verification & delegation)

- **Haiku lane: ADOPTED** — seven-for-seven on exact-template briefs
  (clamps, renames, guards, gate constants; ~40-60k tokens vs ~200k
  Sonnet). Route mechanical single-function+test work there; escalate on
  first bounce. Brief long-running scripts to run FOREGROUND with explicit
  timeouts (see the agent-failure-modes memory: background-and-wait stalls).
- **Codex lane A/B** — hand the next content batch to both Sonnet and
  Codex (branch+PR, green CI) with the same brief; compare bounce rates.
- **Brief hygiene** — ≤400-word reports + evidence; state assertions over
  screenshots; inline house rules in briefs (never "read CLAUDE.md first"
  for implementation agents — it triggers delegation loops).
