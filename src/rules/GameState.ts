import { AutomatedCharacter } from '../gamecharacters/AutomatedCharacter';
import { BaseCharacter } from '../gamecharacters/BaseCharacter';
import { PlayerCharacter } from '../gamecharacters/CharacterClasses';
import { IAbstractCard } from '../gamecharacters/IAbstractCard';
import { PlayableCard } from '../gamecharacters/PlayableCard';
import { LocationCard } from '../maplogic/LocationCard';
import { PhysicalCard } from '../ui/PhysicalCard';
export class GameState {
    private static instance: GameState;

    public roster: PlayerCharacter[] = [];
    public currentRunCharacters: PlayerCharacter[] = [];
    public shopItems: PlayableCard[] = [];
    public inventory: PlayableCard[] = [];
    public currencyOnHand: number = 0
    public combatState: CombatState = new CombatState()

    // Add tracking for player's current location
    public currentLocation: LocationCard | null = null;
    public mapInitialized: boolean = false;
    // Add all location cards
    public locations: LocationCard[] = [];

    private constructor() {}

    public static getInstance(): GameState {
        if (!GameState.instance) {
            GameState.instance = new GameState();
        }
        return GameState.instance;
    }

    private obliteratePhysicalCard(item: IAbstractCard): void {
        if (item.physicalCard) {
            const card = item.physicalCard as PhysicalCard;
            card.obliterate();
            (item as any).physicalCard = null;
        }
    }

    private obliteratePhysicalCardsForArray(items: (IAbstractCard | PlayableCard)[]): void {
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
    public setShopItems(items: PlayableCard[]): void {
        this.shopItems = items;
    }

    public getShopItems(): PlayableCard[] {
        return [...this.shopItems];
    }

    // Inventory methods
    public addToInventory(item: PlayableCard): void {
        this.inventory.push(item);
        // Optionally, update UI or perform additional actions
    }

    public removeFromInventory(item: PlayableCard): void {
        this.inventory = this.inventory.filter(i => i !== item);
    }

    public getInventory(): PlayableCard[] {
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

    // Ensure that AbstractCard can be treated as StoreCard or adjust types accordingly
}


export class CombatState{

    characterHoveredOver_transient?: BaseCharacter

    currentCombatDeck: IAbstractCard[] = []
    currentDrawPile: IAbstractCard[] = []
    currentDiscardPile: IAbstractCard[] = []
    currentHand: IAbstractCard[] = []
    currentExhaustPile: IAbstractCard[] = []

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

    modifyIce(byAmount: number){
        this.ice.value += byAmount;
        console.log(`Modified Ice by ${byAmount}. New value: ${this.ice.value}`);
    }
    modifyPages(byAmount: number){
        this.pages.value += byAmount;
        console.log(`Modified Mind by ${byAmount}. New value: ${this.pages.value}`);
    }
    modifyIron(byAmount: number){
        this.iron.value += byAmount;
        console.log(`Modified Iron by ${byAmount}. New value: ${this.iron.value}`);
    }
    modifyGold(byAmount: number){
        this.gold.value += byAmount;
        console.log(`Modified Gold by ${byAmount}. New value: ${this.gold.value}`);
    }
    modifyFog(byAmount: number){
        this.fog.value += byAmount;
        console.log(`Modified Fog by ${byAmount}. New value: ${this.fog.value}`);
    }
    modifyThunder(byAmount: number){
        this.thunder.value += byAmount;
        console.log(`Modified Thunder by ${byAmount}. New value: ${this.thunder.value}`);
    }

    getCombatResource(resource: CombatResource): CombatResource{
        return this.resources().find(r => r.name === resource.name)!
    }

    resources(): CombatResource[]{
        return [this.thunder, this.ice, this.pages, this.iron, this.gold, this.fog]
    }

    thunder: CombatResource = new CombatResource(
        "Thunder",
        "At the start of turn, if you have 2 Thunder, decrease it by 2 and a random ally gains 2 Strength."
    );

    iron: CombatResource = new CombatResource(
        "Iron",
        "At beginning of turn, gain 1 Temp Strength for each Iron value.  Decreases by 1 at end of turn."
    );

    pages: CombatResource = new CombatResource(
        "Pages",
        "If you obtain 4 Pages in a combat, gain an additional card reward option.  If you gain 10, get 2 instead."
    );

    ice: CombatResource = new CombatResource(
        "Ice",
        "Grant 1 Stress Block at beginning of turn for each 1 Ice value."
    );

    fog: CombatResource = new CombatResource(
        "Fog",
        "If you have >4 Fog at beginning of turn, gain Sneak Attack to your hand and decrease Fog by 4. [Replays next card played by a character.]"
    );

    gold: CombatResource = new CombatResource(
        "Gold",
        "At end of combat, gain a Loot reward option for each 2 Gold value. [this is distinct from ordinary card rewards]"
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