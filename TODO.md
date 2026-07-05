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
- **Strategic project retrofits** — the design doc
  (`src/docs/strategic_layer_redesign.md`) specifies six project families
  (embassies, intelligence, board management...); most existing projects are
  income stubs, and "Our Man in Dis" carries an interim £35/quarter effect
  pending its real design (Dis embassy + free scouted contract).
- **Contract board hero slot** — art-director critique item: no visual entry
  point among equal-weight notices. Deferred; needs a "priority contract"
  concept.
- **Recruit pool save-scumming** — recruit candidates aren't serialized, so
  reloading rerolls them. Harmless now; fix by seeding their generation if it
  starts to matter.

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
