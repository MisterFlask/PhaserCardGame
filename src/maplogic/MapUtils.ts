import { AbstractBuff } from "../gamecharacters/buffs/AbstractBuff";
import { GameState } from "../rules/GameState";
import { LocationCard } from "./LocationCard";

export class MapUtils {
    private static instance: MapUtils;

    private constructor() {}

    public static getInstance(): MapUtils {
        if (!MapUtils.instance) {
            MapUtils.instance = new MapUtils();
        }
        return MapUtils.instance;
    }

    /**
     * Adds a buff to a random location that matches the provided predicate
     * @param buff The buff to add to the location
     * @param predicate A function that takes a LocationCard and returns true if the buff should be added to it
     * @returns The location that received the buff, or null if no matching location was found
     */
    public AddBuffToLocationMatchingPredicate(
        buff: AbstractBuff, 
        predicate: (location: LocationCard) => boolean
    ): LocationCard | null {
        const gameState = GameState.getInstance();
        
        // Find all locations that match the predicate
        const matchingLocations = gameState.locations.filter(predicate);
        
        // If no locations match, return null
        if (matchingLocations.length === 0) {
            console.log("No locations match the provided predicate");
            return null;
        }
        
        // Choose a random location from the matching ones
        const randomIndex = Math.floor(Math.random() * matchingLocations.length);
        const selectedLocation = matchingLocations[randomIndex];
        
        // Add the buff to the selected location
        selectedLocation.buffs.push(buff);
        console.log(`Added buff ${buff.getDisplayName()} to location ${selectedLocation.name}`);
        
        return selectedLocation;
    }
}
