import { EntityRarity } from "../gamecharacters/EntityRarity";
import { PlayableCard } from "../gamecharacters/PlayableCard";
import { CardLibrary } from "../gamecharacters/playerclasses/cards/CardLibrary";
import { GameState } from "./GameState";
import { ModifierContext } from "./modifiers/AbstractCardModifier";
import { CardModifierRegistry } from "./modifiers/CardModifierRegistry";

export class CardRewardsGenerator {
    private static instance: CardRewardsGenerator;

    public static getInstance(): CardRewardsGenerator {
        if (!CardRewardsGenerator.instance) {
            CardRewardsGenerator.instance = new CardRewardsGenerator();
        }
        return CardRewardsGenerator.instance;
    }

    private constructor() {
        // Private constructor for singleton
    }

    private calculatePowerLevelDistribution(currentFloor: number): number[] {
        // At floor 50, we want [0.33, 0.33, 0.33]
        // At floor 1, we want [0.70, 0.25, 0.05]
        const progress = currentFloor / 50;
        
        // Linear interpolation between start and end distributions
        const level1Weight = 0.70 - (0.37 * progress); // 0.70 -> 0.33
        const level2Weight = 0.25 + (0.08 * progress); // 0.25 -> 0.33
        const level3Weight = 0.05 + (0.28 * progress); // 0.05 -> 0.33
        
        return [level1Weight, level2Weight, level3Weight];
    }

    private getRandomPowerLevel(distribution: number[]): number {
        const rand = Math.random();
        let cumulative = 0;
        
        for (let i = 0; i < distribution.length; i++) {
            cumulative += distribution[i];
            if (rand <= cumulative) {
                return i + 1; // Power levels are 1-based
            }
        }
        return 1; // Fallback
    }

    private getCardRewardOfSpecifiedPowerLevel(powerLevel: number): PlayableCard {
        const library = CardLibrary.getInstance();
        const registry = CardModifierRegistry.getInstance();
        let card: PlayableCard;

        switch (powerLevel) {
            case 3:
                // Either rare OR uncommon with improvement
                if (Math.random() < 0.5) {
                    card = library.getRandomSelectionOfRelevantClassCards(1, EntityRarity.COMMON)[0];
                } else {
                    card = library.getRandomSelectionOfRelevantClassCards(1, EntityRarity.UNCOMMON)[0];
                    const positiveModifiers = registry.positiveModifiers
                        .filter(mod => mod.isApplicableInContext(ModifierContext.CARD_REWARD) && mod.eligible(card));
                    const randomModifier = positiveModifiers[Math.floor(Math.random() * positiveModifiers.length)];
                    randomModifier.applyModification(card);
                }
                break;

            case 2:
                // Either uncommon OR common with improvement OR rare with detriment
                const roll = Math.random();
                if (roll < 0.4) {
                    card = library.getRandomSelectionOfRelevantClassCards(1, EntityRarity.UNCOMMON)[0];
                } else if (roll < 0.8) {
                    card = library.getRandomSelectionOfRelevantClassCards(1, EntityRarity.COMMON)[0];
                    const positiveModifiers = registry.positiveModifiers
                        .filter(mod => mod.isApplicableInContext(ModifierContext.CARD_REWARD) && mod.eligible(card));
                    const randomModifier = positiveModifiers[Math.floor(Math.random() * positiveModifiers.length)];
                    randomModifier.applyModification(card);
                } else {
                    card = library.getRandomSelectionOfRelevantClassCards(1, EntityRarity.RARE)[0];
                    const negativeModifiers = registry.negativeModifiers
                        .filter(mod => mod.isApplicableInContext(ModifierContext.CARD_REWARD) && mod.eligible(card));
                    const randomModifier = negativeModifiers[Math.floor(Math.random() * negativeModifiers.length)];
                    randomModifier.applyModification(card);
                }
                break;

            case 1:
            default:
                card = library.getRandomSelectionOfRelevantClassCards(1, EntityRarity.COMMON)[0];
                break;
        }

        return card;
    }

    public generateCardRewardsForCombat(): PlayableCard[] {
        const gameState = GameState.getInstance();
        const pagesValue = gameState.combatState.combatResources.ashes.value;
        const currentFloor = gameState.currentLocation?.floor ?? 1;
        
        let pagesCardsAdded = 0;
        if (pagesValue > 4) {
            pagesCardsAdded = 1;
        }
        if (pagesValue > 10) {
            pagesCardsAdded = 2;
        }

        const numCardsToGenerate = 3 + pagesCardsAdded;
        const distribution = this.calculatePowerLevelDistribution(currentFloor);
        
        // Generate cards based on power levels
        return Array(numCardsToGenerate)
            .fill(0)
            .map(() => this.getRandomPowerLevel(distribution))
            .map(powerLevel => this.getCardRewardOfSpecifiedPowerLevel(powerLevel));
    }
}
