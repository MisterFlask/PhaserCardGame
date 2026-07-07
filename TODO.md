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

- **Trade-run contract type — design DONE, ready to implement** — the
  push-your-luck trading identity returns as a contract type: freight
  stepper at muster, cargo cards clog squad decks for the sortie, base +
  per-crate payout. Full implementation-ready spec (numbers, seams, house-
  rule notes, verification bar): `src/docs/trade_run_design.md` (July 2026,
  lead-authored under delegated authority). Good next dispatch; note it
  builds on the squad-size axis (trade runs roll squadSize 3-4 only).
- **Campaign autoplay economy harness** — extend the pure-test pattern into
  a campaign simulator: play N quarters headlessly with parameterized sortie
  win rate, wound distribution, and contract-selection policy; assert vault
  trajectory and dividend satisfaction stay viable across policies. Would
  catch dominant strategies mechanically (the wages gap sat unnoticed for
  weeks) and de-risk every balance pass that currently waits on a human
  playtest. Combat abstracts to win%/wounds; everything else (contracts,
  payouts, wages, dividends, healing) is already Phaser-free.
- **Human playtest of the economy tuning** — payouts/dividends were calibrated
  against a lossless simulation (see commit history: +1wk sortie overhead,
  £120 dividend base). The sim validates the shape, not the fun. Someone has
  to actually play a few years and report.
- **UX phase 2: propagate the design language** — `src/ui/UIStyle.ts` +
  the restyled ContractBoardPanel are the pattern; MainHubPanel (desk/ledger),
  BarracksPanel (personnel ledger), SortieReportPanel (typed field report),
  EndOfCampaignPanel (board minutes), InvestmentPanel still use old styling.
  Get owner reaction to the contract board's level of ornament first.
- **Standing Orders: v1 shipped (July 2026); remaining pieces** — the model,
  nine launch orders, save v4, ratification UI, and the dead-cargo-project
  pool pull are live (see `src/campaign/orders/`). Still open, per the
  design amendment in `src/docs/strategic_layer_redesign.md`:
  *Company Secretariat* capital work (buys `bonusSlots`), client-unlocked
  orders (fulfil N contracts for a client → their retainer order becomes
  available — needs per-client completion tracking), converting Abyssal
  Research Institute from a Capital Work to an order, and an in-place
  REPLACE flow in the UI (currently rescind + enact-next-quarter).
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
- **Contract squad-size axis** — the redesign doc's contract board lists
  squad size as a per-contract property; Contract has no such field and
  every sortie is exactly 3. A 2-soldier "small job" / 4-soldier "big push"
  axis multiplies roster pressure (the point of the XCOM layer) cheaply.
  Touches Contract model/DTO, board muster UI, and combat layout.
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
- **Event pool expansion** — 7 pooled events for a full 40-quarter campaign;
  repeats fast. The new dispatch format is short (≤90 words), so events are
  now cheap to write: target 20+, spread across regions (most current
  events are Styx-flavored). Spec-complete batch work; A/B the Codex lane
  on it (see cost-optimization section).
- **Act 2/3 enemy roster depth** — act 1 has ~21 enemies, act 2 ~13,
  act 3 ~11; later acts repeat encounters sooner. (Separate from the
  flavor-text item above — this is new enemies, not better descriptions.)
- **Cog class identity** — one of four classes has placeholder lore and the
  thinnest mechanical identity (Manufactured cards). Either invest (design
  pass + cards) or consider whether four classes is right at all.

## Flavor (from the July 2026 flavor audit)

- **Act 2/3 enemy flavor pass** — Act 1 enemies have first-person
  Cavendish-journal descriptions; Act 2/3 enemies and both later bosses have
  one-liners. Bring them up to Act 1's standard (now canonically Cavendish's
  survey notes — see worldbuilding.md narrator section).
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
- **Asset manifest lint** — boot 404s and mislabeled portraits are FIXED
  (July 2026 art pass; manifest diffs clean against disk). Remaining:
  promote `.claude/skills/generate-game-art/scripts/check-assets.js` into
  a vitest (same enforcement pattern as SaveRegistriesLint), extend it to
  walk portraitName/imageName references in content code (it currently
  only checks manifest-vs-disk, and FrenchBlindProphetess's "hermit" bug
  was a reference to a key that was never declared), and triage the 8
  pre-existing texture-key collisions it reports (duplicate filenames
  across categories; last-loaded silently wins).
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
