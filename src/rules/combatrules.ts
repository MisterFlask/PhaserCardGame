import { PlayableCard } from "../gamecharacters/AbstractCard";
import { AutomatedCharacter } from "../gamecharacters/AutomatedCharacter";
import { BaseCharacter } from "../gamecharacters/BaseCharacter";
import { ActionManager } from "../utils/ActionManager";
import { GameState } from "./GameState";


export class CombatRules {
  public static PlayCard = (card: PlayableCard, target: BaseCharacter): void => {
    // Invoke the effect of the card
    if (card.IsPerformableOn(target)) {
      card.InvokeCardEffects(target);
    }

    // Queue discard action instead of direct discard
    ActionManager.getInstance().discardCard(card);
  };

  public static endTurn(): void {
    console.log('Ending turn');
    const gameState = GameState.getInstance();
    const combatState = gameState.combatState;

    // {{ edit_1 }}
    // Remove intents from dead enemies
    combatState.enemies.forEach(enemy => {
      if (enemy.hitpoints <= 0) {
        enemy.intents = [];
      }
    });

    combatState.enemies.forEach(enemy => {
      for (const intent of enemy.intents) {
        intent.act();
        enemy.setNewIntents();
      }
    });

    // Queue discard actions instead of direct discard
    ActionManager.getInstance().discardCards(combatState.currentHand);
    CombatRules.beginTurn();
  }

  public static handleDeath(character: BaseCharacter, killer: BaseCharacter | null): void {
    if (character instanceof AutomatedCharacter){
      character.intents = [];
    }
    character.buffs = [];
    
  }




  public static beginTurn(): void {
    const gameState = GameState.getInstance();
    const combatState = gameState.combatState;

    // Prevent dead enemies from gaining new intents
    combatState.enemies.forEach(enemy => {
      if (enemy.hitpoints > 0) {
        enemy.setNewIntents();
      }
    });

    // Queue draw action instead of direct draw
    ActionManager.getInstance().drawHandForNewTurn();

    combatState.energyAvailable = combatState.maxEnergy
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