import { AbstractBuff } from "../AbstractBuff";
import { GameState } from "../../../rules/GameState";
import { ActionManager } from "../../../utils/ActionManager";

export class Minion extends AbstractBuff {
    constructor() {
        super();
        this.isDebuff = false;
        this.imageName = "minion";
    }

    override getDisplayName(): string {
        return "Minion";
    }

    override getDescription(): string {
        return "Dies if no non-minion enemies remain.";
    }

    override onTurnStart(): void {
        const owner = this.getOwnerAsCharacter();
        if (!owner) return;
        const gameState = GameState.getInstance();
        const livingEnemies = gameState.combatState.enemies.filter(e => e.hitpoints > 0);
        const nonMinionAlive = livingEnemies.some(e => !e.buffs.some(b => b instanceof Minion));
        if (!nonMinionAlive) {
            livingEnemies.forEach(enemy => {
                if (enemy.buffs.some(b => b instanceof Minion)) {
                    ActionManager.getInstance().dealDamage({ baseDamageAmount: enemy.hitpoints, target: enemy, fromAttack: false, ignoresBlock: true });
                }
            });
        }
    }
}
