import type { AbstractCard } from '../gamecharacters/AbstractCard';
import type { PlayerCharacter } from '../gamecharacters/CharacterClasses';
import type { PlayableCard } from '../gamecharacters/PlayableCard';
import type { LocationCard } from '../maplogic/LocationCard';
import type { AutomatedCharacterType, BaseCharacterType } from '../Types';
import type { PhysicalCard } from '../ui/PhysicalCard';
export class GameState {
    private static instance: GameState;

    public roster: PlayerCharacter[] = [];
    public currentRunCharacters: PlayerCharacter[] = [];
    public shopItems: PlayableCard[] = [];
    public inventory: PlayableCard[] = [];
    
    public surfaceCurrency: number = 0
    public hellCurrency: number = 0
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

    private obliteratePhysicalCard(item: AbstractCard): void {
        if (item.physicalCard) {
            const card = item.physicalCard as PhysicalCard;
            card.obliterate();
            (item as any).physicalCard = null;
        }
    }

    private obliteratePhysicalCardsForArray(items: (AbstractCard | PlayableCard)[]): void {
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

    cardHoveredOver_transient?: AbstractCard

    currentDrawPile: PlayableCard[] = []
    currentDiscardPile: PlayableCard[] = []
    currentHand: PlayableCard[] = []
    currentExhaustPile: PlayableCard[] = []

    enemies: AutomatedCharacterType[] = []
    playerCharacters: BaseCharacterType[] = []

    currentTurn: number = 0

    get allPlayerAndEnemyCharacters(): (BaseCharacterType)[] {
        return [...this.playerCharacters, ...this.enemies];
    }

    get allCardsInAllPilesExceptExhaust(): AbstractCard[] {
        return [...this.currentDrawPile, ...this.currentDiscardPile, ...this.currentHand];
    }

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

    modifyPluck(byAmount: number){
        this.pluck.value += byAmount;
        console.log(`Modified Pluck by ${byAmount}. New value: ${this.pluck.value}`);
    }
    modifyPages(byAmount: number){
        this.pages.value += byAmount;
        console.log(`Modified Pages by ${byAmount}. New value: ${this.pages.value}`);
    }
    modifyIron(byAmount: number){
        this.iron.value += byAmount;
        console.log(`Modified Iron by ${byAmount}. New value: ${this.iron.value}`);
    }
    modifyVenture(byAmount: number){
        this.venture.value += byAmount;
        console.log(`Modified Venture by ${byAmount}. New value: ${this.venture.value}`);
    }
    modifySmog(byAmount: number){
        this.smog.value += byAmount;
        console.log(`Modified Smog by ${byAmount}. New value: ${this.smog.value}`);
    }
    modifyPowder(byAmount: number){
        this.powder.value += byAmount;
        console.log(`Modified Powder by ${byAmount}. New value: ${this.powder.value}`);
    }

    getCombatResource(resource: CombatResource): CombatResource{
        return this.resources().find(r => r.name === resource.name)!
    }

    resources(): CombatResource[]{
        return [this.powder, this.pluck, this.pages, this.iron, this.venture, this.smog]
    }

    powder: CombatResource = new CombatResource(
        "Powder",
        "At the start of turn, if you have 2 Powder, decrease it by 2 and a random ally gains 2 Strength."
    );

    iron: CombatResource = new CombatResource(
        "Iron",
        "At beginning of turn, gain 1 Block for each Iron value.  Decreases by 1 at end of turn."
    );

    pages: CombatResource = new CombatResource(
        "Pages",
        "If you end combat with 4 Pages, gain an additional card reward option.  If you gain 10, get 2 instead."
    );

    pluck: CombatResource = new CombatResource(
        "Pluck",
        "Grant 1 Stress Block at beginning of turn for each 1 Pluck value."
    );

    smog: CombatResource = new CombatResource(
        "Smog",
        "If you have >4 Smog at beginning of turn, manufacture a Sidearm to hand."
    );

    venture: CombatResource = new CombatResource(
        "Venture",
        "At end of combat, gain a Loot reward option for each 2 Venture value. [this is distinct from ordinary card rewards]"
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