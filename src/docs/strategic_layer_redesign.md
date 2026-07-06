# Strategic Layer Redesign: The Company Charter Model

**Status:** Approved direction (July 2026). Supersedes the Slay-the-Spire-style 15-floor
node map as the strategic layer. The tactical combat layer (party-of-3 deckbuilding,
combat resources, stress) is unchanged.

---

## Thesis

The game is a chartered trading company simulator wearing an XCOM roster-management
coat, with a deckbuilder as its tactical layer.

Money has two competing roles, and the tension between them **is** the strategic game:

1. **Money as score/survival** — the shareholders (XCOM's Council reskinned as a
   Victorian board of directors) expect a dividend every quarter, paid in pounds.
   Shareholder satisfaction at zero → the player is sacked → campaign over.
2. **Money as fuel** — every pound not paid out can be invested in soldiers, decks,
   equipment, facilities, and intelligence.

Every quarter the player chooses between surviving now and getting stronger. This
resolves the old design's problem where money was both the point of the game and
mechanically pointless.

---

## The Core Loop

```
HQ (week N)
 ├── Contract board: 3-6 posted contracts, each with deadline, region,
 │   difficulty, squad size, payout
 ├── Pick a contract, assign a squad of 3 from the roster
 ├── SORTIE: combat → (event) → combat → resolution   (no node map)
 │     · HP persists across combats within the sortie
 │     · card reward after each combat → lands permanently on a squad member
 ├── Payout: £ to vault, casualties/wounds/stress come home
 └── Time advances (contract duration in weeks) → new contracts post,
     wounds tick down, deadlines expire, quarters roll over
```

**Quarterly board meeting** (every 13 weeks): dividend due. Expectations escalate
each year. Hell escalates too (regions harden over time). The campaign is a 10-year
charter (40 quarters); final score = Victory Points + vault.

### Scarcity model (what makes it XCOM)

- Contracts **expire** — you cannot take them all.
- Wounds take weeks in the infirmary; stress persists on characters
  (Darkest-Dungeon-style) and forces rotation.
- Death is permanent (unless mitigated by the Soul Collateral Office project).
- Therefore you need a roster of 9-12, not because the game says so, but because
  the A-team is in the infirmary and the good contract expires Thursday.

### One squad at a time (v1 decision)

The player personally plays every sortie; scarcity comes from deadlines + roster
readiness. Auto-resolved B-team dispatches (Battle Brothers-style) are a possible
v2 — deliberately deferred because auto-resolve is a balance tarpit.

---

## Deckbuilding Across the Campaign

The StS drafting arc (10 junk cards → 30-card engine over an hour) cannot survive
1-2 combat sorties, so **the arc moves from the run to the campaign**:

- Each character owns a **persistent deck**. Recruits arrive with a basic ~8-card
  kit; a veteran is a curated 15-card machine. The deck is the character's gear,
  XP, and loss-value when they die.
- Card rewards still drop after combats (pick 1 of 3, class-eligible for squad
  members present) — but they go **onto a character, permanently**. Deck size caps
  by rank keep veterans from bloating.
- Deck surgery is an HQ service and a money sink: upgrade (Foundry), removal
  (Retraining Program), transfer from the dead (Company Archives).

Closest analogues: Gordian Quest campaign mode, Trials of Fire, Wildermyth.

---

## The Economy

### Currencies (v1 decision: collapse to one)

**British Pounds Sterling (£)** is the only money. Sovereign Infernal Notes are
retired (their venue — in-run shops — mostly disappears with the node map).
Strategic resources (Hush, Whiteflame Distillate, Infernal Machinery) and faction
reputation remain as non-money resources.

*Deferred spice option:* a dual-economy where dividends must be paid in £ but
demon vendors only take Notes, with lossy exchange (money laundering as mechanic).
Only add if the single-currency economy feels flat.

### What money buys (conversion menu)

| £ spent on | Tactical effect | Notes |
|---|---|---|
| Recruitment | more bodies, rarer classes | faction rep gates the good ones |
| Wages/upkeep | keeps roster size honest | ongoing drain so hoarding has cost |
| Infirmary / chapel | rush wound healing, treat stress | converts £ into time |
| Card services | upgrade / remove / transfer | per-character deck quality |
| Equipment | relics as assignable gear (2-3 slots) | lost on death unless insured |
| Provisioning | consumables (permits, decrees) | per-sortie tactical power |
| Intelligence | scout enemy composition pre-commit | de Veer taxonomic charts |
| Strategic projects | facility/tech tree | permanent passives + unlocks |
| **Dividends** | none — that's the point | survival and score |

### Where money comes from (contract types)

The push-your-luck trading identity survives as contract variety:

- **Trade runs** — escort cargo through 2 combats to a market; cargo cards clog
  the squad's combat deck for the sortie (the original tension, in miniature).
  Deeper regions pay better multiples.
- **Procurement/salvage** — payout is cards, equipment, or strategic resources.
- **Infernal goods extraction** — push-your-luck: carry the cursed relic that
  torments the squad all sortie, sell it big at HQ.
- **Faction favors** — low cash, high reputation; rep unlocks that faction's
  recruits, vendors, unique cards.
- **Straight combat contracts** — clear the nest, defend the depot: baseline £.

---

## Strategic Projects

> **AMENDED July 2026 — see "Amendment: Standing Orders" below.** The
> single-track "buy a project, keep it forever" model described in this
> section is superseded. Projects split into two tracks: permanent **Capital
> Works** and slot-limited, swappable **Standing Orders**. The six families
> and the design rule survive; what changed is which track each effect
> belongs to.

### Design rule

> A strategic project must do at least one of: (a) change which contracts you can
> take, (b) change who you can field, (c) change the shape of a sortie, or
> (d) change the dividend math. If it only adds a number, that number must be
> income — and income projects are the boring floor of the tree, not its identity.

No project may be *mandatory* (XCOM's satellite problem). A campaign skipping any
family should be playable but distinctly shaped.

### The six families

1. **Contract board manipulation** — *Imperial Telegraph Concession* (see contracts
   1 week earlier), *Infernal Rail Siding* (unlock a distant region), *faction
   embassies* (unlock that faction's contract line, recruits, vendors, cards).
2. **Roster infrastructure** — *Company Infirmary* (heal 2×), *St. Dymphna's
   Annex / Blue Room Reading Societies* (stress treatment slot), *Expanded
   Barracks* (roster cap 8→12), *Soul Collateral Office* (death → rescue contract
   instead; a rules-change project).
3. **Deck & equipment infrastructure** — *The Foundry* (unlock card upgrades),
   *Retraining Program* (unlock card removal — a felt mid-tree power spike),
   *Company Archives* (pick 1-of-4 rewards; transfer a dead soldier's card),
   *Whitworth Pattern Room* (craft equipment from strategic resources).
4. **Intelligence** — *De Veer Taxonomic Survey* (see enemy comps before
   committing), *Actuarial Department* (casualty forecast for a tentative squad).
5. **Board management** — *Investor Relations Bureau* (expectations escalate 25%
   slower), *Preferred Share Restructuring* (skip one dividend, consumable-shaped),
   *Creative Accounting* (20% income off-ledger, risk of Spectral Audit mission).
6. **Economic engines & VP** — *Dis Municipal Bonds* (flat £/quarter),
   *Smythe-Bowyer Poppy Fields* (cargo type + recurring trade contract),
   *Lethe Extraction Co.* (pure VP, zero utility — kept deliberately: choosing
   when to pivot from building to scoring is the endgame decision).

### Retrofit of the existing nine

| Existing | New role |
|---|---|
| Dis Municipal Bonds | passive income floor |
| Our Man in Dis | Dis embassy + one free scouted contract/quarter |
| Lethe Extraction Co. | pure VP engine (unchanged) |
| Abyssal Research Institute | unlocks Abyssal Frontier contracts + crafting recipes |
| Levi Maxwell Ascension Protocol | multi-stage VP capstone |
| Smythe-Bowyer Poppy Fields | cargo type + recurring trade contract |
| Blue Room Reading Societies | stress infrastructure |
| Revolutionary Contacts | Stoker's Union embassy; cheap recruits; Pinkerton retaliation risk |
| Phlegethon Coalfalls | Whiteflame Distillate income |

### Pacing

10-year / 40-quarter charter; a project costs 2-4 quarters of discretionary
profit → the player buys **10-14 projects per campaign from a pool of 25-30**.
The ratio matters more than any single effect; it's what differentiates campaigns
(rail-and-trade company vs embassy diplomat vs soul-mortgage necro-HR firm).
Prerequisites gate within families (embassy → faction projects, Foundry → Pattern
Room).

---

## Amendment: Standing Orders (July 2026)

**Status:** Approved direction. Supersedes the single-track project model
above. Working name during design was "Edicts"; the in-fiction term is
**Standing Orders** — policies ratified by the board, on the model of XCOM 2's
resistance orders.

### Motivation

Two problems with projects-as-pure-purchases:

1. A permanent-passive tree is a second raw-power track that competes with
   the roster. The design wants **soldiers and their decks to be the power
   accumulation**; the strategic layer should accumulate *flexibility*.
2. Five of the eleven shipped projects were cargo unlocks tied to the deleted
   trade-route layer — purchasable no-ops.

### The two tracks

- **Capital Works** — permanent one-time purchases, deliberately few. A
  capital work must unlock a *capability* (Foundry: card upgrades;
  Retraining Program: card removal; Expanded Barracks: roster cap), pay
  **income** (Dis Municipal Bonds, Our Man in Dis), or bank **VP** (Lethe
  Extraction Co.). No passive gameplay modifiers — those are Orders.
- **Standing Orders** — board-ratified policies occupying limited slots,
  swappable only at the **quarterly board meeting** (the board ratifies
  policy changes; you cannot fiddle per-sortie). No VP. Each order changes
  how the campaign plays: contract board shape, dividend math, roster
  economics, sortie structure, risk/reward toggles.

### Slot economy

- 1 slot at campaign start; +1 at the first board meeting of years 3, 5, 7,
  and 9 (max 5). Flavor: the board's willingness to indulge standing policy
  grows with a proven manager.
- One additional slot purchasable as a Capital Work (*Company Secretariat*).
- Enacting/swapping at the meeting is free; scarcity is slots + cadence.

### Where orders come from

- A launch pool available from the start (8–12 orders, spanning the six
  families above).
- Later orders unlock via Capital Works (embassies unlock faction orders)
  and — future hook — via repeat business with contract **clients** (e.g.
  fulfil three Infernal Marine contracts → they offer their *Underwriting
  Retainer*). Clients were added to contracts July 2026; this is the natural
  mechanical payoff for them.

### Launch order sketch (names indicative, all £-frame corporate register)

| Order | Effect | Family |
|---|---|---|
| Aggressive Tendering | contract board refills to 6, not 5 | board manipulation |
| Punctuality Clause | contract deadlines +1 week | board manipulation |
| Hazard Pay Schedule | payouts +20%, wounds heal 1 week slower | risk toggle |
| Recruiting Sergeants | recruit cost −40% | roster |
| Phrenology Retainer | therapy −50% cost | roster |
| Actuarial Review | see enemy composition before dispatch | intelligence |
| Archives Standing Order | card rewards offer 4 choices, not 3 | sortie shape |
| Investor Relations Retainer | dividend expectation escalates 25% slower | dividend math |
| Creative Accounting | 15% of payouts off-ledger (don't raise future expectations); audit risk | dividend math |

### Retrofit of the shipped eleven

| Existing | Disposition |
|---|---|
| The Foundry | Capital Work (unchanged) |
| Retraining Program | Capital Work (unchanged) |
| Dis Municipal Bonds | Capital Work — income (unchanged) |
| Our Man in Dis | Capital Work — income; embassy upgrade later |
| Lethe Extraction Co. | Capital Work — pure VP (unchanged) |
| Abyssal Research Institute | becomes a Standing Order (extra card reward at sortie start); rewrite "run" → "sortie" |
| Levi-Maxwell Ascension Protocol | **pulled from pool** (cargo; parked for v2 VP capstone) |
| Smythe-Bowyer Poppy Fields | **pulled from pool** until trade-run contracts exist |
| Blue-Room Reading Societies | **pulled from pool**; returns as stress-treatment Capital Work |
| Revolutionary Contacts | **pulled from pool**; returns as Stoker's Union embassy |
| Phlegethon Coalfalls | **pulled from pool** until trade-run contracts exist |

### Implementation shape (v1)

1. StandingOrder model (pure, Phaser-free, registry-driven per house rule 6) +
   slot state on CampaignUiState; save format bump.
2. Ratification UI at the quarterly board meeting; InvestmentPanel splits
   into Capital Works and Standing Orders sections.
3. Launch orders wired through hooks in ContractGenerator, calendar math,
   barracks costs, and reward flow — effects as injection points, not
   if-this-order branches.
4. Pull the five dead cargo projects from the purchasable pool.

## Roster & Consequences

- **Roster**: starts 5, cap 8 (12 with Barracks). Recruits generated with class,
  persona traits, basic kit; hired for £ (rarer classes gated by faction rep).
- **Wounds**: ending a sortie below a HP threshold (or downed in combat) →
  Wounded N weeks; wounded characters cannot be dispatched.
- **Stress**: persists between sorties; treated at HQ (slot-limited) or by
  resting a character (opportunity cost = they can't deploy).
- **Death**: permanent in v1. Deck lost (Archives project recovers one card).
  Soul Collateral Office converts death into a rescue contract.
- **Growth**: XP → rank → +deck cap, occasional persona trait, stat bumps.

## Dividends & Doom Clock

- Quarter = 13 weeks. Dividend due each quarter-end, paid automatically from vault.
- Expectation starts modest (~£75/quarter) and escalates yearly (XCOM panic curve;
  scale with reported profits so windfalls raise the bar).
- Miss/short-pay → shareholder satisfaction drops proportionally; satisfaction
  recovers slowly when paying in full. Zero → sacked (game over).
- Charter expires end of year 10: final score = Victory Points + vault remainder.

## v1 Implementation Scope (current effort)

1. Campaign calendar (weeks/quarters/years) + dividend/satisfaction loop.
2. Contract model + generator; contract board panel in HQ (replaces trade-route
   selection as the expedition entry point).
3. Sortie runner: 1-2 combats (+ chance of event between), HP persistence within
   sortie, payout screen, calendar advance. No node map.
4. Persistent per-character decks; post-combat reward lands on a character.
5. Wounds + recovery ticking with the calendar.
6. Existing strategic projects keep working against vault £; retrofits and new
   families come after the loop is playable.

Explicitly deferred: auto-resolve dispatches, equipment slots, faction reputation,
intelligence services, dual currency, recruitment UI (roster fixed at start),
stress treatment facility, VP scoring screen.
