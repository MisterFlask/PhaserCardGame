import { LocationBuffRegistry } from "./LocationBuffRegistry";
import { LocationCard } from "./LocationCard";
import { LocationTypes } from "./LocationType";

export class LocationBuffsManager {
    private static instance: LocationBuffsManager;
    private buffRegistry: LocationBuffRegistry;

    private constructor() {
        this.buffRegistry = LocationBuffRegistry.getInstance();
    }

    public static getInstance(): LocationBuffsManager {
        if (!LocationBuffsManager.instance) {
            LocationBuffsManager.instance = new LocationBuffsManager();
        }
        return LocationBuffsManager.instance;
    }

    public enrichLocationsWithBuffs(locations: LocationCard[]): void {
        locations.forEach(location => {
            if (this.shouldReceiveBuffs(location)) {
                this.assignBuffsToLocation(location);
            }
        });
    }

    private shouldReceiveBuffs(location: LocationCard): boolean {
        return location.locationType === LocationTypes.COMBAT || 
               location.locationType === LocationTypes.ELITE_COMBAT;
    }

    private assignBuffsToLocation(location: LocationCard): void {
        const roll = Math.random();

        // 40% chance for both buff and debuff
        if (roll < 0.4) {
            this.assignRandomBuff(location);
            this.assignRandomDebuff(location);
        }
        // 10% chance for just buff
        else if (roll < 0.5) {
            this.assignRandomBuff(location);
        }
        // 10% chance for just debuff
        else if (roll < 0.6) {
            this.assignRandomDebuff(location);
        }
        // 40% chance for no buffs
    }

    private assignRandomBuff(location: LocationCard): void {
        const availableBuffs = this.buffRegistry.getAvailablePositiveBuffs();
        if (availableBuffs.length > 0) {
            const randomIndex = Math.floor(Math.random() * availableBuffs.length);
            const selectedBuff = availableBuffs[randomIndex];
            location.buffs.push(selectedBuff.clone());
        }
    }

    private assignRandomDebuff(location: LocationCard): void {
        const availableDebuffs = this.buffRegistry.getAvailableNegativeBuffs();
        if (availableDebuffs.length > 0) {
            const randomIndex = Math.floor(Math.random() * availableDebuffs.length);
            const selectedDebuff = availableDebuffs[randomIndex];
            location.buffs.push(selectedDebuff.clone());
        }
    }
} 