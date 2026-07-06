import { SortieManager } from "../campaign/SortieManager";
import { StandingOrdersState } from "../campaign/orders/StandingOrdersState";
import { LEVEL_CAP } from "../campaign/Leveling";
import { EntityRarity } from "../gamecharacters/EntityRarity";
import { PlayableCard } from "../gamecharacters/PlayableCard";
import { PlayerCharacter } from "../gamecharacters/PlayerCharacter";
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

    /**
     * @param cardPool Restricts the draw to a specific set of candidate
     * cards (e.g. one character's class pool). Defaults to the whole
     * current-run squad's combined pool for the legacy combat-reward path.
     */
    private getCardRewardOfSpecifiedPowerLevel(powerLevel: number, cardPool?: PlayableCard[]): PlayableCard {
        const library = CardLibrary.getInstance();
        const registry = CardModifierRegistry.getInstance();
        const pickFrom = (rarity: EntityRarity): PlayableCard => {
            if (cardPool) {
                const ofRarity = cardPool.filter(c => c.rarity === rarity);
                const chosen = ofRarity[Math.floor(Math.random() * ofRarity.length)];
                return chosen.Copy();
            }
            return library.getRandomSelectionOfRelevantClassCards(1, rarity)[0];
        };
        let card: PlayableCard;

        switch (powerLevel) {
            case 3:
                // Either rare OR uncommon with improvement
                if (Math.random() < 0.5) {
                    card = pickFrom(EntityRarity.COMMON);
                } else {
                    card = pickFrom(EntityRarity.UNCOMMON);
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
                    card = pickFrom(EntityRarity.UNCOMMON);
                } else if (roll < 0.8) {
                    card = pickFrom(EntityRarity.COMMON);
                    const positiveModifiers = registry.positiveModifiers
                        .filter(mod => mod.isApplicableInContext(ModifierContext.CARD_REWARD) && mod.eligible(card));
                    const randomModifier = positiveModifiers[Math.floor(Math.random() * positiveModifiers.length)];
                    randomModifier.applyModification(card);
                } else {
                    card = pickFrom(EntityRarity.RARE);
                    const negativeModifiers = registry.negativeModifiers
                        .filter(mod => mod.isApplicableInContext(ModifierContext.CARD_REWARD) && mod.eligible(card));
                    const randomModifier = negativeModifiers[Math.floor(Math.random() * negativeModifiers.length)];
                    randomModifier.applyModification(card);
                }
                break;

            case 1:
            default:
                card = pickFrom(EntityRarity.COMMON);
                break;
        }

        return card;
    }

    public generateCardRewardsForCombat(): PlayableCard[] {
        const gameState = GameState.getInstance();
        const pagesValue = gameState.combatState.combatResources.ashes.value;
        // Reward power scales with contract depth: act/segment map onto the
        // 1-50 "floor" scale the distribution curve was designed around.
        const contract = SortieManager.getInstance().activeContract;
        const currentFloor = contract
            ? ((contract.act - 1) * 3 + contract.segment + 1) * 5
            : 1;

        let pagesCardsAdded = 0;
        if (pagesValue > 4) {
            pagesCardsAdded = 1;
        }
        if (pagesValue > 10) {
            pagesCardsAdded = 2;
        }

        const numCardsToGenerate = StandingOrdersState.getInstance().cardRewardChoices(3 + pagesCardsAdded);
        const distribution = this.calculatePowerLevelDistribution(currentFloor);

        // Generate cards based on power levels
        return Array(numCardsToGenerate)
            .fill(0)
            .map(() => this.getRandomPowerLevel(distribution))
            .map(powerLevel => this.getCardRewardOfSpecifiedPowerLevel(powerLevel));
    }

    /**
     * Level-up card choices (Amendment: Soldier Levels & Promotions). Runs
     * at HQ, not during combat — deliberately does NOT read combatState (no
     * ashes bonus here; that's a combat-only mechanic that no longer applies
     * once post-combat rewards are gone). Cards are restricted to the
     * promoted character's own class pool, not the whole squad's.
     *
     * Rarity weighting reuses calculatePowerLevelDistribution's 1-50 "floor"
     * curve. Balance-pass sketch mapping: newLevel (1-10) * 5, so a level-10
     * promotion reaches the curve's most rare-heavy point (floor 50) the
     * same as a deep-Act combat reward would.
     */
    public generateCardRewardsForLevelUp(character: PlayerCharacter, newLevel: number): PlayableCard[] {
        const pool = CardLibrary.getInstance().getCardsForClass(character.characterClass);
        const currentFloor = Math.min(newLevel, LEVEL_CAP) * 5;
        const distribution = this.calculatePowerLevelDistribution(currentFloor);
        const numCardsToGenerate = StandingOrdersState.getInstance().cardRewardChoices(3);

        return Array(numCardsToGenerate)
            .fill(0)
            .map(() => this.getRandomPowerLevel(distribution))
            .map(powerLevel => this.getCardRewardOfSpecifiedPowerLevel(powerLevel, pool));
    }
}
