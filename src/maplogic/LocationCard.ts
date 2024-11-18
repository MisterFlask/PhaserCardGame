// src/cards/LocationCard.ts

import Phaser from 'phaser';
import { EncounterEnhancer } from '../encounters/EncounterEnhancer';
import { EncounterData, EncounterManager } from '../encounters/Encounters';
import { AbstractCard } from '../gamecharacters/AbstractCard';
import { CardSize, CardType } from '../gamecharacters/Primitives';
import { GameState } from '../rules/GameState';
import { SceneChanger } from '../screens/SceneChanger';
import { Faction } from './Faction';


export class LocationCard extends AbstractCard {
    override typeTag = "LocationCard";
    encounter!: EncounterData;
    controllingFaction: Faction = Faction.NEUTRAL;
    public adjacentLocations: LocationCard[] = []; // New property for adjacency
    public xPos: number = 0;
    public yPos: number = 0;
    public floor: number = 0;
    public roomNumber: number = 0;
    public segment: number = 0;
    public backgroundName?: string;

    constructor({ name, description, portraitName, tooltip, size, floor, index }: { name: string; description: string; portraitName?: string; tooltip?: string; size: CardSize; floor: number; index: number }) { 
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
    }

    initEncounter() {
        const encounter = EncounterManager.getInstance().getRandomEncounterFromActSegmentNumbers(1, this.segment);
        const encounterDescription = `Encounter: ${encounter.enemies.map(e => e.name).join(', ')}`;
        const fullDescription = `${encounterDescription}`;
        this.description = fullDescription;
        this.encounter = encounter;
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
        console.log(`Location ${this.id} selected with encounter: ${this.encounter.enemies.map(e => e.name).join(', ')}`);
        

        GameState.getInstance().eliminatePhysicalCardsBetweenScenes();
        scene.scene.start('CombatScene', { encounter: this.encounter });
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
        });
        this.portraitName = 'entrance-icon';
        this.portraitTint = 0x00ffff;
    }
}

export class BossCard extends LocationCard {
    constructor(floor: number, index: number) {
        super({
            name: 'Boss Room',
            description: 'The final challenge awaits here.',
            size: CardSize.SMALL,
            floor,
            index
        });
        this.portraitName = 'boss-icon';
        this.portraitTint = 0x800080;
    }
}

export class RestSiteCard extends LocationCard {

    constructor(floor: number, index: number) {
        super({
            name: 'Rest Site',
            description: 'Take a moment to recover.',
            size: CardSize.SMALL,
            floor,
            index
        });
        this.portraitName = 'rest-icon';
        this.portraitTint = 0xffa500;
    }

    override OnLocationSelected(scene: Phaser.Scene): void {
        console.log(`Rest site ${this.id} selected`);
        scene.events.emit('locationSelected', this);
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
        });
        this.portraitName = 'room-fight-icon';
        this.portraitTint = 0xff0000;
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
        });
        this.portraitName = 'elite-icon';
        this.portraitTint = 0x8B0000;
    }

    override OnLocationSelected(scene: Phaser.Scene): void {
        console.log(`Location ${this.id} selected with encounter: ${this.encounter.enemies.map(e => e.name).join(', ')}`);
        
        this.encounter = EncounterEnhancer.enhanceEliteEncounter(this.encounter);
        GameState.getInstance().eliminatePhysicalCardsBetweenScenes();
        scene.scene.start('CombatScene', { encounter: this.encounter });
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
        });
        this.portraitName = 'shop-icon';
        this.portraitTint = 0x00ff00;
        this.backgroundName = shopBackgrounds[Math.floor(Math.random() * shopBackgrounds.length)];
    }

    override OnLocationSelected(scene: Phaser.Scene): void {
        console.log(`Location ${this.id} selected with encounter: ${this.encounter.enemies.map(e => e.name).join(', ')}`);
        
        GameState.getInstance().eliminatePhysicalCardsBetweenScenes();
        GameState.getInstance().rerollShop();
        SceneChanger.switchToCombatScene({ encounter: EncounterManager.getInstance().getShopEncounter().data });
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
        });
        this.portraitName = 'treasure-icon';
        this.portraitTint = 0xFFD700;
    }

    override OnLocationSelected(scene: Phaser.Scene): void {
        console.log(`Treasure room ${this.id} selected`);
        
        GameState.getInstance().eliminatePhysicalCardsBetweenScenes();
        SceneChanger.switchToCombatScene({ 
            encounter: EncounterManager.getInstance().getTreasureEncounter().data 
        });
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
        });
        this.portraitName = 'event-icon';
    }
}
