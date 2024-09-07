
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
    console.log('Ending turn');
    const gameState = GameState.getInstance();
    const combatState = gameState.combatState;

    combatState.enemies.forEach(enemy => {
      for (const intent of enemy.getIntents()) {
        intent.act();
      }
    });
    combatState.currentDiscardPile.push(...combatState.currentHand);
    combatState.currentHand = [];


    this.drawHandForNewTurn();
  }


  
  public drawHandForNewTurn(): AbstractCard[] {
    console.log('Drawing hand for new turn');
    const gameState = GameState.getInstance();
    const combatState = gameState.combatState;
    const handSize = 3; // Assuming a hand size of 3 cards

    combatState.currentHand = this.drawCards(handSize);

    console.log('State of all piles:');
    console.log('Draw Pile:', combatState.currentDrawPile.map(card => card.name));
    console.log('Discard Pile:', combatState.currentDiscardPile.map(card => card.name));
    console.log('Hand:', combatState.currentHand.map(card => card.name));
    return combatState.currentHand;
  }

  private drawCards(count: number): AbstractCard[] {
    const gameState = GameState.getInstance();
    const combatState = gameState.combatState;
    const drawnCards: AbstractCard[] = [];

    // Shuffle the draw pile if it's empty
    if (combatState.currentDrawPile.length === 0) {
      combatState.currentDrawPile = this.shuffleArray([...combatState.currentDiscardPile]);
      combatState.currentDiscardPile = [];
    }

    // Draw cards
    for (let i = 0; i < count; i++) {
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

