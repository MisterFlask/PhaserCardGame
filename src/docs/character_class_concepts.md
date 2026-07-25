# Character Class Concepts: Ordinand, Antiquarian, Hammer

Design specs for three new character classes. All numbers are placeholder
tuning values — expect a `measure-combat-rates` sweep and ratchet review
before any of them ship. Existing engine hooks each design leans on are
called out explicitly so implementation briefs can point at real code.

Existing roster for reference: Archon (command/support, 30 HP), Diabolist
(curses/blood, 20 HP), Blackhand (fire/AoE destruction, 30 HP), Cog
(manufacture/scaling block, 25 HP).

---

## 1. The Ordinand

**Niche:** burst damage and squad-wide payoffs with a psychological price.
The strongest single-target effects in the game; many of them apply Stress
to your own squad, because the equipment works by letting something
incomprehensible briefly pay attention to you.

- **HP:** 24
- **Faction hook:** the Spanish diplomatic channel to Heaven (worldbuilding.md,
  "Heaven"). The Company sublets a chaplaincy secondment from Madrid.
- **Resource affinity:** Blood (self-harm costs), Pluck (courage under
  revelation).

**Draft longDescription:**
> The Ordinand is seconded from the Spanish chaplaincy under a
> equipment-sharing memorandum the Company's lawyers describe as
> "theologically load-bearing." The blessed materiel functions exactly as
> specified. The screaming is normal and is covered in the waiver.

### Engine hooks
- `Holy` buff (`buffs/standard/Holy.ts`): +50% damage vs Devil/Eldritch,
  0 vs Holy. The Ordinand is the class that weaponizes this.
- `Stress` buff (`buffs/standard/Stress.ts`): persistent; at 10 stacks the
  character breaks — gains a Trauma curse and loses 2 Lethality. The
  Ordinand both inflicts Stress on allies (as a cost) and uniquely relieves
  or converts it (`StressReliefFinisher` precedent).
- `ManufactureCardToHand` (`procs/BasicProcs.ts`) for Blessing tokens.

### Token card
- **Blessing (Provisional)** — 0-cost skill, exhaust. Choose one: deal 5
  Holy-typed damage, or heal an ally 3. Flavor: `[color=white]THE PAPERWORK
  IS IN ORDER.[/color]`

### Cards
Commons:
- **Aspergillum** — Attack. 6 damage; if the target is a Devil or Eldritch,
  gain 4 Block. (Cheap Holy-synergy poke.)
- **Blessed Bullet** — Attack. 8 damage, benefits from Holy scaling.
- **Censer Drill** — Attack. 5 damage, apply 2 Burning. Sanctified smoke.
- **Catechism** — Skill. Draw 2; a random ally gains 1 Stress.
- **Look Away** — Skill. 7 Block; relieve 1 Stress on self.
- **Litany of Procurement** — Skill. Gain 1 Pluck; draw 1.
- **Sanctified Bayonet** — Attack. 7 damage; gain 1 Blood.

Uncommons:
- **The Only Cost Is—** — Skill. Gain 2 energy. You gain 2 Stress.
- **IT REGARDS YOU FAVORABLY** — Skill. An ally gains the Holy buff for the
  combat and 2 Stress.
- **Do Not Perceive It Directly** — Skill. Apply Blind to an enemy; gain
  6 Block.
- **Choir Audible** — Skill. All allies gain 5 Block and 1 Stress.
- **Tongue of Flame** — Attack. 6 damage to ALL enemies, Holy-typed.
- **Second Anointing** — Skill, exhaust. Heal an ally 8; they gain 2 Stress.
- **Manifest (Cargo)** — Power. At the start of each turn, manufacture a
  Blessing (Provisional) to hand.

Rares:
- **BEHOLD** — Attack. 30 damage to one enemy; every ally (including the
  Ordinand) gains 2 Stress. The signature card.
- **Liability Waiver, Countersigned** — Skill, exhaust. Remove ALL Stress
  from an ally; deal damage to a random enemy equal to twice the Stress
  removed. (The class's Stress release valve — turns the cost back into
  payoff.)
- **Trumpet Involuntary** — Attack. 12 damage to ALL enemies; apply 1
  Weak to each. Squad gains 1 Stress.
- **The Spanish Channel** — Power. Whenever an ally would break under
  Stress (hit the threshold), instead reduce them to 9 stacks. (Safety-net
  power; checks `Stress.onCombatStart` threshold semantics — likely needs a
  small hook in the Stress buff, see open questions.)
- **Stigmata Dividend** — Power. Whenever you gain Stress, gain 1 Blood.
- **PER OUR LAST CORRESPONDENCE** — Attack, retain. 10 damage; +5 damage
  for each turn it has been retained in hand. (The angel is patient.)

### Open design questions
1. Stress currently only resolves its break at `onCombatStart` — cards that
   care about "would break mid-combat" (The Spanish Channel) need a
   mid-combat check or should be redesigned to fire at combat start.
2. Should Holy-typed damage be a real damage tag or just "this card's
   damage is modified as if the owner had Holy"? Recommend granting the
   card-level Holy modifier rather than a new damage type.

---

## 2. The Antiquarian

**Niche:** rogue-pattern tempo — cheap fast cards, discard/retrieve tricks,
and a loot economy that pays out in £ if you can survive carrying it.
The Cog manufactures pristine goods; the Antiquarian fences dubious ones.

- **HP:** 22
- **Faction hook:** Underclass-adjacent freelancer (Grim Sally's world) with
  forged Clogger credentials — part tomb-robber, part auction-house fence.
  Retained by the Company because provenance is a service like any other.
- **Resource affinity:** Smog (retrieve from discard), Venture (draw).

**Draft longDescription:**
> The Antiquarian is retained under a consulting agreement that describes
> the work as "acquisitions." Every object they hand the Ledger arrives
> with papers proving it was legally excavated, which is remarkable,
> because it never was.

### Engine hooks
- `SurfaceSellValue` / `HellSellValue` buffs (`buffs/standard/`): card
  buffs that make a card worth £ — the Looted Curio economy rides on these,
  and £ stays the only currency (house rule 2) because payouts are ordinary
  sell value, not a new resource.
- Smog resource (spend 2: return a card from discard to hand) — the class
  that actually wants to click it.
- `DuplicateNextCardBuff` (`buffs/standard/`) for Forgery.
- `Barrage` proc (discard-multiple) for appraisal effects.

### Token card
- **Looted Curio** — 0-cost skill, exhaust. Gain 4 Block ("you hide behind
  the crate"). Carries `SurfaceSellValue` (£8). Dead weight in the deck
  until sold — the class's risk/reward loop is stuffing your deck with
  clutter that pays out at liquidation.

### Cards
Commons:
- **Letter Opener** — Attack, 0 cost. 4 damage. (The rogue dagger, by way
  of a writing desk.)
- **Crowbar** — Attack. 6 damage, apply 1 Vulnerable. Officially a
  "provenance verification instrument."
- **Casing the Site** — Skill. 5 Block; scry 2 (look at top 2 of draw pile,
  discard any).
- **Five-Finger Discount** — Skill, 0 cost, exhaust. Draw 1; gain 1 Venture.
- **Pawnbroker's Eye** — Skill. Draw 2, then discard 1.
- **Snuffbox of Dubious Origin** — Skill. Gain 1 Smog and 4 Block.
- **Provenance Papers** — Skill. The next card you play this turn costs 1
  less. (Everything is cheaper with the right documentation.)

Uncommons:
- **Grave Goods** — Skill. Manufacture 2 Looted Curios to hand.
- **Forgery** — Skill. Apply DuplicateNextCardBuff to self (the next card
  you play is played twice).
- **Sticky Fingers** — Power. The first card you retrieve from your discard
  pile each turn costs 0 this turn.
- **Dust Sheet** — Skill. 9 Block; the Antiquarian cannot be targeted by
  enemies next turn unless they are the only valid target. (Cheap
  stealth — pairs with a taunting Hammer.)
- **Auction Fever** — Attack. Damage equal to 3 plus 2 per card with a
  sell-value buff in your deck.
- **Deaccessioning** — Skill, exhaust. Exhaust up to 2 cards from your
  hand; gain 1 energy and draw 1 per card exhausted.
- **Reading the Catalogue** — Skill. Reveal an enemy's intents for the next
  2 turns (Clogger taxonomic charts, forged edition).

Rares:
- **Private Collection** — Power. Whenever a card is returned from your
  discard pile to your hand, it deals +3 damage or gives +3 Block this turn.
- **It Belongs in a Museum** — Skill, exhaust. Choose an enemy: steal one
  of its buffs (transfer to the Antiquarian). (Scope check: only
  transferable/positive buffs; needs a whitelist — see open questions.)
- **The Rosetta Racket** — Skill. Duplicate a card in your hand twice; the
  copies exhaust when played.
- **Finder's Fee** — Skill, exhaust, once per combat. Manufacture a Looted
  Curio with doubled sell value directly into your deck.
- **Half the Trick Is Knowing Where to Dig** — Power. At the start of each
  turn, scry 1; whenever you scry-discard a card, gain 2 Block.
- **Everything Must Go** — Attack. Discard your hand (Barrage, all cards);
  deal 5 damage per card discarded to a single enemy.

### Open design questions
1. Buff-stealing (It Belongs in a Museum) needs a transferability whitelist
   or a `canBeStolen` flag on AbstractBuff — a hard-coded card-specific
   branch would violate house rule 6. Recommend the flag.
2. Scry doesn't exist yet as a proc; two cards want it. Either add a
   `Scry(n)` BasicProc (preferred, reusable) or redesign those cards.
3. Confirm Looted Curio's sell-value payout path survives the
   HQ-checkpoint save model (token exists only mid-sortie; sale happens at
   liquidation/payout — verify it never needs serializing, per house rule 4).

---

## 3. The Hammer

**Niche:** the roster's first true tank — taunt, block-scaling, and
retaliation. Exists so the Diabolist and Antiquarian get to stay at 20-22
HP without apology.

- **HP:** 40 (highest in the game; hits like the name, but slowly)
- **Faction hook:** ex-Stoker's Union boilermaker, poached by the Company
  after an "industrial dispute" that required structural repairs to the
  dispute. HR books the role as Dispute Resolution.
- **Resource affinity:** Mettle (the block-for-all resource; the Hammer is
  its primary generator).

**Draft longDescription:**
> The Hammer's employment file lists the role as Dispute Resolution,
> reporting to Site Clearance. The Union objected to the poaching in the
> strongest terms, then met the Hammer, and moderated its terms
> considerably.

### Engine hooks
- `BasicProcs.Taunt(target, owner)` (`procs/BasicProcs.ts:81`): retargets
  ALL of an enemy's queued intents onto the owner, and broadcasts
  `TauntEvent`. Already implemented and idle — the Hammer is the class
  built on top of it.
- Mettle resource (spend 1: 2 Block to all characters).
- `Intimidation`, `Bulwark`, `ReactiveShielding`, `Titan` buffs
  (`buffs/standard/`) cover most of the retaliation/damage-soak kit
  without new buff engineering.
- `ManufactureCardToHand` for the signature token.

### Token card
- **Hurtful Words And Gestures** — 0-cost skill, exhaust. Taunt an enemy
  (all of its queued intents retarget to the Hammer) and gain 3 Block.
  Flavor: the content of the words is redacted in the after-action report;
  the gestures were witnessed and are described as "anatomically
  educational." This is the class's identity card — many Hammer cards
  manufacture copies, so the player continuously decides which enemy the
  Hammer is currently insulting.

### Cards
Commons:
- **Sledge** — Attack. 9 damage; gain 1 Mettle. Slow, heavy, honest work.
- **Come Off It** — Skill. Manufacture a Hurtful Words And Gestures to
  hand; gain 3 Block.
- **Shoulder the Load** — Skill. 8 Block.
- **Rivet Gun** — Attack. 3 damage ×2; gain 2 Block.
- **Tempered** — Skill. Gain 2 Mettle.
- **Workplace Grievance** — Attack. 6 damage; +4 more if the target is
  currently targeting the Hammer. (Rewards the taunt loop.)
- **Broad Back** — Skill. 5 Block to self and 3 Block to one ally.

Uncommons:
- **Provocative Pamphlet** — Skill. Taunt ALL enemies; gain 10 Block.
  (Misunderstood Marxism, weaponized at last.)
- **Anvil Stance** — Power. Gain ReactiveShielding-style retaliation:
  whenever an enemy attacks the Hammer, it takes 3 damage.
- **Counterweight** — Attack. Deal damage equal to the Hammer's current
  Block.
- **Overtime** — Skill. Block is not removed at the start of your next
  turn. (Once, then exhaust.)
- **Mind the Gap** — Skill. Intercept: the next attack against an ally this
  turn hits the Hammer instead; gain 6 Block.
- **Union Negotiator** — Skill. Apply Intimidation (enemies deal less
  damage) to an enemy; gain 1 Mettle.
- **Load-Bearing Colleague** — Power. Whenever the Hammer taunts an enemy,
  gain 4 Block.

Rares:
- **Grand Grievance** — Skill, exhaust. Taunt ALL enemies; gain 20 Block;
  gain 2 Mettle. The floor is now a formal complaint.
- **Industrial Action** — Power. Whenever a taunted enemy attacks the
  Hammer, it takes 8 damage. (Checks `TauntEvent` — needs a "taunted by
  me" marker buff so the power knows which enemies count; see open
  questions.)
- **Settlement Conference** — Attack, once per combat. Deal damage equal
  to twice the Hammer's current Block; lose all Block.
- **The Full Toolbox** — Skill. Manufacture 3 Hurtful Words And Gestures
  to hand; they cost 0 and do not exhaust this combat.
- **Immovable** — Power. The Hammer takes 1 less damage from all attacks
  (Titan buff), and gains 1 Mettle whenever an enemy attacks them.
- **Structural Repairs to the Dispute** — Attack. 14 damage; if this kills
  the target, all allies gain 6 Block and relieve 1 Stress. (Morale via
  demonstration.)

### Open design questions
1. `BasicProcs.Taunt` retargets *currently queued* intents only — enemies
   that re-roll intents next turn wander off. That's fine (taunt as a
   per-turn decision matches the token loop), but "Industrial Action"
   needs a lightweight `TauntedBy` marker buff applied alongside the proc
   so persistent effects know who's currently insulted. Registering that
   marker keeps house rule 6 intact.
2. Intercept/redirect (Mind the Gap) may already be expressible via
   `Bulwark` — check its semantics before writing a new buff.
3. 40 HP + taunt + Mettle generation risks trivializing early acts with a
   defensive shell; the `measure-combat-rates` sweep should gate final HP
   and Grand Grievance numbers.

---

## Cross-class notes

- **Party synergies are the point:** Hammer taunts so the 22-HP Antiquarian
  can loot in peace (Dust Sheet explicitly pairs); the Ordinand's
  Stress costs are underwritten by the Archon's fear-management kit and
  cashed out by Liability Waiver, Countersigned.
- **Save/registry checklist (house rule 4):** every new token
  (Blessing (Provisional), Looted Curio, Hurtful Words And Gestures), the
  `TauntedBy` marker, and any new powers that could persist on a roster
  deck must be registered in `SaveRegistries.ts` — the lint test will name
  offenders. Tokens should be combat-scoped and never serialized.
- **Asset needs per class:** portrait categories (male/female), class icon,
  card background — same manifest pattern as the Cog (`generate-game-art`
  skill covers this).
- **Implementation order recommendation:** Hammer first (taunt proc already
  exists, smallest new-mechanic surface), then Ordinand (Stress interplay
  needs one small hook), then Antiquarian (wants a Scry proc and a
  buff-transfer flag).
