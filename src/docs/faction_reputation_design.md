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

## Amendment: Faction Relationships v2 (July 2026)

Lead-authored under owner-delegated authority. v1 above answers "which
clients remember you"; v2 answers "whose side does that put you on." Same
philosophy: the smallest true system, and **standing stays derived — no
new save state, no SAVE_FORMAT_VERSION bump.**

### Factions and the client map

Every generator client string except the Court of Directors (internal, as
ever) belongs to exactly one faction. The mapping is a single registry —
`src/campaign/Factions.ts` (house rule 6: the ONE place it lives;
generator and UI both consult it).

| Faction | Clients |
|---|---|
| The British Crown | The Styx Dam Project Office; British Trade Delegation, Delta & Continental Offices |
| The Styxian Boatmen's Guild | Styx Delta Ferry & Lighterage Company |
| The Reichsinfernokorps | Liaison Office; **Deep France Concession Holdings** (ruling: the commercial face of the German concession system — its contracts fight the Emperor's revenant auditors, and the Liaison Office "would rather not admit the concession exists") |
| The Empire Undying | Maison Vachon, Purveyors to the Front (purveyor to the French lines; its rivals' quartermasters are the ones requisitioning its carts) |
| The Brimstone Barons | Equipment Leasing Consortium; The Brimstone Barons, jointly |
| The Dis Board of Overseers | Dis Foundry Belt Board of Overseers |
| The Underwriters' Pool | Infernal Marine & Postal; Continental Casualty & Ossuary (insurers profit from everyone's disasters and hold no grudges — the deliberately always-open fallback) |
| The Iron Choir | The Iron Choir, per its Concordat |
| The Dis Stokers' Union | none — and never. Labor does not commission mercenaries; the Union exists in this system only to be offended (retaliation texture is v2.1 shelf material) |
| The Basalt Courts / The Cloggers | declared in the registry, no clients yet — content hooks for aristocratic-favor contracts and Dutch vendor stock (future acts) |

### Rivalries (static — the act conflicts, plus labor)

- British Crown ↔ Boatmen's Guild (Act 1)
- Empire Undying ↔ Reichsinfernokorps (Act 2)
- Brimstone Barons ↔ Stokers' Union; Dis Overseers ↔ Stokers' Union
  (Act 3 — management is a side, and it has two faces)

No live faction-to-faction dynamics. **Rejected, not deferred**: the acts
encode the conflicts statically; a war ticker is a lot of state for
ambience. Liveliness, if wanted later, is board-minutes flavor keyed to
the Company's own standing.

### Standing (derived)

`standing(F) = completions for F's clients − completions for F's rivals'
clients`, computed entirely from the shipped
`contractsCompletedByClient`. Properties worth knowing:

- The two sides of a conflict mirror each other; you can never be
  blacklisted by both sides of the same rivalry.
- Factions whose rivals have no clients (Barons, Overseers, insurers,
  Choir) can never go negative. The Union is the only faction whose
  standing only falls.
- With current client tables, no region's template pool can be emptied by
  blacklists (every pool holds a never-negative client). The generator
  still guards the case — see ladder below — for future content.

### Hostility ladder

| Standing | Tier | Effect |
|---|---|---|
| ≥ −2 | Cordial | none |
| ≤ −3 | Noted | flavor only: the notice's Offends line gains "(relations strained)" |
| ≤ −6 | Blacklisted | that faction's clients stop generating — bounty and trade template pools filter at pick. If a filter would empty a pool, the generator quietly ignores the blacklist for that pick: commerce forgives necessity. |
| ≤ −9 | Hostile | **deferred to v2.1, do NOT stub** (no enum member, no threshold constant) |

Blacklisting is deliberately irreversible in v2: their clients gone means
no completions path back. Détente mechanisms are shelf material (below).

### The notice line (the whole UI surface)

Every non-prestige contract notice gains one derived register line:
"Pleases: X." plus "Offends: Y." when X has rivals (Act 3 thus tags both
Baron and Overseer work as offending the Union — correct). Rendered
alongside the existing CHARTERED PARTNER tag (ContractBoardPanel), derived
at render time from the registry. Same surface philosophy as v1: no
reputation screen; the board tags ARE the system.

### Deferred to v2.1 shelf (do NOT stub)

- **Hostile-tier teeth**: faction reinforcements via EncounterHardening,
  trade-run tolls, one assassination-attempt event. *(Partially shipped —
  see the v2.1 amendment below; reinforcements and the event remain.)*
- **Union retaliation texture**: recruit-cost bumps, wound-week
  stretches, a strike event freezing a Standing Order slot; détente via a
  donation to the Widows' and Orphans' Fund (£ for standing — the one
  purchasable relationship, priced to sting). *(Shipped except détente
  and the narrative events — see the v2.1 amendment below.)*
- **Positive faction tiers**: recruit gating ("faction rep gates the good
  ones"), embassies as commitment devices (Strategic Projects family),
  Basalt Court favor-denominated contracts, Clogger vendor stock.
- **Dual-sided contracts**: the same incident offered by both sides of a
  rivalry; taking either removes both.

## Amendment: Union Retaliation (v2.1, July 2026)

Lead-authored under owner-delegated authority. The Union is the one
faction blacklisting cannot touch — it has no clients, so its standing
only falls, and its weapon is labor, not custom. Retaliation is therefore
**derived pressure, not events**: a pure module
(`src/campaign/FactionPressures.ts`, sibling of Factions.ts) computes
penalties from Union standing at consult time. Still zero stored state,
still no save bump. Penalties self-lift if standing ever recovers (it
can't today; détente stays shelved precisely because it needs stored
state and a SAVE_FORMAT_VERSION bump — lead work).

**Ruling: the Hostile tier now exists** (≤ −9, `FactionHostilityTier`),
superseding v2's "do NOT stub" note above — v2.1 is the substance it was
waiting for. Blacklisting semantics for client factions are unchanged.

### The pressure table (Union standing, balance sketches per convention)

| Tier | Register | Effect |
|---|---|---|
| Noted (≤ −3) | grievance, not injury | none beyond v2's "(relations strained)" tag |
| Blacklisted (≤ −6) | "Union rates" | recruit cost ×1.25; therapy cost ×1.25 (each re-rounded to £5); new wounds +1 week. The stretcher-bearers, porters, and orderlies are all union men, and they have been told about you. |
| Hostile (≤ −9) | "the labor question" | one Standing Order slot suspended (floor 1 — the Company always keeps one order running); Dis Foundry Belt trade-run freight −£10/crate at generation (floor £5/crate — crates get "mishandled") |

### Seams (all AFTER the StandingOrdersState pass, like Chartered Partner)

- Recruit/therapy: `CampaignUiState` cost getters.
- Wounds: `applyCasualties` (SortieResolution) gains an optional
  completions-map param, threaded from SortieManager's resolution.
- Slots: `slotsForYear`/`enact` gain an optional `unionSlotPenalty`
  param (default 0). InvestmentPanel passes it; **the save-restore
  re-enactment path (CampaignSerializer) deliberately does not** —
  restoring prior state must never fail on pressure. Over-quota active
  orders persist; only NEW enactments are blocked while over quota.
- Freight: ContractGenerator's trade-run construction, keyed to
  `UNION_TERRITORY_REGION` ("Dis Foundry Belt" — a registry constant,
  not an inline string).

### Surfaces

Costs simply change; the notice line remains the primary teaching
surface. One annotation: the Standing Orders panel notes the suspended
slot ("one slot suspended pending resolution of the labor question")
while Hostile. Narrative announcements (strike declaration, assassination
attempt) stay shelved with the events batch.

### Balance note

The sim passes an empty completions map, so all pressure is sim-invisible
(same construction as blacklisting). Union standing falls via Baron and
Overseer work only — reachable from year 1 through the act-1 opium trade
run, but −9 in practice means sustained Act 3 management work, i.e.
deliberate specialization. Counterplay: the Underwriters' neutral lane in
the Foundry Belt, pacing Baron exposure, or (future) paying the Fund.

### Balance note (convention: EncounterHardening.ts:12-14)

The economy sim calls `refillBoard` WITHOUT `contractsCompletedByClient`
(CampaignSimulator.ts:388,442), so blacklisting is invisible to the sim
and the ratchets — by construction, not by luck. Thresholds (−3/−6) are
launch sketches; reaching −6 requires six net completions against a
faction, i.e. deliberate specialization, which is the intent.

### Verification bar (implementing agent)

Lint test: every generator client string (bounty + trade, via the
existing getAll*Templates hooks) maps to a faction, Court of Directors
excluded, rivalry pairs symmetric-by-construction and reference declared
factions. Unit tests: standing math (incl. the Union two-rival case and
the mirror property), tier thresholds. Generator tests: seeded — a
blacklisted faction's clients never emitted; empty-pool fallback via the
exposed filter helper. Typecheck + full vitest + build + smoke; browser:
contrive contractsCompletedByClient via console, verify the
Pleases/Offends line, the "(relations strained)" annotation, and a
blacklisted board.
