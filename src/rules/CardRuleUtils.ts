import { PlayerCharacter } from "../gamecharacters/BaseCharacterClass";
import { PlayableCard } from "../gamecharacters/PlayableCard";
import { CardReward } from "../rewards/CardReward";
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
        var clazz = card.nativeToCharacterClass;
        if (!clazz) {
            console.warn(`Card ${card.name} has no associated character class`);
        }
        var playerCharacter = GameState.getInstance().getCurrentRunCharacters().find(c => c.characterClass.id === clazz?.id);
        if (!playerCharacter) {
            // If no matching class found, randomly assign to a current run character
            playerCharacter = GameState.getInstance().getCurrentRunCharacters()[Math.floor(Math.random() * GameState.getInstance().getCurrentRunCharacters().length)];
        }
        return playerCharacter;
    }
}