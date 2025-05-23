### preliminary assumptions

* combat is turn-based, with discrete **energy** (a.k.a. mana) that usually starts at 3 per turn.
* damage and block are the primary linear resources; anything else (draw, strength, artifact, etc.) is *utility* and valued relative to how often it converts to damage/block.
* we evaluate cards **per energy spent**, not per card, because upgraded cost-reducers muddy a flat metric.
* these rules target *base* values (no relics, no synergy, no upgrade). upgrades should increase a card’s tier by roughly ½ step, not a full rarity jump.

---

## the baseline power budget

| resource           | “fair” gain per 1 energy | rationale                                                                                                |
| ------------------ | ------------------------ | -------------------------------------------------------------------------------------------------------- |
| damage             | **6**                    | strike, zap, dagger spray slices average >90 % win runs; empirically 6 dmg/energy is floor for viability |
| block              | **5**                    | defend, survivor; anything below 5 forces hp racing                                                      |
| card draw          | **1.3** cards            | acrobatics (−1) = net +1. polymath‐run data puts breakeven at \~1.25                                     |
| strength/dex       | **⅔** point              | flex (0-cost) grants 2 temp str → 1 str ≈ 3 dmg/energy across typical hand sizes                         |
| scaling multiplier | **1×** for next turn     | e.g., vulnerable is 1.5× dmg, costed so that 1 energy for vuln must give you at least +6 future dmg      |

treat any value **above** these baselines as a *bonus* that must be purchased with conditions, variance, or rarity.

---

## rarity rules

### common

1. **no single-card wincons** – commons must be *building blocks*, never demand immediate removal.
2. max value: **110 % of baseline** (≈6–7 dmg/energy, 5–6 block/energy).
3. scaling limited to *linear* (e.g., +2 dmg per strength, +1 block per dex).
4. conditional text may lift ceiling but must have ≥70 % uptime in an average deck (e.g., twin strike wants strength, but strength sources are plentiful).
5. innate or 0-cost commons must refund part of their power elsewhere (neutralize: 3 dmg + 1 weak = fair because −3 baseline dmg).

### uncommon

1. may spike to **140 % of baseline** or add **minor scaling** (e.g., perfected strike, cloak and dagger).
2. can introduce *deck identity pivots* but not finishers; they say “build around me”, not “i win now”.
3. allowed one of:

   * variable energy cost (x-cost) with proportional output capped at \~18 dmg/blk for 3 energy,
   * permanent scaling gated behind hp loss or exhaust,
   * top-tier utility (retain, scry, select-draw) at small numerical discount.
4. draws or energy rebates must still net ≤ +1 card or ≤ +1 energy after costs.

### rare

1. may break the baseline—**no numeric cap**—but must carry **meaningful constraints**: high cost, exhaust, setup, or risk.
2. permissible archetype finishers: feed, echo form, wraith form. these either end fights swiftly or trivialize damage intake.
3. scaling can be exponential or permanent, provided early fights cannot be solved for free (combust’s hp-loss gate, corruption’s cost).
4. rare utility should *bend* core rules (omniscience, alpha/beta/omega) yet stay answerable by bad draws or mis-timed use.
5. a rare card with purely linear numbers (bludgeon: 32 dmg for 3) must feel **spectacular** but still loses to energy-tight hands; that’s its constraint.

---

## cross-cutting heuristics

* **energy-to-turn ratio**: if a card can be played twice in one turn without external help, its per-play power must drop 10-20 %.
* **front-load vs back-load**: front-loaded defense/damage uses tighter ceilings; back-loaded (next-turn, retain, scaling) earns a 15-30 % premium because risk.
* **exhaust = +25 % power** (removal from deck balances recursion abuse).
* **hp cost converts at \~1 hp → 2–3 dmg or 2 block**; users seldom pay more.
* **randomness surcharge**: truly random outcomes get +15 % numeric push (dagger throw vs doppelgänger).
* **synergy tax**: if a card becomes *broken* with one obvious companion, scale its base numbers down 10 %.

---

## design sanity checks

1. simulate opening hand on turn 1 with three commons and one uncommon; player shouldn’t kill a standard act-1 enemy outright.
2. ask: “if this rare were always drawn on turn 1, would the run be trivial?” if yes, add reliquary-level cost or self-damage.
3. run the “dead draw” test: a card that does *nothing* when drawn must belong to the **“rare gambit”** space (e.g., lesson learned pre-kill).
4. ensure upgrade paths obey rarity: a common upgrade may *equal* an uncommon base version, but never a rare.

---

## abridged exemplars (sts originals)

* **common** strike = 6 dmg/1e; defend = 5 blk/1e. textbook baseline.
* **uncommon** clothesline = 12 dmg + 2 weak for 2e → 6 dmg/1e + utility ≈ 135 % baseline. good fit.
* **rare**  wraith form = intangibility that obviates hp loss but decays; infinite ceiling balanced by exhaust + frailty → fits “constraint” requirement.

---

## closing

treat these rules as heuristic, not dogma; emergent synergies will warp any static metric. iterate with live data, prune extremities, and remember: a card’s perceived power is as much about *timing* as magnitude.

good luck forging your own lexicon of cardboard sorcery.
