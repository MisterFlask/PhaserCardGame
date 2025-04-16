import { PlayableCard } from "../../../PlayableCard";
import { Berserk } from "./Berserk";
import { Greedy } from "./Greedy";
import { Idolatrous } from "./Idolatrous";
import { Paranoid } from "./Paranoid";
import { Vain } from "./Vain";

export class TraumaLibrary {
    // Private constructor to prevent instantiation
    private constructor() {}
    
    /**
     * Returns a random curse card from the available trauma cards
     * @returns A new instance of a random curse card
     */
    static getRandomTrauma(): PlayableCard {
        const traumas = [
            Berserk,
            Greedy,
            Idolatrous,
            Vain,
            Paranoid
        ];
        
        // Select a random trauma class from the array
        const randomIndex = Math.floor(Math.random() * traumas.length);
        const SelectedTrauma = traumas[randomIndex];
        
        // Return a new instance of the selected trauma
        return new SelectedTrauma();
    }
}
