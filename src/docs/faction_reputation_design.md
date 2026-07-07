# Faction Reputation & Client Retainers (design, July 2026)

Lead-authored under owner-delegated authority. Answers "who remembers what
you did for them" with the smallest true system: **reputation IS the
per-client completion count** that already ships (save v10:
`CampaignUiState.contractsCompletedByClient`). No new persistent state in
v1. This doc is the implementation standard for filling the (deliberately
empty) `CLIENT_RETAINER_ORDER_IDS` registry.

## Reputation tiers (derived, per exact client string)

| Completions | Tier | Effect |
|---|---|---|
| 0-2 | Associate | none |
| 3+  | Preferred Contractor | that client's **retainer order** unlocks (shipped mechanism, threshold 3) |
| 6+  | Chartered Partner | that client's contracts generate with **+10% payout** (generator sees the client at creation; apply after all other payout passes, re-round to £5) |

The Barracks/board never needs a "reputation screen" in v1 — the locked
retainer rows (already shipped) plus a "Chartered Partner" tag line on the
contract notice are the whole surface.

## Retainer canon (fills CLIENT_RETAINER_ORDER_IDS)

Client strings must match ContractGenerator byte-for-byte. Effects reuse
existing StandingOrder hook shapes where possible; the two NEW hooks are
marked and specified below.

| Client (exact string) | Order id | Effect |
|---|---|---|
| "The Styx Dam Project Office" | `civil-works-schedule` | +1 week to all contract deadlines (existing deadline hook) |
| "Infernal Marine & Postal Underwriters, Ltd." | `underwriting-retainer` | **NEW HOOK (wipe insurance):** on a squad-wipe contract failure, the Company recovers 50% of that contract's payout (rounded to £5) |
| "Styx Delta Ferry & Lighterage Company" | `preferred-lading-rates` | **NEW HOOK (freight):** trade-run freightRatePerCrate +£10 at generation |
| "Maison Vachon, Purveyors to the Front" | `officers-mess-account` | −1 week on new wounds (existing wound-weeks hook direction, floor 1) |
| "Brimstone Barons Equipment Leasing Consortium" | `plant-and-equipment-lease` | recruit cost ×0.75 (existing recruiting hook shape) |
| "Continental Casualty & Ossuary Underwriters" | `ossuary-death-benefit` | **NEW HOOK (death benefit):** £40 to the vault per Company soldier death (they underwrite casualties; the Company is the beneficiary. Dry horror is the register — the board minutes line should read like a payout notice.) |

Deferred to v2 (do NOT stub): retainers for the British Trade Delegation
offices, Reichsinfernokorps, Deep France Concession Holdings, Dis Board of
Overseers, The Brimstone Barons jointly; embassies/Revolutionary Contacts;
recruitment gating by reputation ("faction rep gates the good ones");
intelligence products (Actuarial Review / de Veer charts) — those want the
enemy-comp preview UI first.

## New-hook specs

- **Wipe insurance**: seam = `SortieManager.handleSquadWipe` (it already
  writes the failure report). StandingOrdersState gets
  `wipeInsurancePayout(contractPayout: number): number` returning 0 unless
  the order is active. Board/debrief line in the Company register.
- **Freight bump**: seam = ContractGenerator trade-run construction, same
  pattern as its existing StandingOrdersState payout/deadline consultations.
- **Death benefit**: seam = wherever casualties are applied on sortie
  resolution (`applyCasualties` / SortieManager) — count deaths, credit
  vault, debrief line ("Casualty benefit remitted: £40. The Company thanks
  the deceased for their custom.").

All three hooks follow the existing consult-StandingOrdersState pattern —
no new architecture. House rules: campaign layer stays Phaser-free; £ and
BBCode; registries over special cases (tier logic lives in ONE place, e.g.
a small ClientReputation module in src/campaign/, consumed by generator +
UI).

## Balance sketch (convention: EncounterHardening.ts:12-14)

Numbers above are launch sketches. The economy sim cannot see client
choice (policies pick by payout), so retainer effects ride existing sim
hooks where they exist and are otherwise playtest material. The Chartered
Partner +10% compounds with year scaling (+5%/yr) — acceptable; it rewards
specializing in a client, which concentrates contract-type exposure.

## Verification bar (implementing agent)

typecheck + tests (registry names resolve against ContractGenerator's real
client strings — lint-style test; tier math unit tests; round-trip
untouched since no save change) + build + smoke; browser: force
contractsCompletedByClient to 3 and 6 via console, verify unlock row and
the +10% generation tag.
