# Act 4: The Brimstone Badlands (design, July 2026)

Lead-authored under owner-delegated authority; grounded in the act-wiring
survey (all file:line claims verified there). The first Regions 4+
expansion: a LATE-charter region where the dividend squeeze, the VP pivot,
and the biggest payouts converge. Worldbuilding canon: volcanic extraction
country; the Brimstone Barons' heartland; the **Iron Choir** (doc-only
until now) maintains heavily fortified compounds.

## Wiring decisions

- **Unlock**: extend `maxActUnlocked` (ContractGenerator.ts:406) with a 4th
  tier: `year >= 7 || contractsCompleted >= 28 → 4`. Late-game by design —
  act 4 is where a solvent company goes to fund its endgame.
- **Formulas**: the linear extrapolations stand (base pay 110+segment×25,
  freight £120/crate, xp 30/win) — balance-sketch comments as usual.
- **difficultyStars stays 1-3** (segments 0-2); no board-visible star-4;
  ROMAN_NUMERALS untouched.
- **Board**: add `'Brimstone Badlands'` to REGION_ANCHORS
  (ContractBoardPanel.ts:63) — pick open map real estate visually against
  contract-map-hell.png (the survey notes a default-anchor fallback, so
  iterate coords in the browser). Survey-map art extension: SKIP in v1
  (pin + label suffice).
- **Boss lookup**: add the act-4 branch to getBossSegment
  (EncounterManager.ts:568) — or convert the chain to a lookup if the diff
  stays small.
- **Backgrounds**: v1 ships with the shared hell pool (no code change
  needed); a follow-up art batch adds 2-3 volcanic `location_backgrounds`
  keys + an act-4 branch mirroring the act-1 swamp special case.

## Contracts (ContractGenerator)

- REGION_FLAVORS entry: act 4, ~6 bounty templates. Clients: reuse
  "The Brimstone Barons, jointly" and "Brimstone Barons Equipment Leasing
  Consortium" and "Continental Casualty & Ossuary Underwriters"; introduce
  **"The Iron Choir, per its Concordat"** (new client string — no retainer
  in v1; reputation tracking picks it up automatically). Template subjects:
  vent-field claim disputes, choir-compound provisioning under interdict,
  runaway extraction engines, pilgrim-labor repatriation, caldera survey
  escort, a Concordat tithe audit.
- TRADE_RUN_REGIONS entry: 3 templates (cargo: raw brimstone, blessed
  bearing-oil for the Choir, refined phlogiston for the Barons).

## Enemies (12 + boss; directories act4_segment0/1/2, act4_boss)

Mechanical bar as before: reuse existing buffs/intents, no new buff classes
without STOP; mirror act-3 HP bands scaled up ~20%; every enemy gets a
Cavendish survey note at the July standard; portraitName uses a bespoke
slug key with `""`-sentinel NOT allowed — instead add keys to the art
allowlist? NO: ship v1 with `portraitName = ""` (the documented
auto-placeholder sentinel, lint-exempt) and let art batch 4 assign bespoke
keys — art and content decouple cleanly.

Segment 0 (3): **Vent Tick** (swarm chip damage, eggs — reuse the
egg/summon idiom); **Slag Porter** (high block, low attack — a beast of
burden that objects); **Choir Novice** (buffs allies' Lethality, sings).
Segment 1 (4): **Bell-Warden** (Reactive shielding + stun-adjacent debuff
idiom); **Brimstone Prospector** (steals — the £-theft idiom if one
exists, else applies Weak and flees-style intent cycling); **Interdicted
Hauler** (explodes on death — SelfDestruct idiom inverted; check for an
on-death hook, else 3-turn fuse); **Choir Cantor** (heals + Strength
choir-wide each turn).
Segment 2 (3): **Foundry Seraph** (Iron Choir elite: alternates
massive-block and massive-attack turns); **Baron's Assessor** (TariffAura
idiom + draw denial); **Caldera Shambler** (big HP, Frostbite-inverse —
use whatever burn/poison stack exists).
Boss: **The Ninth Bell** — a campanile-construct the Choir will not admit
to casting. Multi-phase via the existing boss patterns (read Act 2/3
bosses first): tolls (party-wide damage building each toll), summons Choir
Novices, and a bell-crack phase at half HP (drops its block engine, gains
Lethality). Cavendish note should be the best in the file.

## Out of v1

Survey-map art extension; badlands backgrounds (batch 4); Iron Choir
retainer/faction mechanics beyond the client string; any new combat
mechanic classes.

## Verification bar

typecheck + tests (act-gating test extended: year-7/28-contract tier;
region template client-consistency) + build + smoke + `qa-spawn.mjs`
extended with act-4 configs (force year to 7+ in the driver so the board
unlocks, or set the contract act directly as it already does) — every new
enemy class must spawn at least once across runs (add a targeted config
list; the harness supports forcing acts/segments) + browser board check
(Badlands pin + label on the survey map, a trade-run and a prestige roll
sampling act 4).
