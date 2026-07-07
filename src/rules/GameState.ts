import { AbstractConsumable } from '../consumables/AbstractConsumable';
import { MAX_CONSUMABLE_STOCK } from '../campaign/ConsumableStock';
import { Encounter } from '../encounters/EncounterManager';
import type { AbstractCard } from '../gamecharacters/AbstractCard';
import { PlayerVessel } from '../gamecharacters/cargo/PlayerCargoHolder';
import type { PlayableCard } from '../gamecharacters/PlayableCard';
import type { PlayerCharacter } from '../gamecharacters/PlayerCharacter';
import { AbstractRelic } from '../relics/AbstractRelic';
import type { AutomatedCharacterType, BaseCharacterType } from '../Types';
import type { PhysicalCard } from '../ui/PhysicalCard';
import { AbstractCombatResource } from './combatresources/AbstractCombatResource';
import { AshesResource } from './combatresources/AshesResource';
import { BloodResource } from './combatresources/BloodResource';
import { MettleResource } from './combatresources/MettleResource';
import { PluckResource } from './combatresources/PluckResource';
import { SmogResource } from './combatresources/SmogResource';
import { VentureResource } from './combatresources/VentureResource';

export class GameState {

    initializeRun() {
        console.log('initializing run')
        this.combatState.playerCharacters = this.currentRunCharacters

        // The old run-scoped EmergencyTeleporter seed is gone (Relic
        // Equipment Slots, src/docs/relic_equipment_design.md): it now lives
        // in the fresh-campaign armoury (CampaignUiState.armoury) and
        // reaches relicsInventory, if equipped, via SortieManager.startSortie
        // like any other equipped relic — which runs immediately after this
        // method and repopulates the array from the deployed squad's slots.
        this.relicsInventory = []

        // Run onRunStart for each buff on each character
        this.currentRunCharacters.forEach(character => {
            character.buffs.forEach(buff => {
                buff.onRunStart();
            });
        });

    }

    private static instance: GameState;
    ledger: AbstractRelic[] = [];
    public currentAct: number = 1;

    // The campaign roster lives on CampaignUiState; GameState only tracks the
    // squad deployed on the current sortie.
    public currentRunCharacters: PlayerCharacter[] = [];

    public currentVessel: PlayerVessel = new PlayerVessel();

    // The active sortie loadout. Canonical campaign-lifetime stock lives on
    // CampaignUiState.consumables; SortieManager transfers ownership into
    // this array on dispatch and back out on successful resolution (lost on
    // squad wipe). A fresh campaign starts with zero — no default seed.
    public consumables: AbstractConsumable[] = [];
    /** Alias for the shared cap, kept so combat UI (slot rendering) doesn't
     *  need to import ConsumableStock directly. */
    public get maxConsumables(): number {
        return MAX_CONSUMABLE_STOCK;
    }

    public getRandomAllyCharacter(): PlayerCharacter {
        return this.currentRunCharacters[Math.floor(Math.random() * this.currentRunCharacters.length)];
    }


    // player's stuff
    public get masterDeckAllCharacters(): readonly PlayableCard[] {
        return [...this.currentRunCharacters.flatMap(c => c.cardsInMasterDeck)]
    }

    public get allCardsWithHellSellValue(): readonly PlayableCard[] {
        const masterDeckCards = this.masterDeckAllCharacters.filter(card => card.finalHellSellValue > 0);
        const cargoCards = this.currentVessel.cardsInMasterDeck.filter(card => card.finalHellSellValue > 0);
        return [...masterDeckCards, ...cargoCards];
    }
    
    public relicsInventory: AbstractRelic[] = [];

    /** The company's single currency (£). Earned by contracts, spent on
     *  everything, and drained by the quarterly dividend. */
    public moneyInVault: number = 200

    public combatState: CombatState = new CombatState()

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
        this.obliteratePhysicalCardsForArray(this.currentRunCharacters);
        this.obliteratePhysicalCardsForArray(this.combatState.playerCharacters);
        this.obliteratePhysicalCardsForArray(this.combatState.enemies);
        this.obliteratePhysicalCardsForArray(this.masterDeckAllCharacters);
    }

    public getCurrentRunCharacters(): readonly PlayerCharacter[] {
        return [...this.currentRunCharacters];
    }

    // Reset method
    public reset(): void {
        this.currentRunCharacters = [];
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

    public getRightmostCardInHand(): PlayableCard | null {
        return this.currentHand.length > 0 ? this.currentHand[this.currentHand.length - 1] : null;
    }
    public getLeftmostCardInHand(): PlayableCard | null {
        return this.currentHand.length > 0 ? this.currentHand[0] : null;
    }

    public getTopNCardsInPile(pile: PlayableCard[], n: number): PlayableCard[] {
        return pile.slice(-n);
    }

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
    blood: BloodResource = new BloodResource();
    mettle: MettleResource = new MettleResource();
    ashes: AshesResource = new AshesResource();
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
        this.mettle.value += byAmount;
        console.log(`Modified Iron by ${byAmount}. New value: ${this.mettle.value}`);
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
        this.blood.value += byAmount;
        console.log(`Modified Blood by ${byAmount}. New value: ${this.blood.value}`);
    }

    getCombatResource(resource: AbstractCombatResource): AbstractCombatResource {
        return this.resources().find(r => r.name === resource.name)!;
    }

    resources(): AbstractCombatResource[] {
        return [this.blood, this.pluck, this.ashes, this.mettle, this.venture, this.smog];
    }
}