import { Buster } from "../../gamecharacters/buffs/playable_card/Buster";
import { Doubled } from "../../gamecharacters/buffs/playable_card/Doubled";
import { Heavy } from "../../gamecharacters/buffs/playable_card/Heavy";
import { Lightweight } from "../../gamecharacters/buffs/playable_card/Lightweight";
import { Painful } from "../../gamecharacters/buffs/playable_card/Painful";
import { Damaged } from "../../gamecharacters/buffs/playable_card/SaleTags/Damaged";
import { OnSale } from "../../gamecharacters/buffs/playable_card/SaleTags/OnSale";
import { BloodPriceBuff } from "../../gamecharacters/buffs/standard/Bloodprice";
import { IncreaseBlood } from "../../gamecharacters/buffs/standard/combatresource/IncreaseBlood";
import { IncreaseIron as IncreaseMettle } from "../../gamecharacters/buffs/standard/combatresource/IncreaseMetal";
import { IncreasePluck } from "../../gamecharacters/buffs/standard/combatresource/IncreasePluck";
import { IncreaseSmog } from "../../gamecharacters/buffs/standard/combatresource/IncreaseSmog";
import { IncreaseVenture } from "../../gamecharacters/buffs/standard/combatresource/IncreaseVenture";
import { GrowingPowerBuff } from "../../gamecharacters/buffs/standard/GrowingPower";
import { HellSellValue } from "../../gamecharacters/buffs/standard/HellSellValue";
import { SurfaceSellValue } from "../../gamecharacters/buffs/standard/SurfaceSellValue";
import { EntityRarity } from "../../gamecharacters/PlayableCard";
import { TextGlyphs } from "../../text/TextGlyphs";
import { CardModifier, ModifierContext } from "./AbstractCardModifier";

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
        // Resource gain modifiers - these make sense in rest sites and rewards
        new CardModifier({
            name: "Mettle Gain",
            modifier: card => {
                card.buffs.push(new IncreaseMettle().withoutShowingUpInBuffs());
                card.name += TextGlyphs.getInstance().mettleIcon;
            },
            powerLevelChange: 1,
            contextsApplicable: [ModifierContext.SHOP, ModifierContext.CARD_REWARD, ModifierContext.REST_SITE_UPGRADE]
        }),
        new CardModifier({
            name: "Blood Gain",
            modifier: card => {
                card.buffs.push(new IncreaseBlood().withoutShowingUpInBuffs());
                card.name += TextGlyphs.getInstance().bloodIcon;
            },
            powerLevelChange: 1,
            contextsApplicable: [ModifierContext.SHOP, ModifierContext.CARD_REWARD, ModifierContext.REST_SITE_UPGRADE]
        }),
        new CardModifier({
            name: "Pluck Gain",
            modifier: card => {
                card.buffs.push(new IncreasePluck(1).withoutShowingUpInBuffs());
                card.name += TextGlyphs.getInstance().pluckIcon;
            },
            powerLevelChange: 1,
            contextsApplicable: [ModifierContext.REST_SITE_UPGRADE, ModifierContext.CARD_REWARD]
        }),
        new CardModifier({
            name: "Smog Gain",
            modifier: card => {
                card.buffs.push(new IncreaseSmog().withoutShowingUpInBuffs());
                card.name += TextGlyphs.getInstance().smogIcon;
            },
            powerLevelChange: 1,
            contextsApplicable: [ModifierContext.REST_SITE_UPGRADE, ModifierContext.CARD_REWARD]
        }),
        new CardModifier({
            name: "Venture Gain",
            modifier: card => {
                card.buffs.push(new IncreaseVenture().withoutShowingUpInBuffs());
                card.name += TextGlyphs.getInstance().ventureIcon;
            },
            powerLevelChange: 1,
            contextsApplicable: [ModifierContext.REST_SITE_UPGRADE, ModifierContext.CARD_REWARD]
        }),
        // Upgrade modifiers - these make sense everywhere
        new CardModifier({
            name: "Cost Reduction",
            modifier: card => {
                card.baseEnergyCost -= 1;
                card.name += "💧";
            },
            eligible: card => card.baseEnergyCost > 1,
            weight: 2,
            powerLevelChange: 1,
            contextsApplicable: [ModifierContext.REST_SITE_UPGRADE, ModifierContext.CARD_REWARD]
        }),
        new CardModifier({
            name: "Magic Number Up",
            modifier: card => {
                card.baseMagicNumber += 1;
                card.name += "🔮";
            },
            eligible: card => card.baseMagicNumber != 0,
            weight: 2,
            powerLevelChange: 1,
            contextsApplicable: [ModifierContext.REST_SITE_UPGRADE, ModifierContext.CARD_REWARD]
        }),
        new CardModifier({
            name: "Double Cast",
            modifier: card => {
                card.buffs.push(new Doubled().withoutShowingUpInBuffs());
                card.baseEnergyCost += 1;
                card.name += "🔄🔄";
            },
            powerLevelChange: 1,
            contextsApplicable: [ModifierContext.REST_SITE_UPGRADE, ModifierContext.CARD_REWARD]
        }),
        new CardModifier({
            name: "Lightweight",
            modifier: card => {
                card.buffs.push(new Lightweight(3).withoutShowingUpInBuffs());
                card.name += "🪶";
            },
            powerLevelChange: 1,
            contextsApplicable: [ModifierContext.REST_SITE_UPGRADE, ModifierContext.CARD_REWARD]
        }),
        new CardModifier({
            name: "Growing Power",
            modifier: card => {
                card.buffs.push(new GrowingPowerBuff(1).withoutShowingUpInBuffs());
                card.name += "🌱";
            },
            eligible: card => card.baseDamage > 0,
            powerLevelChange: 1,
            contextsApplicable: [ModifierContext.REST_SITE_UPGRADE, ModifierContext.CARD_REWARD]
        }),
        new CardModifier({
            name: "Buster",
            modifier: card => {
                card.buffs.push(new Buster(1).withoutShowingUpInBuffs());
                card.name += "🔪";
            },
            eligible: card => card.baseDamage > 0,
            powerLevelChange: 1,
            contextsApplicable: [ModifierContext.REST_SITE_UPGRADE, ModifierContext.CARD_REWARD]
        }),
        new CardModifier({
            name: "Surface Value",
            modifier: card => {
                card.buffs.push(new SurfaceSellValue(30).withoutShowingUpInBuffs());
                card.name += "💰";
            },
            powerLevelChange: 1,
            contextsApplicable: [ModifierContext.SHOP, ModifierContext.CARD_REWARD, ModifierContext.REST_SITE_UPGRADE]
        }),
        new CardModifier({
            name: "Hell Value",
            modifier: card => {
                card.buffs.push(new HellSellValue(10).withoutShowingUpInBuffs());
                card.name += "🔥";
            },
            powerLevelChange: 0,
            contextsApplicable: [ModifierContext.SHOP, ModifierContext.CARD_REWARD, ModifierContext.REST_SITE_UPGRADE]
        }),
        new CardModifier({
            name: "Blood Price",
            modifier: card => {
                card.buffs.push(new BloodPriceBuff(3).withoutShowingUpInBuffs());
                card.name += "🖤";
            },
            eligible: card => card.baseEnergyCost > 0,
            powerLevelChange: +1,
            contextsApplicable: [ModifierContext.CARD_REWARD, ModifierContext.SHOP] // Makes sense in both shop and rewards
        }),
    ];

    // Negative modifiers (powerLevelChange < 0)
    public readonly negativeModifiers: CardModifier[] = [
        new CardModifier({
            name: "Damaged Sale",
            modifier: card => {
                card.applyBuffs_useFromActionManager([new Damaged(1).withoutShowingUpInBuffs()]);
                card.applyBuffs_useFromActionManager([new OnSale(90)]);
                card.name += "?";
            },
            eligible: card => card.rarity.isAtLeastAsRareAs(EntityRarity.RARE),
            powerLevelChange: -1,
            probability: 0.2,
            contextsApplicable: [ModifierContext.SHOP, ModifierContext.CARD_REWARD, ModifierContext.REST_SITE_UPGRADE]
        }),
        new CardModifier({
            name: "Heavy",
            modifier: card => {
                card.applyBuffs_useFromActionManager([new Heavy().withoutShowingUpInBuffs()]);
                card.applyBuffs_useFromActionManager([new OnSale(90)]);
                card.name += "?";
            },
            eligible: card => card.rarity.isAtLeastAsRareAs(EntityRarity.UNCOMMON),
            powerLevelChange: -1,
            probability: 0.2,
            contextsApplicable: [ModifierContext.SHOP] // Shop-specific modifier
        }),
        new CardModifier({
            name: "Painful",
            modifier: card => {
                card.buffs.push(new Painful(1).withoutShowingUpInBuffs());
                card.name += "🙃";
            },
            powerLevelChange: -1,
            contextsApplicable: [ModifierContext.CARD_REWARD] // Makes more sense as a reward modifier
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