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

    constructor({ name, description, portraitName, tooltip, size }: { name: string; description: string; portraitName?: string; tooltip?: string; size: CardSize }) { // Added 'size' parameter
        const encounter = EncounterManager.getInstance().getRandomEncounter();
        const encounterDescription = `Encounter: ${encounter.enemies.map(e => e.name).join(', ')}`;
        const fullDescription = `${description}\n\n${encounterDescription}`;

        super({
            name,
            description: fullDescription,
            portraitName,
            cardType: CardType.CHARACTER,
            tooltip,
            size // Pass the size parameter
        });

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
        this.physicalCard?.container.setPosition(x, y);
    }

    OnLocationSelected(scene: Phaser.Scene): void {
        console.log(`Location ${this.id} selected with encounter: ${this.encounter.enemies.map(e => e.name).join(', ')}`);
        
        GameState.getInstance().eliminatePhysicalCardsBetweenScenes();
        scene.scene.start('CombatScene', { encounter: this.encounter });
    }
}
