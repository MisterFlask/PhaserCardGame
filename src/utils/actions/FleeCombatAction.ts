// performs the necessary actions to flee combat
// empty out all location rewards
// kill all enemies
// mark combat as "ended"

import { GameState } from "../../rules/GameState";
import { GameAction } from "./GameAction";

export class FleeCombatAction extends GameAction {
    public constructor() {
        super();
    }

    async playAction(): Promise<GameAction[]> {
        const gameState = GameState.getInstance();
        gameState.combatState.enemies.forEach(enemy => {
            enemy.hitpoints = 0;
        });

        if (gameState.currentLocation) {
            gameState.currentLocation!.currentExpectedRewards = []
        }

        return [];
    }
}
