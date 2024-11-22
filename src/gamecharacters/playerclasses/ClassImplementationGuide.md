# Comprehensive Character Class Implementation Guide

## Overview
This guide provides a detailed walkthrough of implementing a character class in the game system, using the Diabolist class as a comprehensive example.

## Core Components

### 1. Character Class Definition
```typescript
export class DiabolistClass extends BaseCharacterClass {
    constructor() {
        super({ 
            name: "Diabolist", 
            id: CharacterClasses.DIABOLIST_ID, 
            iconName: "diabolist_icon", 
            startingMaxHp: 20 
        });
        
        // Set unique card background
        this.cardBackgroundImageName = "diabolist_background";
        
        // Populate available cards
        this.availableCards = [
            // Common cards
            new CursedStrike(),
            new DarkWhisper(),
            new ObsidianCandles(),
            
            // Uncommon cards
            new BurningSight(),
            new EldritchBlast(),
            new SoulTrap(),
            new UnnaturalVigor(),
            
            // Rare cards
            new Balefire(),
            new CursedBlade(),
            new HorrificRegeneration(),
            new StrengthOfInsanity()
        ];
    }

    // Implement portrait selection method
    getPortraitNameAtRandom(gender: Gender): string {
        return ImageUtils.getRandomImageNameFromCategory(
            `portraits_diabolist_${gender === Gender.Female ? "female" : "male"}` 
            as "portraits_diabolist_female"
        );
    }
}
```

### 2. Card Selection Strategy
- **Rarity Distribution**: Balanced mix of common, uncommon, and rare cards
- **Thematic Consistency**: Cards reflect class identity (blood magic, sacrifice, curses)
- **Mechanical Diversity**: Different card types (attack, skill, power) with varied effects

### 3. Resource Scaling
Diabolist primarily scales from Blood resource:
```typescript
this.resourceScalings.push({
    resource: this.blood,
    attackScaling: 1,
    // Other potential scalings like magicNumberScaling
});
```

### 4. Persona Traits
Potential persona traits for Diabolist:
- Blood Knight
- Soul Trapper
- Dark Scholar

### 5. Card Design Principles
- High-risk, high-reward mechanics
- Sacrifice and blood payment themes
- Ability to manipulate stress and curses

## Example Card Breakdown: Balefire

### Card Implementation
```typescript
export class Balefire extends PlayableCard {
    constructor() {
        super({
            name: "Balefire",
            cardType: CardType.ATTACK,
            targetingType: TargetingType.ENEMY,
            rarity: EntityRarity.RARE,
        });
        
        // Base stats
        this.baseEnergyCost = 4;
        this.baseDamage = 12;
        
        // Unique buffs
        this.buffs.push(new BloodPriceBuff(3));
        this.buffs.push(new GiantKiller(1));
        this.buffs.push(new ExhaustBuff());
        
        // Resource scaling
        this.resourceScalings.push({
            resource: this.blood,
            attackScaling: 1,
        });
    }

    override InvokeCardEffects(targetCard?: AbstractCard): void {
        const target = targetCard as BaseCharacter;
        if (!target) return;

        // Damage scaling with curse count
        const damageMultiplier = 1 + target.getBuffStacks(new Cursed(1).getName());
        
        // Multiple damage instances
        for (let i = 0; i < damageMultiplier; i++) {
            this.dealDamageToTarget(target);
        }

        // Self-damage mechanic
        const owner = this.owner as BaseCharacter;
        if (owner) {
            owner.maxHitpoints -= 3;
            owner.hitpoints = Math.min(owner.hitpoints, owner.maxHitpoints);
        }
    }
}
```

### Design Analysis
- High energy cost (4)
- Significant self-damage mechanic
- Damage scales with target's curse count
- Exhaust effect limits reusability

## Best Practices
1. Maintain thematic consistency
2. Balance risk and reward
3. Create interesting interaction between cards
4. Use resource scaling thoughtfully
5. Implement unique mechanical hooks

## Performance Considerations
- Use `Copy()` for card instantiation
- Leverage resource scaling
- Minimize complex calculations in `InvokeCardEffects`

## Testing Recommendations
- Unit test individual card effects
- Verify resource scaling
- Check edge cases in damage calculation
- Test interaction with other cards and buffs
```
