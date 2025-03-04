import { PlayableCard } from "../gamecharacters/PlayableCard";
import { PlayerCharacter } from "../gamecharacters/PlayerCharacter";
import { GameState } from "../rules/GameState";

/**
 * Manages the assignment of cards to character owners
 * Centralizes the logic previously spread across ShopOverlay and ActionManager
 */
export class CardOwnershipManager {
    private static instance: CardOwnershipManager;

    private constructor() {}

    public static getInstance(): CardOwnershipManager {
        if (!CardOwnershipManager.instance) {
            CardOwnershipManager.instance = new CardOwnershipManager();
        }
        return CardOwnershipManager.instance;
    }

    /**
     * Assigns an owner to a card based on its native character class
     * @param card The card to assign an owner to
     * @returns The card with its owner assigned
     */
    public assignOwnerToCard(card: PlayableCard): PlayableCard {
        if (card.owningCharacter) {
            return card; // Card already has an owner
        }

        const gameState = GameState.getInstance();
        const partyMembers = gameState.currentRunCharacters;
        
        if (partyMembers.length === 0) {
            console.warn("No party members available to assign card ownership");
            return card;
        }

        // Priority 1: Find characters whose class matches the card's native class
        const eligibleCharacters = partyMembers.filter(character => 
            card.nativeToCharacterClass && 
            character.characterClass.id === card.nativeToCharacterClass.id
        );
        
        if (eligibleCharacters.length > 0) {
            // Randomly select from eligible characters
            const randomIndex = Math.floor(Math.random() * eligibleCharacters.length);
            card.owningCharacter = eligibleCharacters[randomIndex];
        } else {
            // Fallback: Just select a random character
            const randomCharacter = partyMembers[Math.floor(Math.random() * partyMembers.length)];
            card.owningCharacter = randomCharacter;
        }

        return card;
    }

    /**
     * Assigns owners to all cards in a collection
     * @param cards The collection of cards to assign owners to
     * @returns The cards with owners assigned
     */
    public assignOwnersToCards(cards: PlayableCard[]): PlayableCard[] {
        cards.forEach(card => this.assignOwnerToCard(card));
        return cards;
    }

    /**
     * Finds a character that matches the native class of the card
     * @param card The card to find a matching character for
     * @returns A matching character or undefined if none found
     */
    public findMatchingCharacterForCard(card: PlayableCard): PlayerCharacter | undefined {
        if (!card.nativeToCharacterClass) {
            return undefined;
        }

        return GameState.getInstance().currentRunCharacters.find(
            (character: PlayerCharacter) => 
                character.characterClass.id === card.nativeToCharacterClass?.id
        );
    }
} 