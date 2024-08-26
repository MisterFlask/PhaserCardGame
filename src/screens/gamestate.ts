import { BaseCharacter, BaseCharacterClass, BlackhandClass, DiabolistClass } from '../gamecharacters/CharacterClasses';
import { StoreCard } from './campaign';

export class GameState {
    private static instance: GameState;

    private roster: BaseCharacter[] = [];
    private currentRunCharacters: BaseCharacter[] = [];
    private shopItems: StoreCard[] = [];
    private inventory: StoreCard[] = [];
    private currency: number = 0

    private constructor() {}

    public static getInstance(): GameState {
        if (!GameState.instance) {
            GameState.instance = new GameState();
        }
        return GameState.instance;
    }

    // Roster methods
    public addToRoster(character: BaseCharacter): void {
        this.roster.push(character);
    }

    public removeFromRoster(character: BaseCharacter): void {
        this.roster = this.roster.filter(c => c !== character);
    }

    public getRoster(): BaseCharacter[] {
        return [...this.roster];
    }

    // Current run characters methods
    public addToCurrentRun(character: BaseCharacter): void {
        this.currentRunCharacters.push(character);
    }

    public removeFromCurrentRun(character: BaseCharacter): void {
        this.currentRunCharacters = this.currentRunCharacters.filter(c => c !== character);
    }

    public getCurrentRunCharacters(): BaseCharacter[] {
        return [...this.currentRunCharacters];
    }

    // Shop items methods
    public setShopItems(items: StoreCard[]): void {
        this.shopItems = items;
    }

    public getShopItems(): StoreCard[] {
        return [...this.shopItems];
    }

    // Inventory methods
    public addToInventory(item: StoreCard): void {
        this.inventory.push(item);
    }

    public removeFromInventory(item: StoreCard): void {
        this.inventory = this.inventory.filter(i => i !== item);
    }

    public getInventory(): StoreCard[] {
        return [...this.inventory];
    }

    // Reset method
    public reset(): void {
        this.roster = [];
        this.currentRunCharacters = [];
        this.shopItems = [];
        this.inventory = [];
    }

    // Serializer function
    public serialize(): string {
        const serializableState = {
            roster: this.roster.map(char => ({
                type: char.constructor.name,
                ...char
            })),
            currentRunCharacters: this.currentRunCharacters.map(char => ({
                type: char.constructor.name,
                ...char
            })),
            shopItems: this.shopItems,
            inventory: this.inventory
        };
        return JSON.stringify(serializableState);
    }

    // Deserializer function
    public static deserialize(serializedState: string): GameState {
        const state = GameState.getInstance();
        const parsedState = JSON.parse(serializedState);

        // todo: character roster
        
        state.shopItems = parsedState.shopItems.map((itemData: any) => new StoreCard(itemData));
        state.inventory = parsedState.inventory.map((itemData: any) => new StoreCard(itemData));

        return state;
    }
}


export class MissionDetails{
    public difficulty: number = 1
    public reward: number = 10
}

