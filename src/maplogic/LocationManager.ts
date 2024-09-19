// src/managers/LocationManager.ts

import { CardSize } from '../gamecharacters/Primitives'; // Update the import
import { GameState } from "../rules/GameState";
import { LocationCard } from "./LocationCard";

export class LocationManager {

    constructor() {
    }

    public initializeLocations() {
        // Define your location data here. Increased the number of locations and set size to SMALL.
        const locationData = [
            { name: 'Entrance', description: 'The entrance to the dungeon', size: CardSize.SMALL },
            { name: 'North Wing', description: 'The northern section of the dungeon', size: CardSize.SMALL },
            { name: 'East Wing', description: 'The eastern section of the dungeon', size: CardSize.SMALL },
            { name: 'West Wing', description: 'The western section of the dungeon', size: CardSize.SMALL },
            { name: 'South Wing', description: 'The southern section of the dungeon', size: CardSize.SMALL },
            { name: 'Boss Room', description: 'The final challenge awaits', size: CardSize.SMALL },
            { name: 'Library', description: 'A room filled with ancient tomes', size: CardSize.SMALL },
            { name: 'Armory', description: 'Storage of old and new weapons', size: CardSize.SMALL },
            { name: 'Alchemy Lab', description: 'Where potions are brewed', size: CardSize.SMALL },
            { name: 'Guard Quarters', description: 'Living space for dungeon guards', size: CardSize.SMALL },
            { name: 'Hidden Chamber', description: 'A secret room with unknown secrets', size: CardSize.SMALL },
            { name: 'Treasure Vault', description: 'Room filled with treasures and gold', size: CardSize.SMALL }
        ];

        GameState.getInstance().locations = locationData.map(data => new LocationCard(data));
    }
}
