import { ProcBroadcaster } from "../../../gamecharacters/procs/ProcBroadcaster";
import { GameState } from "../../../rules/GameState";
import { UIContext, UIContextManager } from "../../../ui/UIContextManager";
import { ActionManager } from "../../ActionManager";
import { GameAction } from "../GameAction";

export class EndTurnAction extends GameAction {
    async playAction(): Promise<GameAction[]> {
        const actionManager = ActionManager.getInstance();
        const gameState = GameState.getInstance();
        const combatState = gameState.combatState;

        // Set UI context
        UIContextManager.getInstance().pushContext(UIContext.COMBAT_BUT_NOT_YOUR_TURN);
        console.log('Ending turn');

        // Remove intents from dead enemies
        combatState.enemies.forEach(enemy => {
            if (enemy.hitpoints <= 0) {
                enemy.intents = [];
            }
        });

        // End turn buffs on cards in hand
        combatState.currentHand.forEach(card => {
            card.buffs.forEach(buff => {
                buff.onInHandAtEndOfTurn();
            });
        });

        // Trigger global turn end buffs
        ProcBroadcaster.getInstance()
            .retrieveAllRelevantBuffsForProcs(true)
            .forEach(buff => {
                buff.onTurnEnd();
            });

        // Discard current hand
        actionManager.basicDiscardCards(combatState.currentHand);

        // Reset block for enemies
        combatState.enemies.forEach(character => {
            character.block = 0;
        });

        // Process enemy intents
        combatState.enemies.forEach(enemy => {
            for (const intent of [...enemy.intents]) {
                // Display the intent's title or tooltip text
                actionManager.displaySubtitle(intent.title || intent.tooltipText());
                
                // Queue the intent's action
                intent.act();

                // Hide the subtitle after the action completes
                actionManager.hideSubtitle();

                // Set new intents for the enemy
                actionManager.performAsyncronously(async () => {
                    await enemy.removeIntent(intent);
                });
            }
        });
        
        // Increment turn counter and begin next turn
        combatState.currentTurn++;
        ActionManager.beginTurn();

        return [];
    }
} 