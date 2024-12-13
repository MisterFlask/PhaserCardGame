import { AbstractCard } from '../../../gamecharacters/AbstractCard';
import { CardType } from '../../../gamecharacters/Primitives';
import { ActRegion } from '../../../rules/acts/ActRegion';
import { EnemyUpgradeTradeRouteModifier } from '../../../rules/acts/location/EnemyUpgradeTradeRouteModifier';

export class AbstractTradeRoute extends AbstractCard {
    startingActRegion: ActRegion;
    constructor({ 
        name, 
        description, 
        portraitName,
        startingActRegion: startingActRegion,
    }: { 
        name: string; 
        description: string; 
        portraitName?: string;
        startingActRegion: ActRegion;
    }) {
        super({ 
            name,
            description,
            portraitName,
            cardType: CardType.SKILL,
            tooltip: `A trade route `
        });
        this.startingActRegion = startingActRegion;
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
            startingActRegion: ActRegion.getRandomRegion(),
        });
        this.buffs = [new EnemyUpgradeTradeRouteModifier()];
        this.description = "A lucrative trade route connecting distant markets. Starts in " + this.startingActRegion.name;
    }
}