# Character Class Concepts (brainstorm, July 2026)

Ideation only — no ruling made, nothing dispatched. Seven concepts for a
fifth (and sixth) player class, each anchored to an existing faction in
`worldbuilding.md` and to a slice of mechanical whitespace the current four
classes do not touch.

## The board as it stands

| Class | HP | Thematic seat | Mechanical seat | Resources used |
|---|---|---|---|---|
| Archon | 30 | British officer caste | command: taunt, ally buffs, block | Pluck, Venture, Ashes |
| Blackhand | 30 | demolitions mercenary | area destruction, hazards | Smog, Blood, Pluck |
| Diabolist | 20 | rift-touched occultist | self-harm, curses, sacrifice | Blood (via buffs) |
| Cog | 25 | leased Clockwork Wastes automaton | manufacture tokens, self-improvement | — |

**Unclaimed mechanical axes** (the real reason to add a class — a fifth
class that is "Archon but angrier" is not worth the card budget):

1. **Enemy intents as an interactable object.** Nothing today reads,
   delays, or edits an intent. `Foreseen` exists on the enemy side only.
2. **Deferred cost.** No class buys power now and pays later.
3. **Play-order sequencing.** Order within a turn is mechanically inert.
4. **Party-wide pooling.** Archon buffs allies one at a time; nobody
   redistributes damage, HP, or energy across the squad.
5. **Combat play that changes the sortie payout.** No class reaches the
   strategic layer from inside a fight.

**Unclaimed factions:** Stoker's Union, the Underclass, De Helrader
Maatschappij, CGVI, Deep France, the Iron Choir, and — conspicuously —
the Company's own clerical establishment.

**Underused resources:** Mettle (one class touches it), Venture (one card).
A new class should claim an existing resource rather than mint a new one.

---

## 1. The Ledger — Company factor (RECOMMENDED)

**Faction:** the East Infernal Company itself; Cranford-Reeves' people, the
clerks with signing authority. A Cavendish who did not run — or ran and
billed for the mileage.

**Fantasy:** you do not fight the enemy, you *finance* the fight. The Ledger
draws against future turns at ruinous interest and closes the books before
the interest lands.

**Axis: deferred cost (2).** Claims **Venture**.

**Signature mechanic — Arrears.** Cards grant power immediately and
manufacture an **Arrears** card into the draw pile: a 0-cost unplayable
Curse that, when drawn, costs energy or HP to discharge. Win fast and you
never pay; grind and the deck silts up with liabilities. Ashes/Smog
recursion is the Blackhand's; Arrears is the mirror image — the Ledger
*wants* cards out of the deck and can never quite manage it.

| Sketch card | Rarity | Effect |
|---|---|---|
| Advance Against Receipts | common | 0⚡: gain 2 Energy. Manufacture 1 Arrears into the draw pile. |
| Petty Cash | common | 1⚡: gain 2 Venture. |
| Indemnity Clause | uncommon | 1⚡: gain Block scaling with Venture; Exhaust. |
| Creative Accounting | uncommon | 1⚡: Exhaust an Arrears from hand; draw 2. |
| Leveraged Position | rare | 2⚡ Power: your attacks deal +1 damage per Arrears in your draw pile. |
| Quarterly Close | rare | 3⚡: remove all Arrears; deal damage equal to 6× removed. |

**HP band:** 28. **Downside:** the deck degrades if the fight runs long —
a hard pull against the Archon's attrition game, which is the point.

**Why it's the top pick:** it is the game's central joke rendered as a
mechanic (the Company's real weapon is credit), the register writes itself,
and it claims Venture, which is currently one card from being vestigial.

---

## 2. The Naturalist — De Helrader Maatschappij (RECOMMENDED)

**Faction:** the Cloggers; Professor de Veer's field collectors, seconded to
Company sorties on a specimen-sharing agreement nobody has read.

**Fantasy:** the enemy is not an obstacle, it is *material*. You are taking
notes while it kills your colleagues, and the notes are worth more.

**Axis: enemy intents as an object (1).** Claims **Pluck** (nerve, in the
Victorian-naturalist sense) or a small use of Ashes for preserved specimens.

**Signature mechanic — Study.** Applying **Studied** to an enemy reveals and
*edits* its intents: delay one a turn, retarget it, downgrade it. Payoff
cards scale off Studied stacks. Second strand: **Specimen** — when a Studied
enemy dies, exile the corpse for a token card themed to that enemy type
(venom vial from a slug, wing-dust from the razor-butterflies), which is
combat-transient in v1 and could persist to de Veer's project track later.

| Sketch card | Rarity | Effect |
|---|---|---|
| Field Notes | common | 1⚡: apply 2 Studied. Draw 1. |
| Chloroform Rag | common | 1⚡: delay target's next intent by one turn. |
| Collection Net | uncommon | 1⚡: damage scaling with target's Studied. |
| Type Specimen | uncommon | 2⚡: if target dies this turn, Manufacture its Specimen token. |
| Monograph | rare | 1⚡ Power: whenever you apply Studied, gain 1 Venture. |
| Vivisection | rare | 2⚡: consume all Studied; deal 3× damage and apply Vulnerable. |

**HP band:** 24. **Downside:** low damage floor without setup — the class
that loses to something it hasn't catalogued yet.

**Why:** it opens the only genuinely new *reading* verb in combat (intents),
its flavor is already fully written in the worldbuilding, and it gives the
unshipped Intelligence standing-order family a natural partner.

---

## 3. The Stoker — Stoker's Union (RECOMMENDED)

**Faction:** Foreman Fiddler-Toot's lads, hired out to the Company by the
Union at rates the Union sets, which is a source of ongoing correspondence.

**Fantasy:** nobody wins alone. Power is pooled, shared, and withdrawn —
the squad is the unit, not the soldier.

**Axis: party-wide pooling (4).** Claims **Mettle**.

**Signature mechanic — Solidarity.** A combat-scoped stacking count that
rises when allies act (an ally plays a card, an ally is struck, an ally
blocks fully). Payoffs are all-or-nothing team effects. Redistribution is
the other strand: take a hit for someone, split damage across the line,
give an ally your energy. Explicitly *not* fire — the Furnace is heat and
pressure here, not Burning; Blackhand keeps ignition.

| Sketch card | Rarity | Effect |
|---|---|---|
| Shift Change | common | 1⚡: an ally draws 1; gain 1 Solidarity. |
| Take the Weight | common | 1⚡: redirect target's next intent to yourself; gain Block. |
| Work to Rule | uncommon | 1⚡: all allies gain Block scaling with Mettle. |
| One Out, All Out | uncommon | 2⚡: split damage dealt to any ally this turn evenly across the squad. |
| General Strike | rare | 2⚡: enemies gain no Strength and take no bonus actions next turn. You gain no Energy next turn. |
| Means of Production | rare | 2⚡ Power: at 8+ Solidarity, all allies gain 1 Energy per turn. |

**HP band:** 32 — the sturdiest class in the game.
**Downside:** dead weight in a one-soldier squad; scales with roster size,
which is a real strategic-layer decision rather than a combat one.

**Why:** it is the loudest faction in the worldbuilding with no player
representation, the humor writes itself ("half-remembered Marxist
terminology"), and pooling is the one axis Archon gestures at without
actually occupying.

---

## 4. The Emigré — Deep France revenant

**Faction:** a grenadier of the Grande Armée Eternal, released to Company
service under a labor arrangement the Emperor Undying considers temporary.
Requires no pension, which the Ledger notes approvingly in the margin.

**Fantasy:** it does not stop. It entrenches, it takes the hit, and when it
falls over it gets back up because nobody has issued the order to stop.

**Axis:** attrition tanking with a death-denial clock; frost is unclaimed
(`Frostbite` exists, no class uses it).

**Signature mechanic — Entrench.** Block that carries between turns and
compounds while you stand still (playing no attack ratchets it). Second
strand — **Interred**: at 0 HP the Emigré keeps acting for N turns before
falling; heals nothing, blocks everything.

| Sketch card | Rarity | Effect |
|---|---|---|
| Dig In | common | 1⚡: Block; Entrench 2. |
| Bayonet, Rusted | common | 1⚡: damage scaling with Entrench. |
| Sap and Parallel | uncommon | 1⚡ Power: gain 2 Entrench each turn you play no Attack. |
| Mitrailleuse-Organ | uncommon | 2⚡: hits all enemies; applies Frostbite. |
| The Old Guard Dies | rare | 2⚡ Power: at 0 HP, act for 3 more turns before falling. |
| Winter Quarters | rare | 3⚡: convert all Entrench into Block for the whole squad. |

**HP band:** 34, no healing access. **Downside:** slow; punished by anything
that ignores Block.

**Risk:** flavor is superb, but "big tanky bloke" overlaps the Archon's
defensive strand more than the three above. Would need Entrench to feel
genuinely different from Bulwark before dispatch.

---

## 5. The Cantor — Iron Choir

**Faction:** Lady Whorl-of-Hinges' order; a brass throatbox and a
metallurgical hymnal, on loan against an alloy debt.

**Fantasy:** combat as liturgy. The sequence matters more than the cards.

**Axis: play-order sequencing (3)** — the only genuinely novel *verb* on
this list.

**Signature mechanic — Verses.** Cards are numbered I/II/III. Playing them
in order in one turn escalates each subsequent verse (a break resets the
count). Second strand — **Sustained**: some cards remain on the field and
re-trigger at end of turn until interrupted.

| Sketch card | Rarity | Effect |
|---|---|---|
| Antiphon I | common | 0⚡: small damage; begins a Verse chain. |
| Response II | common | 1⚡: damage, doubled if played directly after Verse I. |
| Descant III | uncommon | 1⚡: damage scaling with current Verse count. |
| Tuning Peg | uncommon | 0⚡: your next card counts as any Verse number. |
| Full Choir | rare | 2⚡: if you completed I→II→III this turn, hit all enemies hard and apply Vulnerable. |
| Hymn of Bessemer | rare | 2⚡ Power (Sustained): re-triggers your last Verse at end of turn. |

**HP band:** 26. **Downside:** high execution burden; a bad draw is a broken
hymn and a wasted turn.

**Risk:** the most interesting design and the most expensive — sequencing
needs real UI affordance (visible chain state) that doesn't exist yet.
Best held until a class is wanted *because* it's a puzzle.

---

## 6. The Gleaner — the Underclass

**Faction:** Grim Sally's people. Hired cheap, paid in salvage rights.

**Fantasy:** the fight is a place where valuable things are lying around.
Everyone else sees a demon; you see 40 kilos of recoverable alloy.

**Axis: combat play that changes the sortie payout (5).** Claims **Smog**.

**Signature mechanic — Salvage.** Combat-scoped tokens gained from
exhausted cards, dead enemies, and destroyed hazards. Spendable in-fight
for effects, or *banked* at combat end into the sortie's payout line. The
only class whose tactical play reaches the strategic layer — and the only
one that can decline power now to be paid later.

| Sketch card | Rarity | Effect |
|---|---|---|
| Gleaning | common | 1⚡: gain 2 Salvage; draw 1. |
| Scrap Knife | common | 1⚡: damage scaling with Salvage. |
| Pocket the Difference | uncommon | 0⚡: Exhaust a card; gain 3 Salvage. |
| Barrow Load | uncommon | 1⚡: Block scaling with Smog. |
| Fence It Onward | rare | 0⚡: at combat end, banked Salvage adds to the sortie payout. |
| Nothing Goes to Waste | rare | 2⚡ Power: whenever an enemy dies, gain 3 Salvage. |

**HP band:** 22. **Downside:** the payout hook needs careful economy
balance (`CampaignSimulator` ratchets will scream), and greed is punished
by dying.

**Risk:** the cross-layer hook is the most exciting thing here *and* the
reason to be careful — it touches the money model, which is the one
house rule with no slack in it.

---

## 7. The Voyageur — Compagnie Générale des Voies Infernales

**Faction:** Madame Bertrand's outfit. Trades in abyssal curios and
"cultural anomalies"; her wine makes trade deals pliable and reality less so.

**Fantasy:** you are not reliably here. Neither is the enemy. Neither,
occasionally, is the card you just played.

**Axis:** space and impermanence — banish/return, position swaps,
high-variance transformation.

**Signature mechanic — Abeyance.** Send a card, an ally, or an enemy *out*
for N turns; it returns changed (upgraded, healed, or angrier). Second
strand — **Anomaly**: cards that transform into a different card when drawn.

| Sketch card | Rarity | Effect |
|---|---|---|
| Short Passage | common | 1⚡: banish target enemy for 1 turn (it acts on nothing). |
| Cellar Door | common | 1⚡: put a card into Abeyance; it returns upgraded. |
| Bertrand's Vintage | uncommon | 1⚡: an ally is removed from combat for 2 turns, returning healed. |
| Impossible Geometry | uncommon | 1⚡: swap two enemies' intents. |
| Cultural Anomaly | rare | 1⚡ Power: each turn, a random card in hand becomes a different card of the same cost. |
| The Long Way Round | rare | 3⚡: banish all enemies for 1 turn; you also skip your next turn. |

**HP band:** 22. **Downside:** variance; some of it will be bad variance.

**Risk:** the closest thematic neighbor to the Diabolist (both are "weird
magic people"). Keeping it about *travel and place* rather than blood and
curses is essential, and that discipline is easy to lose during
implementation.

---

## Considered and set aside

- **Angel-touched / Spanish blessed-equipment specialist.** Angels are
  established as unchallengeable in combat; making one playable spends
  a load-bearing piece of worldbuilding for a stat block.
- **Brimstone Baron.** The Barons are the player's own shareholders — the
  strategic layer is where they belong, not the field.
- **Reichsinfernokorps cryo-trooper.** Same seat as the Emigré (Deep
  France) and a weaker one; if frost is wanted, it belongs on the Emigré.
- **A Cavendish-style non-combatant.** Cavendish is the narrator; putting
  him on the roster costs more in voice than it gains in mechanics.

## Ranking, if one class is to be built

1. **The Ledger** — best joke-to-mechanic conversion, claims Venture,
   entirely new cost structure, no overlap with anything shipped.
2. **The Naturalist** — opens the intent layer, faction flavor already
   written, pairs with the unshipped Intelligence family.
3. **The Stoker** — biggest faction with no representation; pooling is
   real whitespace, and 32 HP + shared damage is a distinct squad shape.

The Cantor is the most novel and the most expensive; the Gleaner is the
most strategically interesting and the riskiest to the economy. Both are
worth building eventually, neither first.

## Notes for whoever writes the real design doc

- Follow the Cog precedent (`cog_class_design.md`): one legible identity,
  6–7 new cards over three rarities, an explicit out-of-scope list, and a
  named verification bar.
- Claim an existing combat resource; do not mint a new one in v1.
- Any card that can end up on a roster deck must register per house rule 4.
- Every class needs 4+ perks (`buffs/perks/`) and portrait art for both
  genders — see the `generate-game-art` skill and `AssetManifest`.
