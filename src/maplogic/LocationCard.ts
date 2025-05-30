// src/cards/LocationCard.ts

import Phaser from 'phaser';
import { EncounterEnhancer } from '../encounters/EncounterEnhancer';
import { Encounter, EncounterManager } from "../encounters/EncounterManager";
import { Charon } from '../encounters/monsters/special/Charon';
import { AbstractEvent } from "../events/AbstractEvent";
import { AbstractCard } from "../gamecharacters/AbstractCard";
import { AbstractBuff } from "../gamecharacters/buffs/AbstractBuff";
import { CardSize, CardType } from '../gamecharacters/Primitives';
import { RelicsLibrary } from '../relics/RelicsLibrary';
import { AbstractReward } from "../rewards/AbstractReward";
import { CardReward } from "../rewards/CardReward";
import { CurrencyReward } from '../rewards/CurrencyReward';
import { RelicReward } from '../rewards/RelicReward';
import { ImprovedSalePrices } from '../rules/acts/location/ImprovedSalePrices';
import { CardRewardsGenerator } from '../rules/CardRewardsGenerator';
import { GameState } from "../rules/GameState";
import { CardModifier } from '../rules/modifiers/AbstractCardModifier';
import { RestSiteUpgradeOptionManager } from '../rules/RestSiteUpgradeOption';
import CombatUIManager from '../screens/subcomponents/CombatUiManager';
import { ActionManager } from '../utils/ActionManager';
import { Faction } from './Faction';
import { LocationType, LocationTypes } from "./LocationType";

export abstract class LocationCard extends AbstractCard {
    override typeTag = "LocationCard";
    encounter!: Encounter;
    controllingFaction: Faction = Faction.NEUTRAL;
    public adjacentLocations: LocationCard[] = []; // New property for adjacency
    public xPos: number = 0;
    public yPos: number = 0;
    public floor: number = 0;
    public roomNumber: number = 0;
    public get segment(): number {
        if (this.floor < 3) {
            return 0;
        } else if (this.floor < 6) {
            return 1;
        } else {
            return 2;
        }
    }
    public backgroundName?: string;
    public gameEvent?: AbstractEvent;
    public currentExpectedRewards: AbstractReward[] = [];
    public readonly locationType: LocationType;
    public buffs: AbstractBuff[] = [];

    constructor({ name, description, portraitName, tooltip, size, floor, index }: { name: string; description: string; portraitName?: string; tooltip?: string; size: CardSize; floor: number; index: number }, type: LocationType) { 
        const fullName = `${name} ${floor}-${index + 1}`;

        super({
            name: fullName,
            description: "",
            portraitName,
            cardType: CardType.NON_PLAYABLE,
            tooltip,
            size // Pass the size parameter
        });

        this.floor = floor;
        this.roomNumber = index;       
        this.locationType = type;
    }

    initEncounter() {
        const encounter = EncounterManager.getInstance().getRandomEnemiesListFromActSegmentNumbers(GameState.getInstance().currentAct, this.segment);
        const encounterDescription = `Encounter: ${encounter.enemies.map(e => e.name).join(', ')}`;
        const fullDescription = `${encounterDescription}`;
        this.description = fullDescription;
        this.encounter = new Encounter(encounter.enemies, GameState.getInstance().currentAct, this.segment);
    }

    setAdjacent(location: LocationCard) {
        if (!this.adjacentLocations.includes(location)) {
            this.adjacentLocations.push(location);
        }
    }

    setPosition(x: number, y: number) {
        this.xPos = x;
        this.yPos = y;
        if (this.physicalCard) {
            this.physicalCard.container.setPosition(x, y);
        }
    }

    OnLocationSelected(scene: Phaser.Scene): void {
        console.log(`Location ${this.id} selected with encounter: ${this.encounter?.enemies?.map(e => e.name)?.join(', ')}`);
        if (this.encounter) {
            ActionManager.getInstance().cleanupAndRestartCombat({ encounter: this.encounter, shouldStartWithMapOverlay: false });
        }else{
            console.log(`Location ${this.id} has no encounter`);
        }
    }

    public determineBaseRewards(): AbstractReward[] {
        return []; // Base location cards yield no rewards by default
    }
}

// Add specific LocationCard subclasses
export class EntranceCard extends LocationCard {
    constructor(floor: number, index: number) {
        super({
            name: 'Entrance',
            description: 'The starting point of your adventure.',
            size: CardSize.SMALL,
            floor,
            index
        }, LocationTypes.ENTRANCE);
        this.portraitName = 'entrance-icon';
        this.portraitTint = 0x00ffff;
    }

    override OnLocationSelected(scene: Phaser.Scene): void {
        console.log(`Entrance ${this.id} selected`);
        ActionManager.getInstance().cleanupAndRestartCombat({ encounter: new Encounter([], GameState.getInstance().currentAct, this.segment), shouldStartWithMapOverlay: false });

        CombatUIManager.getInstance().showCustomRewards([new CardReward(CardRewardsGenerator.getInstance().generateCardRewardsForCombat())]);
    }

    override determineBaseRewards(): AbstractReward[] {
        const rewards: AbstractReward[] = [];
        return rewards;
    }
}

export class BossRoomCard extends LocationCard {
    constructor(floor: number, index: number) {
        super({
            name: 'Boss Room',
            description: 'The final challenge awaits here.',
            size: CardSize.LARGE,
            floor,
            index
        }, LocationTypes.BOSS);
        this.portraitName = 'boss-icon';
        this.portraitTint = 0x800080;
    }

    override initEncounter(): void {
        const encounter = EncounterManager.getInstance().getBossEncounter(GameState.getInstance().currentAct);
        const encounterDescription = `Encounter: ${encounter.enemies.map(e => e.name).join(', ')}`;
        const fullDescription = `${encounterDescription}`;
        this.description = fullDescription;
        this.encounter = encounter;
    }

    override determineBaseRewards(): AbstractReward[] {
        const rewards: AbstractReward[] = [];
        const cardRewards = CardRewardsGenerator.getInstance().generateCardRewardsForCombat();
        rewards.push(new CardReward(cardRewards));
        rewards.push(new CurrencyReward(200)); // Boss rooms give the most currency

        return rewards;
    }
}

export class RestSiteCard extends LocationCard {

    public restSiteUpgradeOptions: CardModifier[] = [];
    constructor(floor: number, index: number) {
        super({
            name: 'Rest Site',
            description: 'Take a moment to recover.',
            size: CardSize.SMALL,
            floor,
            index
        }, LocationTypes.REST);
        this.portraitName = 'rest-icon';
        this.portraitTint = 0xffa500;
        this.restSiteUpgradeOptions = RestSiteUpgradeOptionManager.getInstance().getRandomSetOfUpgradeOptions(3);

    }

    override OnLocationSelected(scene: Phaser.Scene): void {
        console.log(`Rest room ${this.id} selected`);
        
        const eventEncounter = EncounterManager.getInstance().getRestEncounter(this.restSiteUpgradeOptions);
        ActionManager.getInstance().cleanupAndRestartCombat({ encounter: eventEncounter, shouldStartWithMapOverlay: false });
        this.gameEvent = eventEncounter.event;  
    }
}

export class CharonRoomCard extends LocationCard {
    constructor(floor: number, index: number) {
        super({
            name: 'Charon',
            description: `Incur a debt of 100 Sovereign Infernal Notes for passage, payable on departure from Hell.`,
            size: CardSize.SMALL,
            floor,
            index
        }, LocationTypes.CHARON);
        this.portraitName = 'CharonRoom';
        this.portraitTint = 0x800080;
    }

    override initEncounter(): void {
        this.encounter = new Encounter([new Charon()], GameState.getInstance().currentAct, 3);
    }
}

export class NormalRoomCard extends LocationCard {
    constructor(floor: number, index: number) {
        super({
            name: 'Normal Room',
            description: `This is a normal room on floor ${floor}.`,
            size: CardSize.SMALL,
            floor,
            index
        }, LocationTypes.COMBAT);
        this.portraitName = 'room-fight-icon';
        this.portraitTint = 0xff0000;
    }

    override determineBaseRewards(): AbstractReward[] {
        const rewards: AbstractReward[] = [];
        const cardRewards = CardRewardsGenerator.getInstance().generateCardRewardsForCombat();
        rewards.push(new CardReward(cardRewards));
        rewards.push(new CurrencyReward(100));
        return rewards;
    }
}

export class EliteRoomCard extends LocationCard {
    constructor(floor: number, index: number) {
        super({
            name: 'Elite Room',
            description: `This is an elite room on floor ${floor}.`,
            size: CardSize.SMALL,
            floor,
            index
        }, LocationTypes.ELITE_COMBAT);
        this.portraitName = 'elite-icon';
        this.portraitTint = 0x8B0000;
    }

    override determineBaseRewards(): AbstractReward[] {
        const rewards: AbstractReward[] = [];
        const cardRewards = CardRewardsGenerator.getInstance().generateCardRewardsForCombat();
        rewards.push(new CardReward(cardRewards));
        rewards.push(new CurrencyReward(55)); // Elite rooms give more currency
        rewards.push(new RelicReward(RelicsLibrary.getInstance().getRandomBeneficialRelics(1)[0]));
        return rewards;
    }

    override OnLocationSelected(scene: Phaser.Scene): void {
        console.log(`Location ${this.id} selected with encounter: ${this.encounter.enemies.map(e => e.name).join(', ')}`);
        
        this.encounter = EncounterEnhancer.enhanceEliteEncounter(this.encounter);
        ActionManager.getInstance().cleanupAndRestartCombat({ encounter: this.encounter, shouldStartWithMapOverlay: false });
    }
}

const shopBackgrounds = ["shop-background-1"];

export class ShopCard extends LocationCard {
    constructor(floor: number, index: number) {
        super({
            name: 'Shop',
            description: `This is a shop on floor ${floor}.`,
            size: CardSize.SMALL,
            floor,
            index
        }, LocationTypes.MERCHANT);
        this.portraitName = 'shop-icon';
        this.portraitTint = 0x00ff00;
        this.backgroundName = shopBackgrounds[Math.floor(Math.random() * shopBackgrounds.length)];
    }

    override OnLocationSelected(scene: Phaser.Scene): void {
        console.log(`Location ${this.id} selected with encounter: ${this.encounter.enemies.map(e => e.name).join(', ')}`);

        GameState.getInstance().rerollShop();

        ActionManager.getInstance().cleanupAndRestartCombat({ encounter: EncounterManager.getInstance().getShopEncounter(), shouldStartWithMapOverlay: false });
    }
}

export class CommoditiesTraderCard extends LocationCard {
    constructor(floor: number, index: number) {
        super({
            name: 'Commodities Trader',
            description: `This is a commodities trader on floor ${floor}.`,
            size: CardSize.SMALL,
            floor,
            index
        }, LocationTypes.COMMODITY_TRADER);
        this.portraitName = 'shop-icon';
        this.portraitTint = 0xFFA500;
        this.backgroundName = shopBackgrounds[Math.floor(Math.random() * shopBackgrounds.length)];
    }

    override initEncounter(): void {

        // Add ImprovedSalePrices buff based on act
        const gameState = GameState.getInstance();
        if (gameState.currentAct === 2) {
            const buff = new ImprovedSalePrices();
            buff.stacks = 100; // +100% sale price
            this.buffs.push(buff);
        } else if (gameState.currentAct === 3) {
            const buff = new ImprovedSalePrices();
            buff.stacks = 300; // +300% sale price
            this.buffs.push(buff);
        }
        this.encounter = EncounterManager.getInstance().getCommoditiesTrader();
    }

    override OnLocationSelected(scene: Phaser.Scene): void {
        console.log(`Location ${this.id} selected with encounter: ${this.encounter.enemies.map(e => e.name).join(', ')}`);

        GameState.getInstance().rerollShop();

        ActionManager.getInstance().cleanupAndRestartCombat({ encounter: EncounterManager.getInstance().getCommoditiesTrader(), shouldStartWithMapOverlay: false });
    }
}

export class TreasureRoomCard extends LocationCard {
    constructor(floor: number, index: number) {
        super({
            name: 'Treasure Room',
            description: `A mysterious chest awaits...`,
            size: CardSize.SMALL,
            floor,
            index
        }, LocationTypes.TREASURE);
        this.portraitName = 'treasure-icon';
        this.portraitTint = 0xFFD700;
    }

    override OnLocationSelected(scene: Phaser.Scene): void {
        console.log(`Treasure room ${this.id} selected`);
        
        ActionManager.getInstance().cleanupAndRestartCombat({ encounter: EncounterManager.getInstance().getTreasureEncounter(), shouldStartWithMapOverlay: false });
    }
}

export class EventRoomCard extends LocationCard {
    constructor(floor: number, index: number) {
        super({
            name: 'Event Room',
            description: `This is an event room on floor ${floor}.`,
            size: CardSize.SMALL,
            floor,
            index
        }, LocationTypes.EVENT);
        this.portraitName = 'event-icon';
    }
    override OnLocationSelected(scene: Phaser.Scene): void {
        console.log(`Event room ${this.id} selected`);
        const eventEncounter = EncounterManager.getInstance().getEventRoomEncounter(GameState.getInstance().currentAct, this.segment);
        ActionManager.getInstance().cleanupAndRestartCombat({ encounter: eventEncounter, shouldStartWithMapOverlay: false });
        this.gameEvent = eventEncounter.event;  

    }
}
