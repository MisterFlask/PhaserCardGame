import { AbstractCard } from '../gamecharacters/AbstractCard';
import { AutomatedCharacter } from '../gamecharacters/AutomatedCharacter';
import { BaseCharacter } from '../gamecharacters/BaseCharacter';
import { PlayerCharacter } from '../gamecharacters/CharacterClasses';
import { StoreCard } from '../screens/campaign';

export class GameState {
    private static instance: GameState;

    public roster: PlayerCharacter[] = [];
    public currentRunCharacters: PlayerCharacter[] = [];
    public shopItems: StoreCard[] = [];
    public inventory: StoreCard[] = [];
    public currencyOnHand: number = 0
    public combatState: CombatState = new CombatState()

    private constructor() {}

    public static getInstance(): GameState {
        if (!GameState.instance) {
            GameState.instance = new GameState();
        }
        return GameState.instance;
    }

    // Roster methods
    public addToRoster(character: PlayerCharacter): void {
        this.roster.push(character);
    }

    public removeFromRoster(character: PlayerCharacter): void {
        this.roster = this.roster.filter(c => c !== character);
    }

    public getRoster(): PlayerCharacter[] {
        return [...this.roster];
    }

    // Current run characters methods
    public addToCurrentRun(character: PlayerCharacter): void {
        this.currentRunCharacters.push(character);
    }

    public removeFromCurrentRun(character: PlayerCharacter): void {
        this.currentRunCharacters = this.currentRunCharacters.filter(c => c !== character);
    }

    public getCurrentRunCharacters(): PlayerCharacter[] {
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


export class CombatState{
    currentCombatDeck: AbstractCard[] = []
    currentDrawPile: AbstractCard[] = []
    currentDiscardPile: AbstractCard[] = []
    currentHand: AbstractCard[] = []

    enemies: AutomatedCharacter[] = []
    playerCharacters: BaseCharacter[] = []

    public energyAvailable: number = 0
    public maxEnergy: number = 5
        
    getBattleCardLocation = (cardId: string): BattleCardLocation => {
        if (this.currentDrawPile.some(c => c.id === cardId)) return BattleCardLocation.DrawPile
        if (this.currentDiscardPile.some(c => c.id === cardId)) return BattleCardLocation.DiscardPile
        if (this.currentHand.some(c => c.id === cardId)) return BattleCardLocation.Hand
        return BattleCardLocation.Unknown
    }
}

export enum BattleCardLocation {
    DrawPile,
    DiscardPile,
    Hand,
    Unknown
}

export class MissionDetails{
    public difficulty: number = 1
    public reward: number = 10
}

