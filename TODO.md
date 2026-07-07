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
- **Deck cap (leveling residual)** — (corrected July 2026: the old entry
  claimed XP/rank didn't exist; soldier leveling shipped in save v5 —
  xp/level on PlayerCharacter, LEVEL_CAP 10, perks at levels 4/8,
  PromotionPanel. See src/campaign/Leveling.ts.) The one unbuilt piece of
  the design-doc commitment is the deck cap: nothing limits deck bloat, so
  veterans accumulate unbounded cards. Needs a small design call (cap curve
  by level + behavior at cap: block card grants vs force a removal choice),
  then mechanical plumbing.

## Gameplay & design

- **Trade-run balance + spice pass** — v1 shipped (July 2026, save v8) per
  `src/docs/trade_run_design.md`: freight stepper, cargo dead-draws, base +
  £30×act/crate. Launch numbers are sketches (full load ≈ 2× a combat
  contract for 12 dead cards across 3 decks) — revisit after play. The
  spec's deferred spice (breakage/theft events targeting cargo, in-combat
  cargo effects like explosive crates) is good follow-on once the base
  mechanic proves fun.
- **Healing throughput as a purchasable lever** — the July 2026 balance
  pass (payouts +5%/year, decaying dividend escalation, wages £25) made the
  charter winnable (~56-72% at 0.9 win rate, ratcheted in
  CampaignSimulator.test.ts) and narrowed but did not close the hoarding
  edge: lean roster-5 reaches parity with roster-8 in only ~40% of seed
  pairs because wound attrition throughput-starves small rosters — a
  structural effect flat wages can't price. The design doc's
  Infirmary/chapel row ("rush wound healing, converts £ into time") is the
  missing lever: implement rush-healing purchases, then re-tune the T2
  ratchet toward true roster parity. The sim needs a matching knob
  (healing spend policy) to model it.
- **Human playtest of the economy tuning** — payouts/dividends were calibrated
  against a lossless simulation (see commit history: +1wk sortie overhead,
  £120 dividend base). The sim validates the shape, not the fun. Someone has
  to actually play a few years and report.
- **Populate the client retainer registry** — the full client-unlocked-order
  MECHANISM shipped July 2026 (save v9: per-client completion tracking,
  threshold 3, locked greyed rows, `CLIENT_RETAINER_ORDER_IDS` in
  CampaignUiState) but the registry is deliberately EMPTY: which of the 12
  real clients unlocks which retainer order is canon the design amendment
  never wrote (its one example names a nonexistent client). Fold into the
  faction-reputation design session, then it's a data-table fill plus one
  order class per client.
- **Standing Orders balance pass** — the launch numbers (payout +20%,
  wound +1w, recruit ×0.6, escalation ×0.75 …) are design-doc sketches,
  untested against the economy sim or human play. Revisit after a few
  played campaign-years.
- **Contract board hero slot** — art-director critique item: no visual entry
  point among equal-weight notices. Deferred; needs a "priority contract"
  concept.
- **Recruit pool save-scumming** — recruit candidates aren't serialized, so
  reloading rerolls them. Harmless now; fix by seeding their generation if it
  starts to matter.
- **Region hardening: shipped; residual gap** — (corrected July 2026: the
  old entry claimed no year scaling existed; `EncounterHardening.ts` ships
  +8% enemy HP/year and +1 Lethality per 3 years, applied in
  `SortieManager.launchNextCombat`.) Residual: narrative-event combats
  spawn enemies via a different path and are NOT hardened (known gap,
  commented in SortieManager), and the numbers are balance sketches
  untested against play.
- **VP sources for the endgame pivot** — final score = VP + vault, but VP
  only comes from Lethe Extraction and per-project trickle. The intended
  endgame decision ("when do I stop building and start scoring") barely
  exists. More VP sinks: VP-per-£ conversion late-campaign, VP contracts,
  the deferred Levi-Maxwell capstone.
- **Faction reputation + intelligence services** — both deferred in the
  design doc but queued by shipped systems: the retrofit table wants
  embassies (Revolutionary Contacts), client-unlocked Standing Orders want
  per-client tracking, and the cut Actuarial Review order wants enemy-comp
  scouting. Probably one design session covering "who remembers what you
  did for them."

## Content breadth

- **Regions 4+** — worldbuilding.md already describes the Brimstone
  Badlands, Screaming Forests, Clockwork Wastes, and Abyssal Frontier;
  none are in the game (3 acts only). Each new region = contract templates
  + encounter tables + enemies. Also the natural fix for late-campaign
  variety alongside region hardening. Good Codex-lane batch work once the
  enemy-design spec exists.
- **Event pool: 23 shipped (July 2026); browser render pass pending** — the
  16 new events were verified statically but not rendered live. QA is now
  cheap: in any combat, use the debug menu's `showRandomEvent` or console
  `showEventByName(name)` / `listEventNames()`. Next combat session, page
  through the new ones and eyeball text fit/BBCode rendering.
- **Act 2/3 enemy roster depth** — act 1 has ~21 enemies, act 2 ~13,
  act 3 ~11; later acts repeat encounters sooner. (Separate from the
  flavor-text item above — this is new enemies, not better descriptions.)
- **Cog class identity** — one of four classes has placeholder lore and the
  thinnest mechanical identity (Manufactured cards). Either invest (design
  pass + cards) or consider whether four classes is right at all.

## Flavor (from the July 2026 flavor audit)

- **Player-side flavor lines** — cards, cargo, relics, buffs are
  mechanics-only text. Add a one-line flavor field where it pays most:
  cargo first (opium/spicy literature jokes going unused), then relics.
- **Defeat framing + reward-screen decision** — victory framing shipped
  (July 2026: GeneralRewardScreen title + CLAIM & CONTINUE), BUT that screen
  is currently dead code: `SortieManager.getRewardsForCurrentCombat()` is
  hardcoded to `[]` since promotions superseded per-combat card rewards, so
  the framing never renders in normal play. Decide: revive the reward screen
  for something (consumable drops? £ spoils line?) or delete it. Separately,
  a squad wipe still shows no combat-side acknowledgment before the debrief —
  a small defeat overlay ("The Company regrets...") is the missing piece.

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
  mostly mechanical. Prereq cleanups worth doing sooner: rules code reaching
  into `card.physicalCard` (ActionManager ~line 663, 740) and AbstractIntent
  querying scene texture cache on construction.

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
