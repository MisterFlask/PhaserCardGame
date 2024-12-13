import { AbstractBuff } from '../../../gamecharacters/buffs/AbstractBuff';
import { Lethality } from '../../../gamecharacters/buffs/standard/Strong';

export class EnemyUpgradeTradeRouteModifier extends AbstractBuff {
    
    getDisplayName(): string {
        return "Stronger Foes";
    }

    getDescription(): string {
        return `Enemies are stronger`;
    }

    OnCombatStart(): void {
        this.forEachEnemy(enemy => {
            enemy.buffs.push(new Lethality(this.stacks));
        });
    }
} 