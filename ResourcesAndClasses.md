# Combat Resources

Combat resources represent different types of power that can be accumulated during combat. Each resource has specific mechanical effects when clicked or triggered:

## Blood (Powder)
- **Icon**: blood_icon
- **Color**: Red (0xff0000)
- **Click Effect**: Spend 2 Blood to gain 1 Energy

## Mettle (Iron)
- **Icon**: iron_icon
- **Color**: Gray (0x808080)
- **Click Effect**: Spend 1 Mettle to grant 3 Block to ALL characters (including enemies)

## Ashes
- **Icon**: ashes_icon
- **Color**: Beige (0xF5F5DC)
- **Passive Effect**: At end of combat:
  - At 4+ Ashes: Gain one additional card reward option
  - At 10+ Ashes: Gain two additional card reward options

## Pluck
- **Icon**: feather_icon
- **Color**: Green (0x00ff00)
- **Click Effect**: Spend 1 Pluck to grant 2 Temporary Lethality to all allies

## Smog
- **Icon**: smog_icon
- **Color**: Brown (0x8B4513)
- **Click Effect**: Spend 2 Smog to return a chosen card from discard pile to hand
- **Implementation Details**: 
  - Opens card selection UI for discard pile
  - Selection is cancellable
  - Requires at least one card in discard pile

## Venture
- **Icon**: venture_icon
- **Color**: Gold (0xFFD700)
- **Click Effect**: Spend 1 Venture to draw a card

# Basic Procs

Core game mechanics that can be triggered by cards and effects:

## SacrificeACardOtherThan
- **Description**: Exhausts a card from hand (excluding the triggering card)
- **Parameters**: Optional triggering card to exclude from sacrifice selection
- **Event**: Broadcasts a SacrificeEvent when complete
- **Implementation Details**: 
  - Selects from current hand
  - If triggering card is in hand, it cannot be selected
  - Always exhausts the rightmost eligible card
  - No effect if hand is empty

## Exert
- **Description**: Converts available energy into effects at a specified ratio
- **Parameters**: 
  - Card that is exerting energy
  - Maximum amount of energy to exert
  - Callback function that receives the amount of energy exerted
- **Implementation Details**:
  - Cannot exert more than current available energy
  - If no energy available, proc has no effect
  - Reduces combat energy pool by amount exerted
  - Callback is only called if energy was actually exerted
- **Event**: Broadcasts an ExertEvent when complete

## Barrage
- **Description**: Opens a card selection interface allowing the player to select multiple cards to discard
- **Parameters**: Card triggering the barrage effect
- **Implementation Details**:
  - Selection is cancellable
  - Minimum 1 card must be selected
  - Maximum 10 cards can be selected
  - Selected cards are actively discarded (not exhausted)
- **Event**: Broadcasts a BarrageEvent when complete

## Taunt
- **Description**: Forces an enemy to target a specific character with their intents
- **Parameters**: 
  - Target enemy being taunted
  - Owner character that will be targeted
- **Implementation Details**:
  - Modifies all current intents of the target enemy
  - Changes target of each intent to the owner
  - Affects all intents currently queued
- **Event**: Broadcasts a TauntEvent when complete

## ManufactureCardToHand
- **Description**: Creates a new card and adds it directly to the player's hand
- **Parameters**: Card to manufacture and add to hand
- **Implementation Details**:
  - Card is added to current hand immediately
  - No maximum hand size check
  - Does not trigger shuffle effects
- **Event**: Broadcasts a ManufactureEvent when complete 