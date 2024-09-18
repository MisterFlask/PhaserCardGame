// src/managers/LocationManager.ts

import { GameState } from "../rules/GameState";
import { LocationCard } from "./LocationCard";


export class LocationManager {

    constructor() {
    }

    public initializeLocations() {
        // Define your location data here. This can be loaded from a file or generated dynamically.
        const locationData = [
            { name: 'Entrance', description: 'The entrance to the dungeon' },
            { name: 'North Wing', description: 'The northern section of the dungeon' },
            { name: 'East Wing', description: 'The eastern section of the dungeon' },
            { name: 'West Wing', description: 'The western section of the dungeon' },
            { name: 'South Wing', description: 'The southern section of the dungeon' },
            { name: 'Boss Room', description: 'The final challenge awaits' }
        ];

        GameState.getInstance().locations = locationData.map(data => new LocationCard(data));
    }
}
