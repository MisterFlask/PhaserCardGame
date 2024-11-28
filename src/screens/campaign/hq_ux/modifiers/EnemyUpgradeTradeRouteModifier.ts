import { AbstractTradeRouteModifier } from '../AbstractTradeRouteModifier';

export class EnemyUpgradeTradeRouteModifier extends AbstractTradeRouteModifier {
    
    getDisplayName(): string {
        return "Enemy Upgrade";
    }

    getDescription(): string {
        return `Enemies are stronger`;
    }

    OnCombatStart(): void {
        // No-op for now, will implement enemy upgrades later
    }
} 