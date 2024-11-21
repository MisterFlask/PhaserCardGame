import { Painful } from "../gamecharacters/buffs/playable_card/Painful";
import { IncreaseIron } from "../gamecharacters/buffs/standard/combatresource/IncreaseIron";
import { IncreasePages } from "../gamecharacters/buffs/standard/combatresource/IncreasePages";
import { IncreasePluck } from "../gamecharacters/buffs/standard/combatresource/IncreasePluck";
import { IncreasePowder } from "../gamecharacters/buffs/standard/combatresource/IncreasePowder";
import { IncreaseSmog } from "../gamecharacters/buffs/standard/combatresource/IncreaseSmog";
import { IncreaseVenture } from "../gamecharacters/buffs/standard/combatresource/IncreaseVenture";
import { EntityRarity, PlayableCard } from "../gamecharacters/PlayableCard";
import { CardLibrary } from "../gamecharacters/playerclasses/cards/CardLibrary";
import { CardType } from "../gamecharacters/Primitives";
import { GameState } from "./GameState";

class CardAlteration {
    private alterationFunction: (card: PlayableCard) => void;
    private qualifierFunction: (card: PlayableCard) => boolean;
    changeInPowerLevel: number;
    name: string;

    constructor(
        name: string, 
        alterationFunction: (card: PlayableCard) => void,
        qualifierFunction: (card: PlayableCard) => boolean,
        changeInPowerLevel: number
    ) {
        this.alterationFunction = alterationFunction;
        this.qualifierFunction = qualifierFunction;
        this.changeInPowerLevel = changeInPowerLevel;
        this.name = name;
    }

    applyAlteration(card: PlayableCard): void {
        if (this.qualifierFunction(card)) {
            this.alterationFunction(card);
        }
    }
}

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

    private alterations = [
        new CardAlteration("Stronger", (card: PlayableCard) => {
            card.baseDamage += card.baseDamage * 0.3;
            card.name += "+"
        }, (card: PlayableCard) => {
            return card.baseDamage > 0;
        }, 1),
        new CardAlteration("Weaker", (card: PlayableCard) => {
            card.baseDamage -= card.baseDamage * 0.5;
            card.name += "?"
        }, (card: PlayableCard) => {
            return card.baseDamage > 0;
        }, -1),
        new CardAlteration("Painful", (card: PlayableCard) => {
            if (card.cardType == CardType.POWER) {
                card.buffs.push(new Painful(3));
            }else{
                card.buffs.push(new Painful(1));
            }
            card.name += "?";
        }, (card: PlayableCard) => {
            return true;
        }, -1),
        new CardAlteration("Resource Gain", (card: PlayableCard) => {
            const randomBuff = this.resourceGainBuffs[Math.floor(Math.random() * this.resourceGainBuffs.length)];
            card.buffs.push(randomBuff);
            card.name = card.name + "+";
        }, (card: PlayableCard) => {
            return true;
        }, 1),
    ]

    private resourceGainBuffs = [
        new IncreaseIron(),
        new IncreasePages(),
        new IncreasePluck(),
        new IncreasePowder(),
        new IncreaseVenture(),
        new IncreaseSmog(),
    ]

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
        let card: PlayableCard;

        switch (powerLevel) {
            case 3:
                // Either rare OR uncommon with improvement
                if (Math.random() < 0.5) {
                    card = library.getRandomSelectionOfRelevantClassCards(1, EntityRarity.COMMON)[0];
                } else {
                    card = library.getRandomSelectionOfRelevantClassCards(1, EntityRarity.UNCOMMON)[0];
                    const positiveAlterations = this.alterations.filter(a => a.changeInPowerLevel > 0);
                    const randomAlteration = positiveAlterations[Math.floor(Math.random() * positiveAlterations.length)];
                    randomAlteration.applyAlteration(card);
                }
                break;

            case 2:
                // Either uncommon OR common with improvement OR rare with detriment
                const roll = Math.random();
                if (roll < 0.4) {
                    card = library.getRandomSelectionOfRelevantClassCards(1, EntityRarity.UNCOMMON)[0];
                } else if (roll < 0.8) {
                    card = library.getRandomSelectionOfRelevantClassCards(1, EntityRarity.COMMON)[0];
                    const positiveAlterations = this.alterations.filter(a => a.changeInPowerLevel > 0);
                    const randomAlteration = positiveAlterations[Math.floor(Math.random() * positiveAlterations.length)];
                    randomAlteration.applyAlteration(card);
                } else {
                    card = library.getRandomSelectionOfRelevantClassCards(1, EntityRarity.RARE)[0];
                    const negativeAlterations = this.alterations.filter(a => a.changeInPowerLevel < 0);
                    const randomAlteration = negativeAlterations[Math.floor(Math.random() * negativeAlterations.length)];
                    randomAlteration.applyAlteration(card);
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
        const pagesValue = gameState.combatState.combatResources.pages.value;
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
