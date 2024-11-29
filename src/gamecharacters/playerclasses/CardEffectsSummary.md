# Card Effects Summary

## Card Entry Format
`[Card Name]`
- **Type**: [Card Type: Attack/Skill/Power/Item]
- **Energy Cost**: X
- **Rarity**: Common/Uncommon/Rare
- **Base Stats**: 
  - Damage: X
  - Block: X
  - Magic Number: X
- **Resource Scaling**: 
  - Resource: [blood/pluck/mettle/etc]
  - Scaling Type: [attackScaling/blockScaling/magicNumberScaling]
  - Scaling Value: X
- **Buffs/Modifiers**:
  - [List of buffs with stacks]
- **Effect Description**

## Archon Class Cards

### Commons
`Bolster`
- **Type**: Skill
- **Energy Cost**: 1
- **Rarity**: Common
- **Base Stats**: 
  - Block: 5
- **Resource Scaling**: 
  - Resource: pluck
  - Scaling Type: blockScaling
  - Scaling Value: 1
- **Buffs/Modifiers**: None
- **Effect**: Apply 5 Block to all allies

`Buzzsword`
- **Type**: Attack
- **Energy Cost**: 2
- **Rarity**: Common
- **Base Stats**:
  - Damage: 11
- **Resource Scaling**:
  - Resource: pluck
  - Scaling Type: attackScaling
  - Scaling Value: 3
- **Buffs/Modifiers**:
  - Holy (1 stack)
  - StressReliefFinisher
- **Effect**: Deal 11 damage with Holy effect

`Hand Cannon`
- **Type**: Attack
- **Energy Cost**: 1
- **Rarity**: Common
- **Base Stats**:
  - Damage: 8
- **Resource Scaling**:
  - Resource: mettle
  - Scaling Type: attackScaling
  - Scaling Value: 1
- **Buffs/Modifiers**:
  - Vulnerable (1 stack)
- **Effect**: Deal 8 damage and apply 1 Vulnerable

`Incoming`
- **Type**: Skill
- **Energy Cost**: 1
- **Rarity**: Common
- **Base Stats**:
  - Magic Number: 2
- **Buffs/Modifiers**: None
- **Effect**: Add 2 Take Cover cards to hand

`Inspiring Presence`
- **Type**: Power
- **Energy Cost**: 1
- **Rarity**: Common
- **Base Stats**:
  - Magic Number: 2
- **Resource Scaling**:
  - Resource: pluck
  - Scaling Type: magicNumberScaling
  - Scaling Value: 1
- **Buffs/Modifiers**: None
- **Effect**: Gain 2 Pluck. All allies gain 1 Strength

`Tactical Manual`
- **Type**: Skill
- **Energy Cost**: 1
- **Rarity**: Common
- **Base Stats**:
  - Magic Number: 1
- **Resource Scaling**:
  - Resource: pages
  - Scaling Type: magicNumberScaling
  - Scaling Value: 1
- **Buffs/Modifiers**: None
- **Effect**: Draw 2 cards. Discard a card. Target ally gains 1 Strength

`The Lash`
- **Type**: Attack
- **Energy Cost**: 1
- **Rarity**: Common
- **Base Stats**:
  - Damage: 8
  - Magic Number: 1
- **Buffs/Modifiers**: None
- **Effect**: Deal 8 damage. Apply 1 Weak to target

### Uncommons
`Courage Under Fire`
- **Type**: Skill
- **Energy Cost**: 2
- **Rarity**: Uncommon
- **Base Stats**:
  - Block: 5
  - Magic Number: 1
- **Buffs/Modifiers**: None
- **Effect**: All characters gain 5 Block and 1 Strength. Repeat for characters with >5 Stress, and again for characters with >9 Stress

`Inspire Fear`
- **Type**: Attack
- **Energy Cost**: 2
- **Rarity**: Uncommon
- **Base Stats**:
  - Magic Number: 2
- **Resource Scaling**:
  - Resource: pluck
  - Scaling Type: magicNumberScaling
  - Scaling Value: 1
- **Buffs/Modifiers**: None
- **Effect**: Apply 2 Vulnerable and 2 Burning to all enemies. Apply 1 Vulnerable to all allies

`Orders`
- **Type**: Skill
- **Energy Cost**: 1
- **Rarity**: Uncommon
- **Buffs/Modifiers**: None
- **Effect**: Draw 2 cards. If drawn cards have Block, increase Block by 3. If drawn cards do Damage, increase Damage by 3

`The Law`
- **Type**: Power
- **Energy Cost**: 1
- **Rarity**: Uncommon
- **Buffs/Modifiers**: 
  - At the beginning of each turn, add a Take Cover to hand
- **Effect**: Add a Take Cover to hand at the beginning of each turn

`Tough It Out`
- **Type**: Skill
- **Energy Cost**: 1
- **Rarity**: Uncommon
- **Base Stats**:
  - Block: 13
- **Buffs/Modifiers**:
  - Painful (1 stack)
- **Effect**: Apply 13 Block to target. On play, adds 1 Painful stack

### Rares
`Chain of Command`
- **Type**: Attack
- **Energy Cost**: 2
- **Rarity**: Rare
- **Base Stats**:
  - Damage: 8
- **Resource Scaling**:
  - Resource: mettle
  - Scaling Type: attackScaling
  - Scaling Value: 1
- **Buffs/Modifiers**: None
- **Effect**: Deal 8 damage to ALL enemies. Gain 2 energy. Draw 2 cards. All party members take 1 Stress. Add a Take Cover to hand

`Death or Glory`
- **Type**: Attack
- **Energy Cost**: 1
- **Rarity**: Rare
- **Buffs/Modifiers**:
  - Exhaust
  - Vulnerable (1 stack)
- **Effect**: Taunt all enemies. Apply 1 Vulnerable to self

`Iron Will`
- **Type**: Skill
- **Energy Cost**: 1
- **Rarity**: Rare
- **Buffs/Modifiers**:
  - Exhaust
- **Effect**: Owner gains 2 Stress. For three turns, take half damage

`Last Bastion`
- **Type**: Skill
- **Energy Cost**: 2
- **Rarity**: Rare
- **Base Stats**:
  - Block: 20
- **Buffs/Modifiers**:
  - Exhaust
- **Effect**: All party members gain 20 Block. Party members with >4 Stress gain 2 Strength. Sacrifice a card

`Quartermaster`
- **Type**: Skill
- **Energy Cost**: 2
- **Rarity**: Rare
- **Buffs/Modifiers**: None
- **Effect**: Manufacture a Buzzsword for each living party member. Each Buzzsword costs 1 less and exhausts

`Queen's Mandate`
- **Type**: Skill
- **Energy Cost**: 2
- **Rarity**: Rare
- **Buffs/Modifiers**: None
- **Effect**: Increase Venture and Pages by 2. All cards in hand gain defense scaling from Pages and offense scaling from Venture

## Blackhand Class Cards

### Commons
`Fire Axe`
- **Type**: Attack
- **Energy Cost**: 1
- **Rarity**: Common
- **Base Stats**:
  - Damage: 8
  - Magic Number: 2
- **Buffs/Modifiers**: None
- **Effect**: Deal 8 damage. Apply 2 Burning

`Flame Pistol`
- **Type**: Attack
- **Energy Cost**: 1
- **Rarity**: Common
- **Base Stats**:
  - Damage: 4
  - Magic Number: 2
- **Resource Scaling**:
  - Resource: smog
  - Scaling Type: magicNumberScaling
  - Scaling Value: 1
- **Buffs/Modifiers**: None
- **Effect**: Deal 4 damage. Apply 2 Burning

`Pocket Vial`
- **Type**: Attack
- **Energy Cost**: 1
- **Rarity**: Common
- **Base Stats**:
  - Damage: 5
  - Magic Number: 1
- **Buffs/Modifiers**:
  - Volatile
- **Effect**: Deal 5 damage. Apply 1 Weak. Increase damage by 1 for each Burning on target

`Re-ignition`
- **Type**: Skill
- **Energy Cost**: 1
- **Rarity**: Common
- **Base Stats**:
  - Block: 5
  - Magic Number: 3
- **Buffs/Modifiers**: None
- **Effect**: Target ally gains 5 Block. Apply 3 Burning to all enemies

`Storm Cloak`
- **Type**: Skill
- **Energy Cost**: 1
- **Rarity**: Common
- **Base Stats**:
  - Block: 8
- **Resource Scaling**:
  - Resource: pluck
  - Scaling Type: blockScaling
  - Scaling Value: 2
- **Buffs/Modifiers**: None
- **Effect**: Grant 8 Block to the targeted character

### Uncommons
`And Then He Exploded`
- **Type**: Attack
- **Energy Cost**: 1
- **Rarity**: Uncommon
- **Base Stats**:
  - Damage: 8
- **Buffs/Modifiers**:
  - Explosive Finish (10 stacks)
- **Effect**: Deal 8 damage. If target has Burning, deal damage again

`Axe Me a Question`
- **Type**: Attack
- **Energy Cost**: 2
- **Rarity**: Uncommon
- **Base Stats**:
  - Damage: 11
- **Buffs/Modifiers**:
  - Axe Crit Buff
- **Effect**: Deal 11 damage. Crits against Burning enemies

`Hazmat Specialist`
- **Type**: Skill
- **Energy Cost**: 1
- **Rarity**: Uncommon
- **Base Stats**:
  - Block: 6
  - Magic Number: 3
- **Buffs/Modifiers**: None
- **Effect**: Grant 6 Block and 1 Ward to ALL party members. Apply 3 Burning to a random enemy

`Smokescreen`
- **Type**: Skill
- **Energy Cost**: 1
- **Rarity**: Uncommon
- **Base Stats**:
  - Block: 6
  - Magic Number: 2
- **Buffs/Modifiers**:
  - Exhaust
- **Effect**: All party members gain 6 Block. Apply 2 Burning to all enemies

### Rares
`Infernalite Cache`
- **Type**: Skill
- **Energy Cost**: 1
- **Rarity**: Rare
- **Base Stats**:
  - Magic Number: 6
- **Buffs/Modifiers**: None
- **Effect**: Gain 6 Pages

`Pyrestarter`
- **Type**: Skill
- **Energy Cost**: 2
- **Rarity**: Rare
- **Base Stats**:
  - Block: 6
  - Magic Number: 3
- **Buffs/Modifiers**: None
- **Effect**: Apply 6 Block to ALL party members. For the rest of the turn, party attacks apply 3 Burning per hit

`Toxic Spill`
- **Type**: Skill
- **Energy Cost**: 2
- **Rarity**: Rare
- **Base Stats**:
  - Magic Number: 6
- **Buffs/Modifiers**:
  - Volatile
- **Effect**: Apply 4 Burning, 6 Poison, and 1 Weak to an enemy

## Diabolist Class Cards

### Commons
`Cursed Strike`
- **Type**: Attack
- **Energy Cost**: 1
- **Rarity**: Common
- **Base Stats**:
  - Damage: 7
  - Magic Number: 1
- **Buffs/Modifiers**: None
- **Effect**: Deal 7 damage. Apply 1 Cursed. If >3 Blood, apply 1 more Cursed

`Dark Whisper`
- **Type**: Skill
- **Energy Cost**: 1
- **Rarity**: Common
- **Base Stats**:
  - Block: 4
  - Magic Number: 2
- **Buffs/Modifiers**: None
- **Effect**: Apply 2 Poisoned to all enemies. Apply 4 Block to all allies

`Lifesteal`
- **Type**: Attack
- **Energy Cost**: 1
- **Rarity**: Common
- **Base Stats**:
  - Damage: 4
  - Magic Number: 4
- **Resource Scaling**:
  - Resource: smog
  - Scaling Type: magicNumberScaling
  - Scaling Value: 1
  - Resource: blood
  - Scaling Type: attackScaling
  - Scaling Value: 1
- **Buffs/Modifiers**:
  - Sacrifice
- **Effect**: Deal 4 damage. Restore 4 health

`Obsidian Candles`
- **Type**: Power
- **Energy Cost**: 2
- **Rarity**: Common
- **Buffs/Modifiers**: None
- **Effect**: Manufacture an Eldritch Smoke. Draw 2 cards. Whenever you Sacrifice, manufacture an Eldritch Smoke

### Uncommons
`Burning Sight`
- **Type**: Skill
- **Energy Cost**: 2
- **Rarity**: Uncommon
- **Base Stats**:
  - Magic Number: 3
- **Buffs/Modifiers**:
  - BloodPrice (2 stacks)
- **Effect**: Exhaust the top 2 cards of your deck. Gain 3 Pages

`Eldritch Blast`
- **Type**: Attack
- **Energy Cost**: 2
- **Rarity**: Uncommon
- **Base Stats**:
  - Damage: 12
- **Buffs/Modifiers**:
  - BloodPrice (3 stacks)
- **Effect**: Deal 12 damage. Add an Eldritch Smoke to your hand

`Soul Trap`
- **Type**: Attack
- **Energy Cost**: 2
- **Rarity**: Uncommon
- **Base Stats**:
  - Damage: 9
- **Buffs/Modifiers**: None
- **Effect**: Deal 9 damage. If Fatal: gain 2 max HP and exhaust

`Unnatural Vigor`
- **Type**: Power
- **Energy Cost**: 1
- **Rarity**: Uncommon
- **Base Stats**:
  - Magic Number: 2
- **Buffs/Modifiers**:
  - Sacrifice
- **Effect**: Gain 2 Blood

### Rares
`Balefire`
- **Type**: Attack
- **Energy Cost**: 4
- **Rarity**: Rare
- **Base Stats**:
  - Damage: 12
- **Resource Scaling**:
  - Resource: blood
  - Scaling Type: attackScaling
  - Scaling Value: 1
- **Buffs/Modifiers**:
  - BloodPrice (3 stacks)
  - GiantKiller (1 stack)
  - Exhaust
  - DamageIncreaseOnKill (5 stacks)
- **Effect**: Deal 12 damage 2 times, plus 1 time for each Curse the target has. Decreases max HP of owner by 3. If kills something, gain 3 max HP

`Cursed Blade`
- **Type**: Attack
- **Energy Cost**: 1
- **Rarity**: Rare
- **Base Stats**:
  - Damage: 14
- **Resource Scaling**:
  - Resource: mettle
  - Scaling Type: attackScaling
  - Scaling Value: 1
- **Buffs/Modifiers**:
  - CursedBladeBuff (10 stacks)
- **Effect**: Deal 14 damage. At combat start, apply We Thirst to owner

`Horrific Regeneration`
- **Type**: Skill
- **Energy Cost**: 0
- **Rarity**: Rare
- **Base Stats**:
  - Magic Number: 10
- **Buffs/Modifiers**:
  - Exhaust
- **Effect**: All party members heal 10 HP. They also gain 4 Stress

`Strength of Insanity`
- **Type**: Power
- **Energy Cost**: 1
- **Rarity**: Rare
- **Base Stats**:
  - Magic Number: 4
- **Buffs/Modifiers**:
  - IncreasePluck (1 stack)
- **Effect**: All allies gain 4 Lethality. If >10 stress, repeat. If >30 stress, repeat again

## Cog Class Cards

### Commons
`Eldritch Gear Grind`
- **Type**: Attack
- **Energy Cost**: 1
- **Rarity**: Common
- **Base Stats**:
  - Damage: 6
- **Resource Scaling**:
  - Resource: mettle
  - Scaling Type: attackScaling
  - Scaling Value: 2
- **Buffs/Modifiers**: None
- **Effect**: Deal 6 damage. Gain 1 Mettle. The gears whisper secrets.

`Veil of the Smog`
- **Type**: Skill
- **Energy Cost**: 1
- **Rarity**: Common
- **Base Stats**:
  - Block: 7
- **Resource Scaling**:
  - Resource: smog
  - Scaling Type: blockScaling
  - Scaling Value: 1
- **Buffs/Modifiers**: None
- **Effect**: Gain 7 Block. Gain 1 Smog. The smog obscures reality.

`Tinker's Revelation`
- **Type**: Skill
- **Energy Cost**: 1
- **Rarity**: Common
- **Base Stats**:
  - Magic Number: 2
- **Buffs/Modifiers**: None
- **Effect**: Draw 2 cards. If any card has a cost of 2, gain 1 Pluck. The revelation is unsettling.

`Clockwork Minion`
- **Type**: Power
- **Energy Cost**: 1
- **Rarity**: Common
- **Buffs/Modifiers**:
  - Autonomous 2
- **Effect**: Whenever you play a card costing 2, gain 1 Venture. It moves with a mind of its own.

`Eldritch Fist`
- **Type**: Attack
- **Energy Cost**: 1
- **Rarity**: Common
- **Base Stats**:
  - Damage: 5
- **Buffs/Modifiers**: None
- **Effect**: Deal 5 damage. If you have more than 3 Ashes, deal 2 additional damage. The fist pulses with dark energy.

### Uncommons
`Arcane Overdrive`
- **Type**: Skill
- **Energy Cost**: 2
- **Rarity**: Uncommon
- **Base Stats**:
  - Block: 10
- **Resource Scaling**:
  - Resource: smog
  - Scaling Type: blockScaling
  - Scaling Value: 2
- **Buffs/Modifiers**: None
- **Effect**: Gain 10 Block. If you have more than 5 Smog, gain 1 extra energy. The overdrive hums with forbidden power.

`Eldritch Tinkerer`
- **Type**: Power
- **Energy Cost**: 1
- **Rarity**: Uncommon
- **Buffs/Modifiers**:
  - Autonomous 3
- **Effect**: Whenever you play a card costing 3, draw a card. The tinkerer whispers secrets of the void.

`Abyssal Cannon`
- **Type**: Attack
- **Energy Cost**: 2
- **Rarity**: Uncommon
- **Base Stats**:
  - Damage: 12
- **Resource Scaling**:
  - Resource: mettle
  - Scaling Type: attackScaling
  - Scaling Value: 1
- **Buffs/Modifiers**: None
- **Effect**: Deal 12 damage. If you have more than 3 Mettle, apply 1 Weak. The cannon fires with a roar from the abyss.

### Rares
`Eldritch Colossus`
- **Type**: Power
- **Energy Cost**: 3
- **Rarity**: Rare
- **Buffs/Modifiers**:
  - Autonomous 2
- **Effect**: Whenever you play a card costing 2, gain 2 Block and 1 Ash. The colossus looms with an ancient presence.

`Arcane Machination`
- **Type**: Skill
- **Energy Cost**: 2
- **Rarity**: Rare
- **Base Stats**:
  - Magic Number: 5
- **Resource Scaling**:
  - Resource: smog
  - Scaling Type: magicNumberScaling
  - Scaling Value: 2
  
- **Buffs/Modifiers**: None
- **Effect**: Gain 5 Smog. All cards in hand gain 1 additional effect based on their type. The machination twists reality.

`Eldritch Revolution`
- **Type**: Attack
- **Energy Cost**: 3
- **Rarity**: Rare
- **Base Stats**:
  - Damage: 15
- **Resource Scaling**:
  - Resource: venture
  - Scaling Type: attackScaling
  - Scaling Value: 2
- **Buffs/Modifiers**: None
- **Effect**: Deal 15 damage. If you have more than 5 Venture, deal 5 additional damage to all enemies. The revolution is fueled by the unknown.

## Cargo Cards

`Alcohol Cargo`
- **Type**: Item
- **Energy Cost**: 1
- **Rarity**: Common
- **Buffs/Modifiers**:
  - HellSellValue (40 stacks)
- **Effect**: Decrease stress of all allies by 2. Decrease the HellSellValue buff on this card by 5

`Coal Cargo`
- **Type**: Item
- **Energy Cost**: 1
- **Rarity**: Common
- **Buffs/Modifiers**:
  - HellSellValue (85 stacks)
  - Heavy
- **Effect**: Draw 1 card

`Coffee Cargo`
- **Type**: Item
- **Energy Cost**: 0
- **Rarity**: Common
- **Buffs/Modifiers**:
  - HellSellValue (50 stacks)
- **Effect**: Draw 2 cards. Decrease the HellSellValue buff on this card by 10

`Sacred Relics Cargo`
- **Type**: Item
- **Energy Cost**: 1
- **Rarity**: Common
- **Base Stats**:
  - Damage: 15
- **Buffs/Modifiers**:
  - HellSellValue (50 stacks)
- **Effect**: Draw a card. All Devils take 15 damage. Decrease the HellSellValue buff on this card by 15

`Spicy Literature Cargo`
- **Type**: Item
- **Energy Cost**: 1
- **Rarity**: Common
- **Buffs/Modifiers**:
  - HellSellValue (55 stacks)
- **Effect**: Draw a card
```
