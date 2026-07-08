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

## Capital Works rebuild (designed July 2026 — implement now)

Full spec + rulings: `src/docs/strategic_layer_redesign.md`, "Amendment:
Capital Works Rebuild". Scraps all seven shipped Capital Works (keeps
Levi-Maxwell + Secretariat), replaces them with nine designed projects.
Three sequential Sonnet batches (shared files force the ordering):

1. **Batch A — pool swap + simple projects.** Delete the nine dead project
   files; add Pattern Room, Corrective Phrenology Wing, Cantonment Annexe
   (dynamic roster cap), Company Store (per-soldier quarterly income),
   Company Gazette (+20 VP per completed contract via a new
   `onContractCompleted` hook); rewrite StrategicProjectList; re-point the
   Barracks gate constants; bump SAVE_FORMAT_VERSION; fix lint tests.
2. **Batch B — contract-board projects.** Dis Legation (quarterly exclusive
   contract, flagged off the 5-slot refill count) + Grand Trunk Extension
   (+16 contracts credit into `maxActUnlocked`).
3. **Batch C — death infrastructure.** Probate & Effects Office (card
   archive + Barracks bequest) + Soul Collateral Office (escrow + Recovery
   contract). Witness rule, probate ordering, relic settlement per the
   amendment's Rulings. Save shape grows (archive, escrow); bump again.
4. **Art batch (after C):** six new projects launch on "" placeholders;
   generate portraits via the generate-game-art skill (relic-style simple
   iconography per the art-style memory).

## Content expansion (template proven, held for act-4 play contact)

- **Regions 5+** — Brimstone Badlands shipped as act 4; the pipeline
  (survey → lead spec → content dispatch → art batch) is repeatable for
  Screaming Forests / Clockwork Wastes / Abyssal Frontier. Decide unlock
  laddering first: a 5th tier stretches the 10-year charter — parallel
  year-7 unlocks may fit better than deeper tiers.
- **Card/buff flavor batch** — flavorText renders everywhere already;
  regular cards shipped July 2026, BUFFS remain mechanics-only. Pure
  writing, per-class batches.
- **Unreachable boss/rare relics** — ~15 exist in code but nothing grants
  them; wire into content (act-4/5 rewards?) and give them flavor lines
  when they ship.

## Engineering residuals (small, ungated)

- **Enemy spawn QA stragglers** — Foundry Tick, Union Runner, Ironclad
  Picket registered but never randomly sampled across ~30 forced sorties;
  closes naturally with act-3 play or a qa-spawn target override.
- **Combat-restart race hardening** — `cleanupAndRestartCombat` re-queues
  while the old queue may still resolve; live via event combat-swaps.
  Wants a queue-drained gate. (The smoke harness tolerates the visible
  symptom; the teardown race itself is unaddressed.)
- **Headless-combat determinism** — rules code calls raw Math.random, so
  seeded runs aren't bit-reproducible (same limit as the campaign sim).
  Only matters if reproducibility ever does. (The other two follow-ons —
  measured win-rates into the sim, smarter policies — shipped July 2026.)
- **Missing-art allowlist: 94 rows** — remaining rows are unreleased-
  content cards/portrait variants (art them when the content ships). Two
  deliberate holds: rename one side of the shared `"shield"` literal
  before arting either; delete rather than art any dead refs.
- **Manifest pruning** — ~50MB of the 77MB deploy is manifest-wired but
  unreleased content; prune the MANIFEST (not the deploy script) if size
  starts mattering.
- **Audio residuals** — per-region ambient loops (wants taste), volume
  settings, victory/promotion/wipe stings. CC0 sourcing is the ruling.
- **DOM test environment: CLOSED NEGATIVE** — do not retry happy-dom/jsdom
  for Phaser imports (WebGLRenderer's `typeof WEBGL_DEBUG` bundler guard is
  unconditionally truthy under Node and alias-proof). Character round-trips
  stay browser-only; headless-combat covers the practical need.
- **CampaignSimulator baseline flake watch** — the Monte Carlo baseline
  once flaked at its 89/90 threshold; widen one notch if it repeats.

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
