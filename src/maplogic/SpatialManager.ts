// src/managers/SpatialManager.ts

import Phaser from 'phaser';
import { LocationCard } from './LocationCard';

export class SpatialManager {
    private width: number;
    private height: number;
    private padding: number;
    private minDistance: number; // Minimum distance between any two locations

    constructor(width: number, height: number, padding: number = 100, minDistance: number = 100) {
        this.width = width;
        this.height = height;
        this.padding = padding;
        this.minDistance = minDistance;
    }

    public arrangeLocations(locations: LocationCard[]): void {
        const centralArea = {
            minX: this.width / 6,
            maxX: (5 * this.width) / 6,
            minY: this.height / 6,
            maxY: (5 * this.height) / 6
        };

        locations.forEach(location => {
            let position: Phaser.Math.Vector2;
            let attempts = 0;
            do {
                const x = Phaser.Math.Between(centralArea.minX, centralArea.maxX);
                const y = Phaser.Math.Between(centralArea.minY, centralArea.maxY);
                position = new Phaser.Math.Vector2(x, y);
                attempts++;
                if (attempts > 100) break; // Prevent infinite loops
            } while (!this.isPositionValid(position, locations));

            location.setPosition(position.x, position.y);
            console.log(`Location ${location.id}: x=${location.xPos}, y=${location.yPos}`);
        });
    }

    private isPositionValid(position: Phaser.Math.Vector2, locations: LocationCard[]): boolean {
        for (const loc of locations) {
            const dx = loc.xPos - position.x;
            const dy = loc.yPos - position.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < this.minDistance) {
                return false;
            }
        }
        return true;
    }

    public placePositions(locations: LocationCard[]): void {
        locations.forEach(location => {
            if (location.xPos !== undefined && location.yPos !== undefined) {
                location.setPosition(location.xPos, location.yPos);
            } else {
                console.warn(`Location ${location.id} has undefined position.`);
            }
        });
    }

    public updateDimensions(width: number, height: number): void {
        this.width = width;
        this.height = height;
    }
}
