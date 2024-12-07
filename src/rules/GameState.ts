import { Encounter } from '../encounters/EncountersList';
import type { AbstractCard } from '../gamecharacters/AbstractCard';
import type { PlayerCharacter } from '../gamecharacters/BaseCharacterClass';
import type { PlayableCard } from '../gamecharacters/PlayableCard';
import { LedgerItem } from '../ledger/LedgerItem';
import type { LocationCard } from '../maplogic/LocationCard';
import { AbstractRelic } from '../relics/AbstractRelic';
import type { AutomatedCharacterType, BaseCharacterType } from '../Types';
import type { PhysicalCard } from '../ui/PhysicalCard';
import { AbstractCombatResource } from './combatresources/AbstractCombatResource';
import { Ashes } from './combatresources/AshesResource';
import { BloodResource } from './combatresources/BloodResource';
import { MettleResource } from './combatresources/MettleResource';
import { PluckResource } from './combatresources/PluckResource';
import { SmogResource } from './combatresources/SmogResource';
import { VentureResource } from './combatresources/VentureResource';
import { ShopPopulator } from './ShopPopulator';

export class GameState {

    initializeRun() {
        console.log('initializing run')
        this.rerollShop();
        this.combatState.playerCharacters = this.currentRunCharacters

        // Run onRunStart for each buff on each character
        this.currentRunCharacters.forEach(character => {
            character.buffs.forEach(buff => {
                buff.onRunStart();
            });
        });
    }

    private static instance: GameState;
    ledger: LedgerItem[] = [];
    public currentAct: number = 1;
    public roster: PlayerCharacter[] = [];
    public currentRunCharacters: PlayerCharacter[] = [];

    combatShopContents: ShopContents = new ShopContents();
    cursedGoodsShopContents: ShopContents = new ShopContents();
    importShopContents: ShopContents = new ShopContents();

    // player's stuff
    public get masterDeckAllCharacters(): readonly PlayableCard[] {
        return [...this.currentRunCharacters.flatMap(c => c.cardsInMasterDeck)]
    }

    public get allCardsWithHellSellValue(): readonly PlayableCard[] {
        return this.masterDeckAllCharacters.filter(card => card.hellSellValue > 0)
    }
    
    public relicsInventory: AbstractRelic[] = [];

    public surfaceCurrency: number = 200
    public hellCurrency: number = 0
    public hellExportCurrency: number = 0

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
        const currentCharacter = this.currentRunCharacters.filter(card => card.id === character.id)
        const currentCharacterCards = currentCharacter.flatMap(c => c.cardsInMasterDeck)
        return [...currentCharacterCards]
    }

    private obliteratePhysicalCard(item: AbstractCard): void {
        if (item.physicalCard) {
            const card = item.physicalCard as PhysicalCard;
            card.obliterate();
            (item as any).physicalCard = null;
        }
    }

    private obliteratePhysicalCardsForArray(items: readonly (AbstractCard | PlayableCard)[]): void {
        items.forEach(item => this.obliteratePhysicalCard(item));
    }

    public eliminatePhysicalCardsBetweenScenes(){
        // for each physicalCard linked to by each AbstractCard we track, obliterate it and set it to null
        this.obliteratePhysicalCardsForArray(this.roster);
        this.obliteratePhysicalCardsForArray(this.currentRunCharacters);
        this.obliteratePhysicalCardsForArray(this.combatState.playerCharacters);
        this.obliteratePhysicalCardsForArray(this.combatState.enemies);
        
        // Note: Removed the enemyCharacters line as it doesn't exist on CombatState
        // If you need to handle enemy characters, ensure CombatState has this property
        // this.obliteratePhysicalCardsForArray(this.combatState.enemyCharacters);

        this.obliteratePhysicalCardsForArray(this.masterDeckAllCharacters);
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

    public getCurrentRunCharacters(): readonly PlayerCharacter[] {
        return [...this.currentRunCharacters];
    }

    public rerollShop(): void {
        console.log('rerolling shop')
        const shopCards = ShopPopulator.getInstance().getCombatShopCards();
        const shopRelics = ShopPopulator.getInstance().getCombatShopRelics();
        console.log('shop cards after reroll', shopCards)
        console.log('shop relics after reroll', shopRelics)
        this.combatShopContents.shopCardsForSale = shopCards;
        this.combatShopContents.shopRelicsForSale = shopRelics;
        this.combatShopContents.interestInPurchasingImports = false;

        // todo: other shops
        this.cursedGoodsShopContents.shopCardsForSale = ShopPopulator.getInstance().getCursedGoodsCards();
        this.cursedGoodsShopContents.shopRelicsForSale = [];
        this.cursedGoodsShopContents.interestInPurchasingImports = false;
        
        this.importShopContents.interestInPurchasingImports = true;
        this.importShopContents.shopCardsForSale = [];
        this.importShopContents.shopRelicsForSale = [];
    }

    // Reset method
    public reset(): void {
        this.roster = [];
        this.currentRunCharacters = [];
        this.combatShopContents = new ShopContents();
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
            shopItems: this.combatShopContents.shopCardsForSale,
            inventory: this.masterDeckAllCharacters
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

    public addRelic(relic: AbstractRelic, scene: Phaser.Scene): void {
        this.relicsInventory.push(relic);
        if (!scene){
            console.error("No scene provided to addRelic")
            return;
        }
        scene.events.emit('propagateGameStateChangesToUi');
    }

    public initializeCombatState(encounter: Encounter): void {
        // Reset combat state
        this.combatState.reset();
        
        // Set up enemies from encounter
        this.combatState.enemies = [...encounter.enemies];
        
        // Set up player characters
        this.combatState.playerCharacters = [...this.currentRunCharacters];
        
        // Initialize draw pile with all available cards from player characters
        this.combatState.drawPile = this.currentRunCharacters.flatMap(char => 
            char.cardsInMasterDeck.map(card => card.Copy())
        );
    }

}

export class CombatState{

    // Removed direct property, now using TransientUiState
    drawPile: PlayableCard[] = []
    currentDiscardPile: PlayableCard[] = []
    currentHand: PlayableCard[] = []
    currentExhaustPile: PlayableCard[] = []

    enemies: AutomatedCharacterType[] = []
    playerCharacters: PlayerCharacter[] = []

    currentTurn: number = 0

    get allPlayerAndEnemyCharacters(): (BaseCharacterType)[] {
        return [...this.playerCharacters, ...this.enemies];
    }

    get allCardsInAllPilesExceptExhaust(): PlayableCard[] {
        return [...this.drawPile, ...this.currentDiscardPile, ...this.currentHand];
    }

    combatResources: CombatResources = new CombatResources()

    public energyAvailable: number = 0
    public defaultMaxEnergy: number = 3
        
    getBattleCardLocation (cardId: string): BattleCardLocation{
        if (this.drawPile.some(c => c.id === cardId)) return BattleCardLocation.DrawPile
        if (this.currentDiscardPile.some(c => c.id === cardId)) return BattleCardLocation.DiscardPile
        if (this.currentHand.some(c => c.id === cardId)) return BattleCardLocation.Hand
        if (this.currentExhaustPile.some(c => c.id === cardId)) return BattleCardLocation.Exhaust
        return BattleCardLocation.Unknown
    }

    public reset(): void {
        this.drawPile = [];
        this.currentDiscardPile = [];
        this.currentHand = [];
        this.currentExhaustPile = [];
        this.enemies = [];
        this.currentTurn = 0;
        this.energyAvailable = this.defaultMaxEnergy;
        this.combatResources = new CombatResources();
    }
}

export class ShopContents{
    

    // shop stuff
    public shopCardsForSale: PlayableCard[] = [];
    public shopRelicsForSale: AbstractRelic[] = [];
    public interestInPurchasingImports: boolean = false;
}

export enum BattleCardLocation {
    DrawPile,
    DiscardPile,
    Hand,
    Exhaust,
    Unknown
}

export class MissionDetails{
    public difficulty: number = 1
    public reward: number = 10
}

export class CombatResources {
    powder: BloodResource = new BloodResource();
    iron: MettleResource = new MettleResource();
    ashes: Ashes = new Ashes();
    pluck: PluckResource = new PluckResource();
    smog: SmogResource = new SmogResource();
    venture: VentureResource = new VentureResource();

    modifyPluck(byAmount: number) {
        this.pluck.value += byAmount;
        console.log(`Modified Pluck by ${byAmount}. New value: ${this.pluck.value}`);
    }
    modifyAshes(byAmount: number) {
        this.ashes.value += byAmount;
        console.log(`Modified Ashes by ${byAmount}. New value: ${this.ashes.value}`);
    }
    modifyMettle(byAmount: number) {
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
    modifyBlood(byAmount: number) {
        this.powder.value += byAmount;
        console.log(`Modified Blood by ${byAmount}. New value: ${this.powder.value}`);
    }

    getCombatResource(resource: AbstractCombatResource): AbstractCombatResource {
        return this.resources().find(r => r.name === resource.name)!;
    }

    resources(): AbstractCombatResource[] {
        return [this.powder, this.pluck, this.ashes, this.iron, this.venture, this.smog];
    }
}