## what ‘threat’ means, in one breath  
think of **threat** as the *expected hit-point swing the enemies will force on the party this turn*, measured in raw damage-equivalents. straightforward damage spends threat directly (1 dmg = 1 threat). anything else—block, buffs, debuffs, minion summons—gets converted into the amount of **future damage** it will probably cause or prevent, and that figure is booked against the same ledger.  

each act defines a **threat budget per turn**: a ceiling that keeps fights tense without feeling capricious. monsters may under-spend and later over-spend, but their rolling average over a few turns should track the table. think of it as fiscal discipline for mayhem.

---

# micro-cheat-sheet: costing non-attack intents (3-hero party)

## 1. threat budgets (per turn, *total across party*)

| act | hallway | elite | boss |
| --- | ------- | ----- | ---- |
| 1   | **8**   | **14** | **22** |
| 2   | **12**  | **22** | **32** |
| 3   | **16**  | **28** | **40** |
| 4   | **20**  | **35** | **48** |

---

## 2. non-attack conversion factors

| intent                    | threat formula                                |
|---------------------------|-----------------------------------------------|
| **block (solo foe)**      | `block × 0.5`                                 |
| **block (≥2 foes)**       | `block × 0.25` *per blocker*                  |
| **strength / dmg buff**   | `+dmg per hit × hits over next 2 turns`       |
| **summon minions**        | `total hp of new minions`                     |
| **weak / frail / vuln**   | *party-wide* `4 × duration`<br>*single hero* `1.3 × duration` |
| **mixed intent**          | sum the pieces; stay on budget                |
| **truly idle turn**       | cost `0` (use sparingly)                      |

---

## 3. flash examples

| scene | calc | threat spent |
|-------|------|--------------|
| act-1 hallway sweep `3 dmg to all` | `3×3 = 9` → trim to **2 dmg each** for ≈8 threat | ≈8 |
| solo boss blocks `25` (act 2)      | `25×0.5 = 12.5`; boss still owes ~9.5 to hit 22 | 12.5 |
| two goblins, one blocks `18`       | `18×0.25 = 4.5` | 4.5 |
| buff +2 str, next 2 turns hit 3×   | `2×3×2 = 12` (act-1 boss) | 12 |
| single-hero Weak 2 turns (elite)   | `1.3×2 = 2.6`; elite must add ~11.4 damage | 2.6 |

---

**tl;dr**  
* threat is damage-equivalent.  
* block is half value in duels, quarter in crowds.  
* price buffs/debuffs by the hp swing they’ll cause over the next **two** enemy turns.  
* spikes can’t exceed double the act budget without an earlier under-spend.  
adhere to these constants and your encounter scripts will menace without murdering.


# OTHER ENEMY CREATION GUIDELINES
In addition to the balance rules above, enemies in Act 2 and Act 3 should have some kind of interesting or bespoke buff/debuff associated with them.

Generally, you'll want to have these in the form of a "when the player does x, cause y effect" trigger (see triggers_and_effects_options for some ideas on this).  NOTE that the goal is for the player to be able to play around the buff/debuff; "the player has one less energy per turn" is an example of a bad concept for a debuff on the player since the player can't really do anything about that.  "Whenever the player plays a card, discard a card at random" is a more interesting buff since it forces the player to reprioritize the cards they play (this is just an example, do not use this specific concept.)  "This enemy takes 2x damage from burning" is also a good option since it pushes the player to use the Burning status effect more often.

NOTE that you may use secondaryStacks on the AbstractBuff object if the buff needs to keep a counter of any sort.

### Negative design example: unused-energy triggers

`Audit Pressure` once penalized players for leaving energy unspent at the end of a turn.  Because unused energy is extremely rare in normal play, the effect almost never fired and therefore failed to influence player choices.  Worse, the buff repeatedly lowered party **Lethality**, stretching fights out rather than adding tension.

### Better approach: card-count audits

Revised `Audit Pressure` now counts how many cards the party plays each turn.  If they play more than three, everyone loses 1 Dexterity at turn end.  Players can choose to hold back cards to avoid the penalty, so the mechanic actually shapes decisions without permanently stifling their damage output.

Repeatedly lowering Lethality is discouraged; if you must scale a stat down over time, hit Dexterity instead so combats don’t drag on interminably.
