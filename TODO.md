# Backlog

Standing work items for future sessions/agents. Each entry is written to be
actionable cold — read CLAUDE.md first for house rules and the delegation
protocol. Ordered within sections by priority. Delete items when done.

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
- **Standing Orders system** — approved July 2026; full design in
  `src/docs/strategic_layer_redesign.md` § "Amendment: Standing Orders".
  Projects split into permanent Capital Works and slot-limited, swappable
  Standing Orders (XCOM 2 resistance orders). Implementation shape is in the
  amendment. Includes pulling the five dead cargo projects from the
  purchasable pool (they currently sell no-op effects).
- **Contract board hero slot** — art-director critique item: no visual entry
  point among equal-weight notices. Deferred; needs a "priority contract"
  concept.
- **Recruit pool save-scumming** — recruit candidates aren't serialized, so
  reloading rerolls them. Harmless now; fix by seeding their generation if it
  starts to matter.

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

- **DrawCardsAction exceeds the 5s action timeout** under background-tab
  throttling (observed repeatedly via the new
  `window.getActionQueueErrors()`). Likely the per-card draw animation delays
  interacting with worker-driven stepping in hidden tabs; could also be a
  real perf issue. `src/utils/actions/specific/DrawCardsAction.ts`.
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
