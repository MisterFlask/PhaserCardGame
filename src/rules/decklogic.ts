
import { AbstractCard } from '../gamecharacters/PhysicalCard';
import { GameState } from '../screens/gamestate';

export class DeckLogic {
  private static instance: DeckLogic;

  private constructor() {}

  public static getInstance(): DeckLogic {
    if (!DeckLogic.instance) {
      DeckLogic.instance = new DeckLogic();
    }
    return DeckLogic.instance;
  }

  public generateInitialCombatDeck(): AbstractCard[] {
    const gameState = GameState.getInstance();
    const selectedCharacters = gameState.getCurrentRunCharacters();
    let initialDeck: AbstractCard[] = [];

    for (const character of selectedCharacters) {
      initialDeck = initialDeck.concat(character.cardsInMasterDeck);
    }

    return initialDeck;
  }

  private shuffleArray<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  public endTurn(): void {
    const gameState = GameState.getInstance();
    const combatState = gameState.combatState;
    combatState.currentDiscardPile.push(...combatState.currentHand);
    combatState.currentHand = [];

    this.drawHandForNewTurn();
  }

  public drawHandForNewTurn(): AbstractCard[] {
    const gameState = GameState.getInstance();
    const combatState = gameState.combatState;
    const handSize = 3; // Assuming a hand size of 3 cards
    const drawnCards: AbstractCard[] = [];

    // Shuffle the draw pile if it's empty
    if (combatState.currentDrawPile.length === 0) {
      combatState.currentDrawPile = this.shuffleArray([...combatState.currentDiscardPile]);
      combatState.currentDiscardPile = [];
    }

    // Draw cards
    for (let i = 0; i < handSize; i++) {
      if (combatState.currentDrawPile.length > 0) {
        const drawnCard = combatState.currentDrawPile.pop()!;
        drawnCards.push(drawnCard);
      } else {
        // If we run out of cards, shuffle the discard pile and continue drawing
        combatState.currentDrawPile = this.shuffleArray([...combatState.currentDiscardPile]);
        combatState.currentDiscardPile = [];
        if (combatState.currentDrawPile.length > 0) {
          const drawnCard = combatState.currentDrawPile.pop()!;
          drawnCards.push(drawnCard);
        }
      }
    }

    return drawnCards;
  }

}

