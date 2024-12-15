import { AbstractCard } from '../../../gamecharacters/AbstractCard';
import { AbstractBuff } from '../../../gamecharacters/buffs/AbstractBuff';
import { CardType } from '../../../gamecharacters/Primitives';
import { IronFilings } from '../../../relics/common/IronFilings';
import { MistBottle } from '../../../relics/common/MistBottle';
import { TornPage } from '../../../relics/common/TornPage';
import { VialOfBlood } from '../../../relics/common/VialOfBlood';
import { ActRegion } from '../../../rules/acts/ActRegion';
import { RelicAdditionOnRunStartBuff } from '../../../rules/acts/location/abstractbuffs/RelicAdditionOnRunStartBuff';
import { BlisteringHeatModifier } from '../../../rules/acts/location/BlisteringHeat';
import { InfestedModifier } from '../../../rules/acts/location/InfestedModifier';
import { FriendlyMerchantsModifier } from '../../../rules/acts/location/positive/FriendlyMerchants';
import { ImperialSubsidyModifier } from '../../../rules/acts/location/positive/ImperialSubsidy';
import { InfernalSubsidyModifier } from '../../../rules/acts/location/positive/InfernalSubsidy';
import { SorrowMothsModifier } from '../../../rules/acts/location/SorrowMoths';
import { SoulSuckingModifier } from '../../../rules/acts/location/SoulSuckingModifier';
import { StrongEnemiesModifier } from '../../../rules/acts/location/StrongEnemiesModifier';

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
    private static negativeRouteModifiers = [
        new StrongEnemiesModifier(2),
        new InfestedModifier(2),
        new SorrowMothsModifier(1),
        new SoulSuckingModifier(1),
        new BlisteringHeatModifier(5)
    ]

    private static positiveRouteModifiers = [
        new RelicAdditionOnRunStartBuff(new TornPage()),
        new RelicAdditionOnRunStartBuff(new IronFilings()),
        new RelicAdditionOnRunStartBuff(new MistBottle()),
        new RelicAdditionOnRunStartBuff(new VialOfBlood()),
        new ImperialSubsidyModifier(),
        new InfernalSubsidyModifier(),
        new FriendlyMerchantsModifier(1),
    ]
    
    public static randomNegativeRouteModifier(): AbstractBuff {
        return this.negativeRouteModifiers[Math.floor(Math.random() * this.negativeRouteModifiers.length)];
    }

    public static randomPositiveRouteModifier(): AbstractBuff { 
        return this.positiveRouteModifiers[Math.floor(Math.random() * this.positiveRouteModifiers.length)];
    }
} 

const tradeRouteNamesByRegion: Record<string, string[]> = {
    "Dis": [
        "the imperial highway",
        "brass citadel bypass",
        "the iron boulevard",
        "magistrate's march",
        "the devil's promenade"
    ],
    "Styx Delta": [
        "the river road",
        "ferryman's way",
        "the drowned path",
        "forgotten ferry route",
        "the mist-shrouded trail"
    ],
    "Brimstone Badlands": [
        "the brimstone corridor",
        "sulfur canyon pass",
        "the charred vein",
        "ashfall highway",
        "the molten traverse"
    ],
    "Screaming Forests": [
        "whispering way",
        "the howling path",
        "echoing timber trail",
        "the wailing road",
        "tormented tree line"
    ],
    "Clockwork Wastes": [
        "the gear grind path",
        "cogwork causeway",
        "the mechanical mile",
        "automaton alley",
        "the brass bypass"
    ],
    "Abyssal Frontier": [
        "void walker's way",
        "the dark descent",
        "bottomless bypass",
        "the endless road",
        "chasm crawler's path"
    ]
};

export class StandardTradeRoute extends AbstractTradeRoute {
    constructor() {
        const startingRegion = ActRegion.getRandomRegion();
        const regionNames = tradeRouteNamesByRegion[startingRegion.name];
        const routeName = regionNames[Math.floor(Math.random() * regionNames.length)];
        
        super({
            name: routeName,
            description: "[placeholder]",
            startingActRegion: startingRegion,
        });
        this.buffs = [AbstractTradeRoute.randomNegativeRouteModifier(), AbstractTradeRoute.randomPositiveRouteModifier()];
        this.description = "Starts in " + this.startingActRegion.name;
    }
}