import { AbstractBuff } from '../../../gamecharacters/buffs/AbstractBuff';

export abstract class AbstractTradeRouteModifier extends AbstractBuff {
    
    abstract OnCombatStart(): void;

} 