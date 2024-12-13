import { AbstractBuff } from '../../../gamecharacters/buffs/AbstractBuff';
import { Lethality } from '../../../gamecharacters/buffs/standard/Strong';

export class StrongEnemiesModifier extends AbstractBuff {
    getDisplayName(): string {
        return "Dangerous Territory";
    }

    getDescription(): string {
        return `At the start of combat, all enemies gain ${this.getStacksDisplayText()} Lethality.`;
    }

    override onCombatStart(): void {
        this.gameState.combatState.enemies.forEach(enemy => {
            this.actionManager.applyBuffToCharacter(enemy, new Lethality(this.stacks));
        });
    }
}
