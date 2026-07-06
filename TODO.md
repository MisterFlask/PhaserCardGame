# Backlog

Standing work items for future sessions/agents. Each entry is written to be
actionable cold — read CLAUDE.md first for house rules and the delegation
protocol. Ordered within sections by priority. Delete items when done.

## Dangling systems (July 2026 gap audit — half-connected, silently broken today)

- **Relic ownership model post-pivot** — relics earned from events land on
  `GameState.relicsInventory`, which is never serialized (CampaignSave has no
  relics field), so they vanish on save/reload. The design doc says relics
  become assignable equipment (2-3 slots per character, lost on death unless
  insured) but that was deferred. Decide: (a) quick fix — persist a campaign
  relic pool on CampaignUiState + save DTO, effects apply squad-wide; or
  (b) build the equipment-slot system. NEEDS A DESIGN SESSION WITH THE OWNER
  for (b); (a) is safe to implement cold.
- **Consumable acquisition path** — bureaucratic consumables (permits,
  writs; `src/consumables/`, PhysicalConsumable UI, combat input handling)
  are implemented in combat but the only way to obtain one is the
  `debug:addTestConsumables` menu entry. The economy table in the design doc
  has a "Provisioning" row for this. Add an HQ purchase surface (Barracks or
  a Quartermaster section) + occasional contract/event rewards, and
  serialize the owned stock.
- **Character growth (XP/rank)** — the design doc commits to "XP → rank →
  +deck cap, occasional persona trait, stat bumps"; none of it exists (no
  xp/rank/deckCap anywhere in src/gamecharacters). Veterans currently differ
  from recruits only by accumulated cards, and nothing caps deck bloat.
  NEEDS OWNER SIGN-OFF on the rank curve; the plumbing (xp on
  PlayerCharacter, award on sortie resolution, save DTO) is mechanical.
- **New-campaign state reset audit** — "New Campaign" resets via page reload;
  verify every singleton that now carries campaign state (StandingOrdersState,
  relic inventory, consumables once persisted) is actually cleared when the
  save is wiped. Cheap: a unit test that CampaignSerializer round-trips a
  fresh state to defaults, plus a browser check of the button path.

## Gameplay & design

- **Trade-run contract type** — the game's original push-your-luck trading
  identity (cargo cards clogging the squad's deck for profit) is absent.
  `ContractType.TRADE_RUN` is stubbed in `src/campaign/Contract.ts`; cargo
  cards exist in `src/gamecharacters/cargo/`. NEEDS A DESIGN SESSION WITH THE
  OWNER FIRST (explicitly flagged) — do not implement from guesswork.
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
- **Region hardening over campaign years** — the design doc says "Hell
  escalates too (regions harden over time)" but combat difficulty scales
  only by act/segment; year-8 Styx Delta is identical to year-1 while the
  dividend clock triples. Without it, late campaigns are decided purely by
  economics. Options: enemy stat scaling by year, harder encounter tables
  unlocking per year, or year-scaled enemy count. Tune against the sortie
  win-rate the economy sim assumes.
- **Contract squad-size axis** — the redesign doc's contract board lists
  squad size as a per-contract property; Contract has no such field and
  every sortie is exactly 3. A 2-soldier "small job" / 4-soldier "big push"
  axis multiplies roster pressure (the point of the XCOM layer) cheaply.
  Touches Contract model/DTO, board muster UI, and combat layout.
- **Wages/upkeep** — the design doc's economy table includes wages ("keeps
  roster size honest; ongoing drain so hoarding has cost"). Nothing drains
  the vault passively, so a big roster is free and hoarding is strictly
  optimal. A per-soldier £/quarter charge at the board meeting (settled
  before the dividend) is the smallest version. Rebalance the dividend sim
  after.
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

- **Recruit name generator** — `src/gamecharacters/CharacterNameGenerator.ts`
  produces modern fantasy names (Luna, Blaze, Knox), no surnames. Replace
  with period British given names + surnames. Sharpest voice break in the
  game; cheap fix. (Also: `CharacterGenerator.generateRandomCharacter()`
  hardcodes `Gender.Female` for all recruits — fix in passing.)
- **Shipped placeholder/debug text sweep** — Cog class `longDescription =
  "INSERT DESCRIPTION HERE"` (CogClass.ts); enemy-summoned card named
  "Afpoiasdoif" (Artiste.ts); `debug:killAllEnemies` /
  `debug:addTestConsumables` / `Toggle Game Areas` in the player-facing
  combat pause menu (CombatUiManager.ts); "DEBUG: Reroll" on
  CardRewardScreen; "Commadore Snow" typo (TheFrostChancellor.ts); persona
  trait "Badass" needs a period name.
- **Company name canon** — three names in circulation: "The East Inferno
  Company" (MainHubPanel), "The Third Circle Company" (worldbuilding.md +
  ArchonClass), "East Infernal Company" (repo working title). NEEDS OWNER
  DECISION, then a sweep.
- **Act 2/3 enemy flavor pass** — Act 1 enemies have first-person
  Cavendish-journal descriptions; Act 2/3 enemies and both later bosses have
  one-liners. Bring them up to Act 1's standard (now canonically Cavendish's
  survey notes — see worldbuilding.md narrator section).
- **Onboarding letter** — no framing text exists for a new campaign; player
  boots into live HUD numbers. Approved shape: Cavendish's first letter to
  the incoming manager (introduces himself, the charter, the dividend
  clock). Also fits the EndOfCampaignPanel's register.
- **Player-side flavor lines** — cards, cargo, relics, buffs are
  mechanics-only text. Add a one-line flavor field where it pays most:
  cargo first (opium/spicy literature jokes going unused), then relics.
- **Combat resolution framing** — no victory/defeat acknowledgment text;
  reward screen closes with bare "Done". Cheap thematic wrappers.
- **Doc repair** — worldbuilding.md has no Deep France entry (an entire act
  exists only in code); faction reps reference dead mechanics ("commerce
  nodes", "future runs"); overall_game_concept.md describes the deleted
  caravan-run design and says 1880 vs worldbuilding's 1890. Fix so content
  agents have a true standard.

## Engineering

- **Decide: jsdom/happy-dom vitest environment** — anything importing
  PlayerCharacter/PlayableCard transitively pulls Phaser, which throws under
  plain-Node vitest, so character/perk save round-trips can only be
  verified in the browser today (the leveling work hit this directly).
  Adding a DOM test environment would let DTO round-trip tests cover
  characters; it's a build-infra change with cross-cutting effects, so it
  wants a deliberate pass, not a drive-by.

- **Audio: there is none** — no sound loading, no SFX, no music anywhere in
  src/. Even a minimal pass (UI clicks, card play, damage, one ambient loop
  per region, a board-meeting sting) transforms feel. Needs an asset
  sourcing decision (licensed pack vs. generated) before any code; Phaser's
  audio API is straightforward once assets exist.
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

- **CI headless-Chrome smoke job** — run `runSmokeTest()` in CI (the game
  already runs headless thanks to the background stepper) so green CI proves
  the loop and nobody re-drives it manually. `window.runSmokeTest()` now
  exists (src/utils/SmokeTest.ts); note it runs from "current campaign at
  HQ", so the CI job just loads the page fresh and calls it.
- **Try Haiku on the most mechanical briefs** (exact-template boilerplate,
  rename sweeps); measure bounce rate vs Sonnet before adopting.
- **Codex lane A/B** — hand the next content batch (enemies/events) to both
  the Sonnet lane and Codex (branch+PR, AGENTS.md, green CI) with the same
  brief; compare bounce rates and review load.
- **Brief hygiene** — cap agent report length (~400 words + evidence);
  prefer state assertions over screenshots; when screenshots are needed for
  visual judgment, capture at half resolution.
