import type { IAbstractCard } from '../gamecharacters/IAbstractCard';
import type { PlayableCard } from '../gamecharacters/PlayableCard';
import { GameState } from './GameState';


export enum PileName {
  Draw = "draw",
  Discard = "discard",
  Hand = "hand",
  Exhaust = "exhaust"
}
export class DeckLogic {
  private static instance: DeckLogic;

  private constructor() {}

  public static getInstance(): DeckLogic {
    if (!DeckLogic.instance) {
      DeckLogic.instance = new DeckLogic();
    }
    return DeckLogic.instance;
  }

  public generateInitialCombatDeck(): PlayableCard[] {
    const gameState = GameState.getInstance();
    const selectedCharacters = gameState.getCurrentRunCharacters();
    let initialDeck: IAbstractCard[] = [];

    for (const character of selectedCharacters) {
      initialDeck = initialDeck.concat(character.cardsInMasterDeck);
    }

    return initialDeck as PlayableCard[];
  }

  public shuffleArray<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  public drawCards(count: number): PlayableCard[] {
    const gameState = GameState.getInstance();
    const combatState = gameState.combatState;
    const drawnCards: PlayableCard[] = [];

    for (let i = 0; i < count; i++) {
      if (combatState.drawPile.length === 0) {
        if (combatState.currentDiscardPile.length === 0) {
          console.warn('No more cards to draw.');
          break;
        }
        // Shuffle the discard pile into the draw pile
        const shuffledCards = this.shuffleArray([...combatState.currentDiscardPile]);
        shuffledCards.forEach(card => DeckLogic.moveCardToPile(card, PileName.Draw));
      }

      if (combatState.drawPile.length > 0) {
        const drawnCard = combatState.drawPile[combatState.drawPile.length - 1];
        DeckLogic.moveCardToPile(drawnCard, PileName.Hand);
        drawnCards.push(drawnCard);
      } else {
        console.warn('Unable to draw more cards.');
        break;
      }
    }

    console.log('Cards drawn:', drawnCards.map(card => card.name));
    console.log('Updated hand:', combatState.currentHand.map(card => card.name));

    return drawnCards;
  }

  public static moveCardToPile(card: PlayableCard, pile: PileName): void {
      const gameState = GameState.getInstance();
      const combatState = gameState.combatState;

      switch (pile) {
          case PileName.Draw:
              this.removeCardFromAllPiles(card);
              combatState.drawPile.push(card);
              break;
          case PileName.Discard:
              this.removeCardFromAllPiles(card);
              combatState.currentDiscardPile.push(card);
              break;
          case PileName.Hand:
              this.removeCardFromAllPiles(card);
              combatState.currentHand.push(card);
              break;
          case PileName.Exhaust:
              this.removeCardFromAllPiles(card);
              combatState.currentExhaustPile.push(card);
              break;
          default:
              console.warn(`Unknown pile: ${pile}`);
      }
  }

  private static removeCardFromAllPiles(card: IAbstractCard): void {
    const gameState = GameState.getInstance();
    const combatState = gameState.combatState;

    combatState.drawPile = combatState.drawPile.filter(c => c !== card);
    combatState.currentDiscardPile = combatState.currentDiscardPile.filter(c => c !== card);
    combatState.currentHand = combatState.currentHand.filter(c => c !== card);
  }

}

