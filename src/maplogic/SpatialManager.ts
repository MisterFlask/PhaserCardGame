// src/managers/SpatialManager.ts

import { GameState } from '../rules/GameState';
import { LocationCard } from './LocationCard';

export class SpatialManager {
    private width: number;
    private height: number;

    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
    }

    public arrangeLocations(): void {
        const locations = GameState.getInstance().getLocations();
        const floors = new Map<number, LocationCard[]>();
        locations.forEach(location => {
            if (!floors.has(location.floor)) {
                floors.set(location.floor, []);
            }
            floors.get(location.floor)!.push(location);
        });

        const floorHeight = 300;
        const leftMargin = this.width / 6;
        const usableWidth = (2 * this.width) / 3;

        floors.forEach((floorLocations, floorNumber) => {
            // Sort locations by room number to ensure adjacent rooms are next to each other
            floorLocations.sort((a, b) => a.roomNumber - b.roomNumber);
            
            const roomCount = floorLocations.length;
            const roomWidth = roomCount > 1 ? usableWidth / (roomCount - 1) : 0; // Handle single room
            
            floorLocations.forEach((location, index) => {
                const x = leftMargin + index * roomWidth;
                const y = floorHeight * floorNumber;
                location.setPosition(x, y);
            });
        });
    }

    public updateDimensions(width: number, height: number): void {
        this.width = width;
        this.height = height;
    }
}
