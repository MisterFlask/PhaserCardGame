# Trade-Run Contracts (design, July 2026)

Restores the game's original push-your-luck trading identity — cargo cards
clogging squad decks for profit — inside the shipped contract-board loop.
Owner delegated design authority; this doc is the implementation standard.
Design goal in one line: **at muster, the player chooses how much freight to
load; every crate pays, and every crate makes the fights harder.**

## Player-facing shape

- Trade-run notices appear on the contract board alongside combat contracts
  (`ContractType.TRADE_RUN`, already stubbed). Roughly **1 in 5 board slots**,
  min 1 per full board refresh so the axis is always available.
- A trade-run contract reads like a freight consignment: client, route,
  a LOW base payout, and a **freight rate per crate** ("£30 per crate
  delivered, carriage of up to 6").
- At muster, with a trade-run contract selected, the board panel shows a
  **freight stepper: 0..maxCrates**. Projected payout updates live:
  `base + crates × freightRate`. Squad requirements unchanged otherwise.
- Each crate loads **2 cargo cards** into the squad's combat decks for the
  sortie, distributed round-robin across soldiers. Cargo cards are
  **unplayable dead draws** — they clog hands and dilute decks; that is the
  entire cost mechanism. No breakage/theft mechanics in v1.
- Sortie succeeds → base + freight banked (SortieManager.resolveSortie, same
  seam as payout today). Squad wipe → contract fails, cargo lost with it
  (no new failure mode; the existing wipe path already forfeits payout).

## Mechanical spec

**Contract model** (`src/campaign/Contract.ts`, Phaser-free):
- `contractType` already exists; trade runs add `maxCrates: number` and
  `freightRatePerCrate: number` (0/absent on combat contracts).
- `cratesLoaded: number` — set at muster, 0 default. Serialized? NO —
  contracts on the board serialize (maxCrates/freightRate must go in
  ContractDTO), but `cratesLoaded` is chosen at dispatch and a sortie is
  never mid-flight in a save (saves are HQ-only), so cratesLoaded never
  needs to survive a reload. Keep it out of the DTO; document why.

**Generation** (`ContractGenerator`):
- ~20% of generated contracts are trade runs; dedicated flavor-template
  table (freight consignments: reagent barrels to Dis, opium for the
  Brimstone Barons, crates of spicy literature for the garrisons — the
  cargo jokes finally get used).
- Numbers (balance-sketch convention, named constants):
  - `basePayout = normal payout roll × 0.5`
  - `freightRatePerCrate = £30 × act`
  - `maxCrates = 6`
  - Full-load act-1 example: ~£58 + 6×£30 = **~£238** vs ~£116 average
    combat contract — roughly 2× money for 12 dead cards spread across
    three decks. That is the intended tension; expect a balance pass.
  - **Superseded by the "Numbers (post-nerf)" section below** — these were
    the original launch numbers, kept here for history.

### Numbers (post-nerf, economy balance pass, 2026-07-08)

Two independent signals agreed the numbers above were overpowered: the
campaign sim's `maxFreight` policy measured ~2.78x `greedyPayout`'s average
final vault (the canary in `CampaignSimulator.test.ts` had been widened to a
6x ceiling to accommodate this instead of acting on it), and a full-engine
longplay (commit 5a2c232) banked £15.5k by year 3 at satisfaction 100
running trade runs at full crates, with the doom clock never biting.

- `freightRatePerCrate = £15 × act` (was £30 × act).
- `maxCrates = 5` (was 6).
- `basePayout` fraction (0.5×) and the dead-draw cost mechanism (2 cargo
  cards/crate) are UNCHANGED — this pass only retunes price, not mechanism.
- Full-load act-1 example: ~£58 + 5×£15 = **~£133** vs ~£116 average combat
  contract — a modest edge for 10 dead cards spread across three decks.
- Measured post-nerf: `maxFreight` averages ~1.5x-1.9x `greedyPayout`'s final
  vault (roster 6, vault 500, 16 quarters, N=100 seeds, 20 repeated
  measurements, max observed 1.92x) — see `CampaignSimulator.test.ts`'s
  retightened canary (band: 1.2x-2.0x). £20/5-crates and £18/5-crates were
  both tried first and occasionally poked over the 2.0x ceiling at smaller
  sample sizes; £15/5 held with real margin at N=100.
- Trade runs never roll squadSize 2 (no hands to spare); 3 or 4 only.
  A 4-soldier big push dilutes cargo across more decks — that interaction
  is intentional and free.

**Cargo cards** (`src/gamecharacters/cargo/` already exists):
- v1 uses ONE mechanical body: unplayable, no effects, stays in the deck
  cycle (no exhaust). 2-3 cosmetic variants named per flavor table
  (region/client-appropriate), sharing the class.
- Sortie-scoped only: injected at dispatch, stripped at resolution AND at
  squad wipe. They can never persist on a roster deck, so **no
  SaveRegistries entry is needed** — but add a lint-test assertion or
  comment making that invariant explicit (house rule 4's enforcement
  pattern), because if someone later makes cargo persistent the save
  breaks silently.

**Dispatch/resolution seams** (`SortieManager`, mirrors the consumable
loadout transfer):
- `startSortie`: after squad transfer, inject `cratesLoaded × 2` cargo
  cards round-robin into the deployed soldiers' sortie decks (whatever
  structure combat draws from — verify: cards live on PlayerCharacter's
  master deck; injection must target the sortie copy, or inject+strip the
  master deck symmetrically if no sortie copy exists. STOP AND REPORT if
  decks have no sortie-scoped representation — stripping the master deck
  on every exit path must then be bulletproof, including squad wipe).
- `resolveSortie`: `payout = base + cratesLoaded × freightRatePerCrate`
  (keep the existing consumable-reward and report-line flow); strip cargo.
- `handleSquadWipe`: strip cargo (they died hauling it).

**Muster UI** (`ContractBoardPanel`):
- Freight stepper (+/− TextBoxButtons) visible only for TRADE_RUN with the
  notice's plain-line style; status strip shows projected payout and crate
  count. Launch gate unchanged.

**House-rule notes**: rule 1 — Contract/Generator stay Phaser-free (cargo
CARD classes are Phaser-tainted; the campaign layer references crate
COUNTS only; SortieManager resolves counts → cards the same way it can't
touch ConsumablesLibrary... verify SortieManager's import budget; if cargo
card construction pulls Phaser, use the pendingConsumableRewardName
pattern: record counts, let the combat/UI layer instantiate). Rule 6 — no
if-trade-run special cases sprinkled around; branch once on contractType
at the seams named here.

## Explicitly out of scope for v1

- Breakage/theft/interception events targeting cargo.
- Selling cargo anywhere other than contract completion (no markets).
- Cargo with in-combat effects (explosive crates etc.) — later spice.
- Per-soldier carry assignment UI — round-robin is invisible and fine.

## Verification bar (for the implementing agent)

typecheck + tests (round-trip for new ContractDTO fields; generator
distribution test; payout math test) + build + `npm run smoke` ×3 (harness
must handle trade-run contracts appearing as availableContracts[0] — muster
crates=maxCrates in the harness to exercise injection) + a browser muster
pass on the stepper at HQ.
