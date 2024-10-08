// src/cards/LocationCard.ts

import Phaser from 'phaser';
import { EncounterData, EncounterManager } from '../encounters/Encounters';
import { AbstractCard } from '../gamecharacters/AbstractCard';
import { CardSize, CardType } from '../gamecharacters/Primitives';
import { GameState } from '../rules/GameState';

export class LocationCard extends AbstractCard {
    encounter: EncounterData;
    public adjacentLocations: LocationCard[] = []; // New property for adjacency
    public xPos: number = 0;
    public yPos: number = 0;
    public floor: number = 0;
    public roomNumber: number = 0;

    constructor({ name, description, portraitName, tooltip, size, floor, index }: { name: string; description: string; portraitName?: string; tooltip?: string; size: CardSize; floor: number; index: number }) { 
        const fullName = `${name} ${floor}-${index + 1}`;

        const encounter = EncounterManager.getInstance().getRandomEncounter();
        const encounterDescription = `Encounter: ${encounter.enemies.map(e => e.name).join(', ')}`;
        const fullDescription = `${description}\n\n${encounterDescription}`;

        super({
            name: fullName,
            description: fullDescription,
            portraitName,
            cardType: CardType.CHARACTER,
            tooltip,
            size // Pass the size parameter
        });

        this.encounter = encounter;
        this.floor = floor;
        this.roomNumber = index;
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
    }
}

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
    }
}

export class TreasureRoomCard extends LocationCard {
    constructor(floor: number, index: number) {
        super({
            name: 'Treasure Room',
            description: `This is a treasure room on floor ${floor}.`,
            size: CardSize.SMALL,
            floor,
            index
        });
        this.portraitName = 'treasure-icon';
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
