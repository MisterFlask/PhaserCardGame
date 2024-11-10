import type { AbstractCard } from '../gamecharacters/AbstractCard';
import type { PlayerCharacter } from '../gamecharacters/CharacterClasses';
import type { PlayableCard } from '../gamecharacters/PlayableCard';
import type { LocationCard } from '../maplogic/LocationCard';
import { AbstractRelic } from '../relics/AbstractRelic';
import type { AutomatedCharacterType, BaseCharacterType } from '../Types';
import type { PhysicalCard } from '../ui/PhysicalCard';
import { AbstractCombatResource } from './combatresources/AbstractCombatResource';
import { IronResource } from './combatresources/IronResource';
import { PagesResource } from './combatresources/PagesResource';
import { PluckResource } from './combatresources/PluckResource';
import { PowderResource } from './combatresources/PowderResource';
import { SmogResource } from './combatresources/SmogResource';
import { VentureResource } from './combatresources/VentureResource';

export class GameState {
    private static instance: GameState;

    public roster: PlayerCharacter[] = [];
    public currentRunCharacters: PlayerCharacter[] = [];
    public shopItems: PlayableCard[] = [];
    public cardsInventory: PlayableCard[] = [];
    public relicsInventory: AbstractRelic[] = [];

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

    public getCardsOwnedByCharacter(character: PlayerCharacter): PlayableCard[]{
        const inventoryCards = this.cardsInventory.filter(card => card.owner?.id === character.id)
        const currentCharacter = this.currentRunCharacters.filter(card => card.id === character.id)
        const currentCharacterCards = currentCharacter.flatMap(c => c.cardsInMasterDeck)
        return [...inventoryCards, ...currentCharacterCards]
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

        this.obliteratePhysicalCardsForArray(this.cardsInventory);
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
        this.cardsInventory.push(item);
        // Optionally, update UI or perform additional actions
    }

    public removeFromInventory(item: PlayableCard): void {
        this.cardsInventory = this.cardsInventory.filter(i => i !== item);
    }

    public getInventory(): PlayableCard[] {
        return [...this.cardsInventory];
    }

    // Reset method
    public reset(): void {
        this.roster = [];
        this.currentRunCharacters = [];
        this.shopItems = [];
        this.cardsInventory = [];
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
            inventory: this.cardsInventory
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
    playerCharacters: PlayerCharacter[] = []

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

export class CombatResources {
    powder: PowderResource = new PowderResource();
    iron: IronResource = new IronResource();
    pages: PagesResource = new PagesResource();
    pluck: PluckResource = new PluckResource();
    smog: SmogResource = new SmogResource();
    venture: VentureResource = new VentureResource();

    modifyPluck(byAmount: number) {
        this.pluck.value += byAmount;
        console.log(`Modified Pluck by ${byAmount}. New value: ${this.pluck.value}`);
    }
    modifyPages(byAmount: number) {
        this.pages.value += byAmount;
        console.log(`Modified Pages by ${byAmount}. New value: ${this.pages.value}`);
    }
    modifyIron(byAmount: number) {
        this.iron.value += byAmount;
        console.log(`Modified Iron by ${byAmount}. New value: ${this.iron.value}`);
    }
    modifyVenture(byAmount: number) {
        this.venture.value += byAmount;
        console.log(`Modified Venture by ${byAmount}. New value: ${this.venture.value}`);
    }
    modifySmog(byAmount: number) {
        this.smog.value += byAmount;
        console.log(`Modified Smog by ${byAmount}. New value: ${this.smog.value}`);
    }
    modifyPowder(byAmount: number) {
        this.powder.value += byAmount;
        console.log(`Modified Powder by ${byAmount}. New value: ${this.powder.value}`);
    }

    getCombatResource(resource: AbstractCombatResource): AbstractCombatResource {
        return this.resources().find(r => r.name === resource.name)!;
    }

    resources(): AbstractCombatResource[] {
        return [this.powder, this.pluck, this.pages, this.iron, this.venture, this.smog];
    }
}