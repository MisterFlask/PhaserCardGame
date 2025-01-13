import { ProcBroadcaster } from "../../../gamecharacters/procs/ProcBroadcaster";
import { GameState } from "../../../rules/GameState";
import { GameAction } from "../GameAction";

export class StartCombatAction extends GameAction {
    async playAction(): Promise<GameAction[]> {
        const gameState = GameState.getInstance();
        const combatState = gameState.combatState;

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