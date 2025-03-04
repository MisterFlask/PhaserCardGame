import { PlayableCard } from "../gamecharacters/PlayableCard";
import { PlayerCharacter } from "../gamecharacters/PlayerCharacter";
import { CardReward } from "../rewards/CardReward";
import { CardOwnershipManager } from "../utils/CardOwnershipManager";
import { CardRewardsGenerator } from "./CardRewardsGenerator";
import { GameState } from "./GameState";

export class CardRuleUtils {
    private static instance: CardRuleUtils;

    private constructor() {}

    public static getInstance(): CardRuleUtils {
        if (!CardRuleUtils.instance) {
            CardRuleUtils.instance = new CardRuleUtils();
        }
        return CardRuleUtils.instance;
    }
    public determineCardRewards(): CardReward{
        var cards = CardRewardsGenerator.getInstance().generateCardRewardsForCombat()
        return new CardReward(cards);
    }

    public deriveOwnerFromCardNativeClass(card: PlayableCard): PlayerCharacter { 
        // Use the CardOwnershipManager to find a matching character
        const matchingCharacter = CardOwnershipManager.getInstance().findMatchingCharacterForCard(card);
        
        if (matchingCharacter) {
            return matchingCharacter;
        }
        
        // If no matching character found, assign a random one
        const gameState = GameState.getInstance();
        const randomCharacter = gameState.getCurrentRunCharacters()[Math.floor(Math.random() * gameState.getCurrentRunCharacters().length)];
        
        if (!randomCharacter) {
            console.error(`No characters available to assign to card ${card.name}`);
            throw new Error(`No characters available to assign to card ${card.name}`);
        }
        
        return randomCharacter;
    }
}