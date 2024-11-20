import { BaseCharacter } from "../../BaseCharacter";
import { LocationCardBuff } from "../LocationCardBuff";

export class TougherEnemies extends LocationCardBuff {
    constructor() {
        super();
    }

    override getName(): string {
        return "Tougher Enemies";
    }

    override getDescription(): string {
        return "All enemies have 40% more max HP.";
    }

    override onCombatStart(): void {
        this.forEachEnemy((enemy: BaseCharacter) => {
            enemy.maxHitpoints = Math.floor(enemy.maxHitpoints * 1.4);
            enemy.hitpoints = enemy.maxHitpoints;
        });
    }
}
