import { AbstractConsumable } from "./AbstractConsumable";
import { HealthPotion } from "./HealthPotion";
import { StrengthElixir } from "./StrengthElixir";

/**
 * Library for managing all consumables in the game
 */
export class ConsumablesLibrary {
    private static instance: ConsumablesLibrary;
    
    private consumableConstructors: (new () => AbstractConsumable)[] = [
        HealthPotion,
        StrengthElixir,
        // Add more consumables here as they're implemented
    ];

    /**
     * Get the singleton instance of ConsumablesLibrary
     */
    public static getInstance(): ConsumablesLibrary {
        if (!ConsumablesLibrary.instance) {
            ConsumablesLibrary.instance = new ConsumablesLibrary();
        }
        return ConsumablesLibrary.instance;
    }

    /**
     * Get all available consumables
     */
    public getAllConsumables(): AbstractConsumable[] {
        return this.consumableConstructors.map(constructor => {
            const consumable = new constructor();
            consumable.init();
            return consumable;
        });
    }

    /**
     * Get a random selection of consumables for shop
     * @param count Number of consumables to return
     */
    public getRandomConsumablesForShop(count: number): AbstractConsumable[] {
        // Get all consumables
        const allConsumables = this.getAllConsumables();
        
        // Shuffle and take the requested number
        return this.shuffleArray(allConsumables).slice(0, Math.min(count, allConsumables.length));
    }

    /**
     * Get a specific consumable by name
     * @param name Name of the consumable to retrieve
     */
    public getConsumableByName(name: string): AbstractConsumable | undefined {
        const allConsumables = this.getAllConsumables();
        return allConsumables.find(consumable => consumable.getDisplayName() === name);
    }

    /**
     * Helper function to shuffle an array
     */
    private shuffleArray<T>(array: T[]): T[] {
        const result = [...array];
        for (let i = result.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [result[i], result[j]] = [result[j], result[i]];
        }
        return result;
    }
} 