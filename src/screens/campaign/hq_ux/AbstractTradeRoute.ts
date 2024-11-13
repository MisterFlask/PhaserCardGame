import { AbstractCard } from '../../../gamecharacters/AbstractCard';
import { CardType } from '../../../gamecharacters/Primitives';
import { EnemyUpgradeTradeRouteModifier } from './modifiers/EnemyUpgradeTradeRouteModifier';

export class AbstractTradeRoute extends AbstractCard {

    constructor({ 
        name, 
        description, 
        portraitName,
    }: { 
        name: string; 
        description: string; 
        portraitName?: string;
    }) {
        super({ 
            name,
            description,
            portraitName,
            cardType: CardType.SKILL,
            tooltip: `A trade route `
        });
    }
} 

export class StandardTradeRoute extends AbstractTradeRoute {
    constructor() {
        super({
            name: "Silk Road Connection",
            description: "A lucrative trade route connecting distant markets",
        });
        this.buffs = [new EnemyUpgradeTradeRouteModifier()];
    }
}

