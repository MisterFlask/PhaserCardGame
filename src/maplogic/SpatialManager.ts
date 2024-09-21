// src/managers/SpatialManager.ts

import { GameState } from '../rules/GameState';
import { LocationCard } from './LocationCard';

export class SpatialManager {
    private width: number;
    private height: number;
    private padding: number;

    constructor(width: number, height: number, padding: number = 100) {
        this.width = width;
        this.height = height;
        this.padding = padding;
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

        const totalFloors = floors.size;
        const floorHeight = (this.height - 2 * this.padding) / totalFloors;
        const leftMargin = this.width / 6;
        const usableWidth = (2 * this.width) / 3;

        floors.forEach((floorLocations, floorNumber) => {
            // Sort locations by room number to ensure adjacent rooms are next to each other
            floorLocations.sort((a, b) => a.roomNumber - b.roomNumber);
            
            const roomCount = floorLocations.length;
            const roomWidth = roomCount > 1 ? usableWidth / (roomCount - 1) : 0; // Handle single room
            
            floorLocations.forEach((location, index) => {
                const x = leftMargin + index * roomWidth;
                const y = this.height - (this.padding + floorNumber * floorHeight);
                location.setPosition(x, y);
            });
        });
    }

    public updateDimensions(width: number, height: number): void {
        this.width = width;
        this.height = height;
    }
}
