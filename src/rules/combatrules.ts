import { AbstractCard, PlayableCard } from "../gamecharacters/AbstractCard";
import { AutomatedCharacter } from "../gamecharacters/AutomatedCharacter";
import { BaseCharacter } from "../gamecharacters/BaseCharacter";
import { GameState } from "../screens/gamestate";
import { ActionManager } from "../utils/ActionManager";
import { DeckLogic } from "./decklogic";

export class CombatRules {
  public static PlayCard = (card: PlayableCard, target: BaseCharacter): void => {
    // Invoke the effect of the card
    if (card.IsPerformableOn(target)) {
      card.InvokeCardEffects(target);
    }

    ActionManager.getInstance().discardCard(card);
  };


  public static endTurn(): void {
    console.log('Ending turn');
    const gameState = GameState.getInstance();
    const combatState = gameState.combatState;

    combatState.enemies.forEach(enemy => {
      for (const intent of enemy.intents) {
        intent.act();
        enemy.setNewIntents();
      }
    });

    
    combatState.currentDiscardPile.push(...combatState.currentHand);
    combatState.currentHand = [];

    DeckLogic.getInstance().drawHandForNewTurn();
  }

  public static ExecuteIntents(): void {
    const gameState = GameState.getInstance();
    const allCards = [...gameState.combatState.playerCharacters, ...gameState.combatState.enemies];
    
    allCards.forEach(card => {
        if (card instanceof AutomatedCharacter) {
            var autoChar = card as AutomatedCharacter;
            const intents = autoChar.intents;
            intents.forEach(intent => {
                intent.act();
            });
        }
    });
}
  
}