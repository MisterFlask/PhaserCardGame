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

const tradeRouteNames = [
    "the brimstone corridor",
    "perdition’s pass",
    "the charred vein",
    "the ashen byway",
    "gehenna crossroad",
    "the infernal lattice",
    "the sulphur strand",
    "hellgate concourse",
    "the abyssal exchange",
    "diabolus circuit",
    "the molten traverse",
    "pandemonium pike",
    "the obsidian spur",
    "mephisto's thoroughfare",
    "tartarus relay"
]


export class StandardTradeRoute extends AbstractTradeRoute {
    constructor() {
        super({
            name: tradeRouteNames[Math.floor(Math.random() * tradeRouteNames.length)],
            description: "A lucrative trade route connecting distant markets.",
        });
        this.buffs = [new EnemyUpgradeTradeRouteModifier()];
    }
}

