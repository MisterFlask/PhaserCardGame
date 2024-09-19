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
        const numLocations = locations.length;
        const numCols = Math.ceil(Math.sqrt(numLocations));
        const numRows = Math.ceil(numLocations / numCols);
        const horizontalSpacing = (this.width - 2 * this.padding) / numCols;
        const verticalSpacing = (this.height - 2 * this.padding) / numRows;
        const perturbation = 50; // Maximum random offset in pixels

        locations.forEach((location, index) => {
            const row = Math.floor(index / numCols);
            const col = index % numCols;

            const baseX = this.padding + col * horizontalSpacing + horizontalSpacing / 2;
            const baseY = this.padding + row * verticalSpacing + verticalSpacing / 2;

            const offsetX = Phaser.Math.Between(-perturbation, perturbation);
            const offsetY = Phaser.Math.Between(-perturbation, perturbation);

            const finalX = Phaser.Math.Clamp(baseX + offsetX, this.padding, this.width - this.padding);
            const finalY = Phaser.Math.Clamp(baseY + offsetY, this.padding, this.height - this.padding);

            location.setPosition(finalX, finalY);
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
