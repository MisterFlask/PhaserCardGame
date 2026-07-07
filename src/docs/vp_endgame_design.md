# VP Endgame Pivot (design, July 2026)

Lead-authored under owner-delegated authority. Final score = Σ project VP +
vault (EndOfCampaignPanel), so £1 ≡ 1 VP and today the only real VP source
is Lethe Extraction's 100/quarter trickle — "when do I stop building and
start scoring" barely exists. This doc adds two v1 sources and specs the
deferred capstone. Core principle: **every VP source must beat holding the
cash, at the price of weakening dividend coverage** — scoring is a bet
against the doom clock.

## New campaign state (save bump required)

`CampaignUiState.charterVictoryPoints: number` (default 0, serialized) — VP
earned outside projects. Final score becomes projects VP +
charterVictoryPoints + vault. Shown as a line in the Ledger board minutes
whenever it changes, and on the EndOfCampaign minutes.

## v1 source 1 — Prestige Commissions (VP contracts)

- New `ContractType.PRESTIGE` appearing **year 3+**, ~1 per board refresh at
  most (rare — these are trophies, not a lane). Board notice styled as a
  commendation, client = "The Court of Directors" (a new internal client;
  exempt from retainer tracking — check `CLIENT_RETAINER_ORDER_IDS` isn't
  affected; completions may still count in contractsCompletedByClient
  harmlessly).
- Payout: **£0**. Instead `vpReward = 150 + 25×(year-3)` (rounded to 5).
  Difficulty/squad-size axes roll as normal (danger-pay multiplier applies
  to the VP figure). ContractDTO gains optional `vpReward` → SAVE BUMP.
- Grant in `resolveSortie` alongside payout (0 + VP), debrief line in the
  register ("The Court of Directors notes its satisfaction. It does not pay
  in anything so vulgar as money.").
- The tension: a sortie spent on prestige earns no £ while wages/dividends
  tick — exactly the intended pivot decision.

## v1 source 2 — Charter Buyback (late £→VP conversion)

- From **year 8** (final 8 quarters), the Investment panel offers RETIRE
  SHARES: convert £100 → **130 VP** per block, repeatable, irreversible.
  Money retired cannot cover dividends — converting too early gets you
  sacked; converting too late wastes the premium. UI: one row in the
  boardroom with a running total, disabled before year 8 with a dry note
  ("The Court does not entertain retirement of shares before the charter's
  eighth year.").
- 1.3:1 beats hoarding by exactly 30% — strong enough to force the
  decision, weak enough that solvency still dominates mid-game.

## Deferred (spec'd, do NOT build in v1)

**Levi-Maxwell Ascension Protocol** — three-stage Capital Work capstone
(stages gated one campaign year apart, ~£400 each) paying 2500 VP at
completion; the "build tall" identity pick. Wants the strategic-project UI
to support staged purchases first.

## Sim support (same dispatch)

CampaignSimulator: score = vault + charterVictoryPoints (+ project VP if
modeled); add a `convertLateToVP` policy flag (retire shares each quarter
from year 8 while vault > 2× next dividend expectation). Ratchet: at
winRate 0.9, convert-late final SCORE beats never-convert in the clear
majority of seed pairs with no survival-rate loss (measure, band it).
Prestige contracts: sim policies treat vpReward as payout×1.0 for selection
but bank it as VP — a `prestigePreference` knob is optional, not required.

## Balance sketch (convention: EncounterHardening.ts:12-14)

150+25×(year-3) VP vs avg year-scaled payout (~£116×1.05^(y-1)): prestige
runs slightly rich per sortie but pays zero £ — sketch numbers, sim + play
will move them.

## Verification bar

typecheck + tests (DTO round-trip for vpReward + charterVictoryPoints;
generator year-gate + frequency; buyback math incl. year gate; sim ratchet
non-flaky) + build + smoke + browser: force year to 3/8 via calendar,
verify a prestige notice renders and a buyback block converts with ledger
line; EndOfCampaign shows the three-component score.
