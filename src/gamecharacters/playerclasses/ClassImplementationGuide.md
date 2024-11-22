# Card Implementation Technical Guide

## Card Class Structure
```typescript
export class [CardName] extends PlayableCard {
    constructor() {
        super({
            name: "[Card Name]",
            cardType: CardType.[CARD_TYPE],
            targetingType: TargetingType.[TARGETING_TYPE],
            rarity: EntityRarity.[RARITY],
        });

        // Base Card Stats
        this.baseEnergyCost = [ENERGY_COST];
        this.baseDamage = [BASE_DAMAGE];
        this.baseBlock = [BASE_BLOCK];
        this.baseMagicNumber = [BASE_MAGIC_NUMBER];

        // Resource Scaling
        this.resourceScalings.push({
            resource: this.[RESOURCE_TYPE], // e.g. this.blood, this.pluck
            [SCALING_TYPE]: [SCALING_VALUE], // attackScaling, blockScaling, magicNumberScaling
        });

        // Card Buffs/Modifiers
        this.buffs.push(new [BuffType]([BuffStacks]));
    }

    override get description(): string {
        return `[Detailed card effect description using getDisplayed methods]`;
    }

    override InvokeCardEffects(targetCard?: AbstractCard): void {
        // Implement core card mechanics
        // Use methods like:
        // - this.dealDamageToTarget()
        // - this.applyBlockToTarget()
        // - this.actionManager methods
    }
}
```

## Key Implementation Considerations

### 1. Base Stats
- `baseEnergyCost`: Card's energy cost
- `baseDamage`: Base damage value
- `baseBlock`: Base block value
- `baseMagicNumber`: Auxiliary numeric value for effects

### 2. Resource Scaling
- Use `resourceScalings` to dynamically modify card stats
- Scaling types: `attackScaling`, `blockScaling`, `magicNumberScaling`
- Resources: `blood`, `pluck`, `mettle`, `venture`, `smog`, `pages`

### 3. Buffs and Modifiers
- Add buffs in constructor using `this.buffs.push()`
- Common buffs: 
  - `BloodPriceBuff`
  - `ExhaustBuff`
  - `SacrificeBuff`
  - Class-specific buffs

### 4. Description Method
- Use `getDisplayedX()` methods for dynamic stat display
- Include scaling and conditional effects

### 5. InvokeCardEffects
- Implement core card mechanics
- Handle targeting and effect application
- Use action manager methods for game state changes

## Performance and Best Practices
- Keep calculations simple and deterministic
- Use resource scaling for dynamic card power
- Implement clear, thematic card mechanics
- Consider card interactions and potential combos
```
