import { ProcBroadcaster } from "../../../gamecharacters/procs/ProcBroadcaster";
import { GameState } from "../../../rules/GameState";
import { ActionManager } from "../../ActionManager";
import { GameAction } from "../GameAction";

export class StartCombatAction extends GameAction {
    async playAction(): Promise<GameAction[]> {
        const gameState = GameState.getInstance();
        const combatState = gameState.combatState;

        // remove all non-persona, transient buffs from all player characters
        gameState.currentRunCharacters.forEach(c => {
            c.buffs.forEach(b => {
                if (!b.isPersonaTrait && !b.isPersistentBetweenCombats) {
                    ActionManager.getInstance().removeBuffFromCharacter(c, b.getDisplayName());
                }
            });
        });

        // Initialize combat deck
        combatState.drawPile = [...gameState.currentRunCharacters.flatMap(c => c.cardsInMasterDeck)];
        
        // Fisher-Yates shuffle algorithm
        for (let i = combatState.drawPile.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [combatState.drawPile[i], combatState.drawPile[j]] = [combatState.drawPile[j], combatState.drawPile[i]];
        }

        combatState.currentHand = [];
        combatState.currentDiscardPile = [];
        combatState.currentExhaustPile = [];

        // Set max energy based on relics
        combatState.defaultMaxEnergy = 3; // Base energy

        // Trigger onCombatStart for all relevant buffs
        ProcBroadcaster.getInstance().retrieveAllRelevantBuffsForProcs(true).forEach(buff => {
            buff.onCombatStart();
        });
        
        return [];
    }
} 