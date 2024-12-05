# Buff Glossary

## Combat Buffs

### Accursed [playable_card, character]
At the start of combat, apply X Cursed to each player character.

### Blessed [playable_card, character]
Negates the next X debuff(s) applied to this card/character.

### BloodGod [playable_card, character]
Whenever a sacrifice happens, this card/character gains X Lethality.

### Bloodprice [playable_card]
If you lack sufficient energy, pay X health per unpaid energy to play this card.

### Bulwark [playable_card, character]
Increase block applied by X.  (Analogous to STS's dexterity.)

### Burning [character]
At the end of turn, take (4 + Powder) damage for X turns.

### Courageous [characer]
At the start of combat, gain X Fearless.

### Cursed [playable_card, character]
Negates the next X non-debuff buff(s) applied.

### DamageIncreaseOnKill [playable_card]
When this card kills an enemy, its damage increases by X permanently.

### Delicious [character]
When struck, grants X Strength to the attacker.

### DespairNexus [character]
At the end of each turn, decrease all resource counts by X.

### Desirous [character]
The first X cards played each turn exhaust.

### Devil [character]
Takes X less damage from attacks.

### DoNotLookAtMe [character]
Whenever targeted by a card, applies X Stress to the owner.

### EarWorm [playable_card]
Retain. At the end of your turn, owner takes X damage. Damage increases by 1 each turn this remains in your hand.

### Eldritch [character]
Every turn after turn 5, the party gains 1 stress.

### ExhaustBuff [playable_card]
Exhaust this card when played.

### FearGod [character]
The first X card(s) played each turn gain Phobia.

### Fearless [character]
Absorbs the next X stack(s) of Stress applied.

### Flying [character]
Dodges the first X attacks each turn.

### GiantKiller [playable_card, character]
Increases damage dealt to enemies with Titan by 10% × X.

### GrowingPower [character, playable_card]
At the beginning of each turn, gain X Strength.

### Guilt [character]
Whenever a card with cost >2 is played, exhaust X card(s) from your discard pile.

### HellSellValue [playable_card]
Increases the Hell value of this card by X.

### Holy [playable_card, character]
Deals 50% additional damage to Devils and Eldritch enemies. Deals no damage to Holy enemies.

### Idol [character]
When this character is attacked, ALL enemy intents focus on the attacker.

### Lumbering [character]
Every time a card is played, takes X additional damage from attacks for the rest of the turn.

### MothGod [character]
At the start of each turn, apply Eggs to X random card(s) in your draw pile.

### Muse [character]
Whenever a cost 0 card is played, gain X Strength.

### NextTurnStrength [character]
At the start of your next turn, gain X Strength.

### Obsession [playable_card]
If this card hasn't been played for X turn(s), move it to your hand at the start of your turn.

### Painful [playable_card]
When played, this card deals X damage to you.

### Penance [character]
Whenever you play a card of cost 2 or less, increase its cost by X.

### Poison [character]
At the end of turn, lose X HP, then multiple poison stacks by 1/3. Creature deals 2 less damage.

### Prepper [character]
At the start of combat, X% chance to gain 1 energy.

### Protective [character]
When dealing block to an ally (who is not the owner of this buff), the ally gains X more block.

### ReactiveShielding [character]
After taking unblocked damage for the first time in a turn, gain X Block.

### Regeneration [character]
Heals X HP at the end of each turn.

### Robotic [character]
Negates all Burning or Poison applied.

### RustMonster [character]
When the owner hits a character, if that character has at least one card in the non-exhaust piles, a random card with >0 defense gets -X to defense.

### Sadist [character]
On killing an enemy, this character relieves X stress.

### Selfish [character]
This character's cards apply X more block to the owner of this buff and X less block to all other characters.

### SelfDestruct [character]
After Y turns, deals 999 damage to self and X damage to all player characters.

### Stress [character]
PLAYER-ONLY MECHANIC.  Stress does not go away at end of combat.  When the character has >= 10 stress, they take double damage from attacks.

### StressReliefFinisher [playable_card]
Whenever this kills an enemy, the whole party heals X stress.

### Stressful [playable_card]
Applies X additional Stress whenever it successfully damages someone.

### Strong [playable_card, character]
Increases damage by X.

### SurfaceSellValue [playable_card]
Increases the Surface value of this card by X.

### Swarm [character]
Caps the amount of damage received from an attack to X.

### Tense [character]
Each turn, if your stress is less than X, increase it to X.

### Titan [character]
Decreases all incoming damage by X.

### ValuableCargo [playable_card]
This card is valuable cargo. It will be purged if it loses all its value.

### Volatile [playable_card]
When this card is discarded, play it instead and exhaust a random card in hand.

### Vulnerable [character]
Increases damage taken by 50% for X turn(s).

### Weak [character, playable_card]
Reduces damage dealt by 33% for X turn(s).

## Notes
- X represents the number of stacks a buff has
- Some buffs may have additional mechanics not fully detailed here
- Buffs marked with [Powder] scale with the Powder combat resource


# RESOURCES NOTES
Resources are present in each combat.  In general, resources can be either gained or used as a scaler by a card but never both. (Damage, block, and magic numbers are the types of resource scaling.)  "Relevant classes" refers to classes that can gain the resource from cards, but any class can use any resource as a scaler (though most scalers should actually be related to the class.)

# TYPES OF RESOURCES

## powder
 at the start of turn, if you have 2 powder, decrease it by 2 and a random ally gains 2 strength.
RELEVANT CLASS: Blackhand, Archon

## iron
 at beginning of turn, gain 1 block for each iron value. decreases by 1 at end of turn.
RELEVANT CLASS: Blackhand, Archon

## pages
if you obtain 4 pages in a combat, gain an additional card reward option. if you gain 10, get 2 instead.
RELEVANT CLASS: Cog, Diabolist

## ice
 grant 1 stress block at beginning of turn for each 1 ice value.
RELEVANT CLASS:  Archon, Diabolist

## fog
 if you have more than 4 fog at the beginning of turn, gain sneak attack to your hand and decrease fog by 4. [replays next card played by a character].
 RELEVANT CLASS: Scavenger, Cog

## venture
 at end of combat, gain a loot reward option for each 2 venture value. [this is distinct from ordinary card rewards].  RELEVANT CLASS:  Scavenger.


# CARD KEYWORDED MECHANICS
These can go on any card.  You may have buffs that key off of these mechanics: e.g. "whenever you exert", or "whenever you manufacture".

## Barrage
Select up to 10 cards to discard.  For each card discarded, performs some action defined by the card.

## Sacrifice
Exhaust the rightmost card in your hand.

## Exert X
If you have enough energy after playing the card, expends X and triggers an effect defined by the card.

## Manufacture
Creates a card in your hand.

## Taunt
Forces an enemy to redirect current intents to the card's owner.

## Once
Denotes an effect that can only happen once per combat.

## Once Per Turn
Denotes an effect that can only happen once per turn.
