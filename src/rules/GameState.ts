import { AbstractCard } from '../gamecharacters/AbstractCard';
import { AutomatedCharacter } from '../gamecharacters/AutomatedCharacter';
import { BaseCharacter } from '../gamecharacters/BaseCharacter';
import { PlayerCharacter } from '../gamecharacters/CharacterClasses';
import { LocationCard } from '../maplogic/LocationCard';
import { StoreCard } from '../screens/campaign';
import { PhysicalCard } from '../ui/PhysicalCard';
export class GameState {
    private static instance: GameState;

    public roster: PlayerCharacter[] = [];
    public currentRunCharacters: PlayerCharacter[] = [];
    public shopItems: StoreCard[] = [];
    public inventory: StoreCard[] = [];
    public currencyOnHand: number = 0
    public combatState: CombatState = new CombatState()

    // Add tracking for player's current location
    public currentLocation: LocationCard | null = null;

    // Add all location cards
    public locations: LocationCard[] = [];

    private constructor() {}

    public static getInstance(): GameState {
        if (!GameState.instance) {
            GameState.instance = new GameState();
        }
        return GameState.instance;
    }

    private obliteratePhysicalCard(item: AbstractCard): void {
        if (item.physicalCard) {
            const card = item.physicalCard as PhysicalCard;
            card.obliterate();
            (item as any).physicalCard = null;
        }
    }

    private obliteratePhysicalCardsForArray(items: (AbstractCard | StoreCard)[]): void {
        items.forEach(item => this.obliteratePhysicalCard(item));
    }

    public eliminatePhysicalCardsBetweenScenes(){
        // for each physicalCard linked to by each AbstractCard we track, obliterate it and set it to null
        this.obliteratePhysicalCardsForArray(this.roster);
        this.obliteratePhysicalCardsForArray(this.currentRunCharacters);
        this.obliteratePhysicalCardsForArray(this.combatState.playerCharacters);
        
        // Note: Removed the enemyCharacters line as it doesn't exist on CombatState
        // If you need to handle enemy characters, ensure CombatState has this property
        // this.obliteratePhysicalCardsForArray(this.combatState.enemyCharacters);

        this.obliteratePhysicalCardsForArray(this.inventory);
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

    // Add methods for managing locations
    public setCurrentLocation(location: LocationCard): void {
        this.currentLocation = location;
    }

    public getCurrentLocation(): LocationCard | null {
        return this.currentLocation;
    }

    public setLocations(locations: LocationCard[]): void {
        this.locations = locations;
    }

    public getLocations(): LocationCard[] {
        return [...this.locations];
    }
}


export class CombatState{

    characterHoveredOver_transient?: BaseCharacter

    currentCombatDeck: AbstractCard[] = []
    currentDrawPile: AbstractCard[] = []
    currentDiscardPile: AbstractCard[] = []
    currentHand: AbstractCard[] = []

    enemies: AutomatedCharacter[] = []
    playerCharacters: BaseCharacter[] = []

    combatResources: CombatResources = new CombatResources()

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

export class CombatResources{
    modifyLight(byAmount: number){
        this.light.value += byAmount;
        console.log(`Modified Light by ${byAmount}. New value: ${this.light.value}`);
    }

    modifyFire(byAmount: number){
        this.fire.value += byAmount;
        console.log(`Modified Fire by ${byAmount}. New value: ${this.fire.value}`);
    }
    modifyIce(byAmount: number){
        this.ice.value += byAmount;
        console.log(`Modified Ice by ${byAmount}. New value: ${this.ice.value}`);
    }
    modifyMind(byAmount: number){
        this.mind.value += byAmount;
        console.log(`Modified Mind by ${byAmount}. New value: ${this.mind.value}`);
    }
    modifyIron(byAmount: number){
        this.iron.value += byAmount;
        console.log(`Modified Iron by ${byAmount}. New value: ${this.iron.value}`);
    }
    modifyGold(byAmount: number){
        this.gold.value += byAmount;
        console.log(`Modified Gold by ${byAmount}. New value: ${this.gold.value}`);
    }
    modifyMuscle(byAmount: number){
        this.muscle.value += byAmount;
        console.log(`Modified Muscle by ${byAmount}. New value: ${this.muscle.value}`);
    }

    light: CombatResource = new CombatResource(
        "Light",
        "10% chance to block additional stress when it would be applied (caps at 75%). Decreases by 1 each turn."
    );

    fire: CombatResource = new CombatResource(
        "Fire",
        "5% chance to empower a random attack card in hand at beginning of turn, doubling its damage for that turn until played.  Decreases by 1 each turn."
    );

    iron: CombatResource = new CombatResource(
        "Iron",
        "5% chance to empower a random defense card in hand at beginning of turn, doubling its defense for that turn until played. Decreases by 1 each turn."
    );

    mind: CombatResource = new CombatResource(
        "Mind",
        "For each Mind-granting card in your deck, 10% chance to get additional card reward option.  Decreases by 1 each turn."
    );

    ice: CombatResource = new CombatResource(
        "Ice",
        "For each Ice-granting card in your deck at the end of the run, gain additional shareholder satisfaction.  Decreases by 1 each turn."
    );

    gold: CombatResource = new CombatResource(
        "Gold",
        "For each Gold-granting card in your deck at the end of the run, you get 10 additional wealth. Decreases by 1 each turn."
    );

    muscle: CombatResource = new CombatResource(
        "Muscle",
        "For each 3 you get, the whole party gains 1 Strength. Decreases by 1 each turn."
    );
}

export class CombatResource{
    name: string;
    description: string;
    value: number;
    icon: string; // Add icon property

    constructor(name: string, description: string, initialValue: number = 0, icon: string = 'placeholder') {
        this.name = name;
        this.description = description;
        this.value = initialValue;
        this.icon = icon; // Initialize icon
    }
}