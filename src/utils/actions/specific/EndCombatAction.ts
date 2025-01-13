import { ProcBroadcaster } from "../../../gamecharacters/procs/ProcBroadcaster";
import { GameState } from "../../../rules/GameState";
import { GameAction } from "../GameAction";

export class EndCombatAction extends GameAction {
    async playAction(): Promise<GameAction[]> {
        const gameState = GameState.getInstance();

        // Trigger onCombatEnd for all relevant buffs
        ProcBroadcaster.getInstance().retrieveAllRelevantBuffsForProcs(true).forEach(buff => {
            buff.onCombatEnd();
        });

        // Clear out all the buffs on the player characters
        gameState.combatState.allPlayerAndEnemyCharacters.forEach(character => {
            // Only clear non-persona buffs
            character.buffs = character.buffs.filter(buff => buff.isPersonaTrait || buff.isPersistentBetweenCombats);
        });

        // Reset all combat resources to 0
        const combatResources = gameState.combatState.combatResources;
        combatResources.modifyAshes(0 - combatResources.ashes.value);
        combatResources.modifyPluck(0 - combatResources.pluck.value);
        combatResources.modifyMettle(0 - combatResources.mettle.value);
        combatResources.modifyVenture(0 - combatResources.venture.value);
        combatResources.modifySmog(0 - combatResources.smog.value);
        combatResources.modifyBlood(0 - combatResources.blood.value);

        return [];
    }
} 