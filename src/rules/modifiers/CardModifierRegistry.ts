import { Buster } from "../../gamecharacters/buffs/playable_card/Buster";
import { Doubled } from "../../gamecharacters/buffs/playable_card/Doubled";
import { Heavy } from "../../gamecharacters/buffs/playable_card/Heavy";
import { Lightweight } from "../../gamecharacters/buffs/playable_card/Lightweight";
import { Painful } from "../../gamecharacters/buffs/playable_card/Painful";
import { Damaged } from "../../gamecharacters/buffs/playable_card/SaleTags/Damaged";
import { OnSale } from "../../gamecharacters/buffs/playable_card/SaleTags/OnSale";
import { BloodPriceBuff } from "../../gamecharacters/buffs/standard/Bloodprice";
import { IncreaseBlood } from "../../gamecharacters/buffs/standard/combatresource/IncreaseBlood";
import { IncreaseIron } from "../../gamecharacters/buffs/standard/combatresource/IncreaseMetal";
import { IncreasePluck } from "../../gamecharacters/buffs/standard/combatresource/IncreasePluck";
import { IncreaseSmog } from "../../gamecharacters/buffs/standard/combatresource/IncreaseSmog";
import { IncreaseVenture } from "../../gamecharacters/buffs/standard/combatresource/IncreaseVenture";
import { GrowingPowerBuff } from "../../gamecharacters/buffs/standard/GrowingPower";
import { HellSellValue } from "../../gamecharacters/buffs/standard/HellSellValue";
import { SacrificeBuff } from "../../gamecharacters/buffs/standard/SacrificeBuff";
import { SurfaceSellValue } from "../../gamecharacters/buffs/standard/SurfaceSellValue";
import { EntityRarity } from "../../gamecharacters/PlayableCard";
import { CardModifier } from "./AbstractCardModifier";

export class CardModifierRegistry {
    private static instance: CardModifierRegistry;

    public static getInstance(): CardModifierRegistry {
        if (!CardModifierRegistry.instance) {
            CardModifierRegistry.instance = new CardModifierRegistry();
        }
        return CardModifierRegistry.instance;
    }

    // Positive modifiers (powerLevelChange > 0)
    public readonly positiveModifiers: CardModifier[] = [
        // Resource gain modifiers
        new CardModifier({
            name: "Iron Gain",
            modifier: card => {
                card.buffs.push(new IncreaseIron());
                card.name += "⚔️";
            },
            powerLevelChange: 1
        }),
        new CardModifier({
            name: "Blood Gain",
            modifier: card => {
                card.buffs.push(new IncreaseBlood());
                card.name += "🩸";
            },
            powerLevelChange: 1
        }),
        new CardModifier({
            name: "Pluck Gain",
            modifier: card => {
                card.buffs.push(new IncreasePluck(1));
                card.name += "🎭";
            },
            powerLevelChange: 1
        }),
        new CardModifier({
            name: "Smog Gain",
            modifier: card => {
                card.buffs.push(new IncreaseSmog());
                card.name += "💨";
            },
            powerLevelChange: 1
        }),
        new CardModifier({
            name: "Venture Gain",
            modifier: card => {
                card.buffs.push(new IncreaseVenture());
                card.name += "🎲";
            },
            powerLevelChange: 1
        }),
        // Upgrade modifiers
        new CardModifier({
            name: "Cost Reduction",
            modifier: card => {
                card.baseEnergyCost -= 1;
                card.name += "💧";
            },
            eligible: card => card.baseEnergyCost > 1,
            weight: 2,
            powerLevelChange: 1
        }),
        new CardModifier({
            name: "Magic Number Up",
            modifier: card => {
                card.baseMagicNumber += 1;
                card.name += "🔮";
            },
            eligible: card => card.baseMagicNumber != 0,
            weight: 2,
            powerLevelChange: 1
        }),
        new CardModifier({
            name: "Double Cast",
            modifier: card => {
                card.buffs.push(new Doubled());
                card.baseEnergyCost += 1;
                card.name += "🔄🔄";
            },
            powerLevelChange: 1
        }),
        new CardModifier({
            name: "Lightweight",
            modifier: card => {
                card.buffs.push(new Lightweight(3));
                card.name += "🪶";
            },
            powerLevelChange: 1
        }),
        new CardModifier({
            name: "Growing Power",
            modifier: card => {
                card.buffs.push(new GrowingPowerBuff(1));
                card.name += "🌱";
            },
            eligible: card => card.baseDamage > 0,
            powerLevelChange: 1
        }),
        new CardModifier({
            name: "Buster",
            modifier: card => {
                card.buffs.push(new Buster(1));
                card.name += "🔪";
            },
            eligible: card => card.baseDamage > 0,
            powerLevelChange: 1
        }),
        new CardModifier({
            name: "Surface Value",
            modifier: card => {
                card.buffs.push(new SurfaceSellValue(30));
                card.name += "💰";
            },
            powerLevelChange: 1
        }),
    ];

    // Negative modifiers (powerLevelChange < 0)
    public readonly negativeModifiers: CardModifier[] = [
        new CardModifier({
            name: "Damaged Sale",
            modifier: card => {
                card.applyBuffs_useFromActionManager([new Damaged(1)]);
                card.applyBuffs_useFromActionManager([new OnSale(90)]);
                card.name += "?";
            },
            eligible: card => card.rarity.isAtLeastAsRareAs(EntityRarity.RARE),
            powerLevelChange: -1,
            probability: 0.2
        }),
        new CardModifier({
            name: "Heavy",
            modifier: card => {
                card.applyBuffs_useFromActionManager([new Heavy()]);
                card.applyBuffs_useFromActionManager([new OnSale(90)]);
                card.name += "?";
            },
            eligible: card => card.rarity.isAtLeastAsRareAs(EntityRarity.UNCOMMON),
            powerLevelChange: -1,
            probability: 0.2
        }),
        new CardModifier({
            name: "Painful",
            modifier: card => {
                card.buffs.push(new Painful(1));
                card.name += "🙃";
            },
            powerLevelChange: -1
        }),
        new CardModifier({
            name: "Blood Price",
            modifier: card => {
                card.buffs.push(new BloodPriceBuff(3));
                card.buffs.push(new SacrificeBuff());
                card.name += "🖤";
            },
            eligible: card => card.baseEnergyCost > 0,
            powerLevelChange: -1
        }),
        new CardModifier({
            name: "Hell Value",
            modifier: card => {
                card.buffs.push(new HellSellValue(10));
                card.name += "🔥";
            },
            powerLevelChange: -1
        }),
    ];

    public getRandomPositiveModifier(): CardModifier {
        const totalWeight = this.positiveModifiers.reduce((sum, mod) => sum + mod.weight, 0);
        let random = Math.random() * totalWeight;
        
        for (const modifier of this.positiveModifiers) {
            random -= modifier.weight;
            if (random <= 0) {
                return modifier;
            }
        }
        return this.positiveModifiers[0];
    }

    public getRandomNegativeModifier(): CardModifier {
        const totalWeight = this.negativeModifiers.reduce((sum, mod) => sum + mod.weight, 0);
        let random = Math.random() * totalWeight;
        
        for (const modifier of this.negativeModifiers) {
            random -= modifier.weight;
            if (random <= 0) {
                return modifier;
            }
        }
        return this.negativeModifiers[0];
    }
} 