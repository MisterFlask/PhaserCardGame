// src/managers/LocationManager.ts

import { GameState } from "../rules/GameState";
import { BossCard, EliteRoomCard, EntranceCard, EventRoomCard, LocationCard, NormalRoomCard, RestSiteCard, ShopCard, TreasureRoomCard } from "./LocationCard";

export class LocationManager {

    constructor() {
    }

    public initializeLocations() {
        const numberOfFloors = 9; // Step 2. Set number of floors between 3 and 5

        const locationData: LocationCard[] = [];

        for (let floor = 1; floor <= numberOfFloors; floor++) { // Step 3. For each floor
            const numNodesOnThisFloor = 5; // Step 3a. Create 5-8 nodes per floor

            let floorLocationData: LocationCard[] = [];
            

            // Ensure at least one Rest Site per floor
            let restSiteAssigned = false;

            for (let i = 0; i < numNodesOnThisFloor; i++) {
                let location: LocationCard;

                if (i === 0 && floor === 1) {
                    location = new EntranceCard(floor, i); // Step 5. Entrance node at floor 1
                    GameState.getInstance().setCurrentLocation(location);
                } else if (floor === numberOfFloors && i === numNodesOnThisFloor -1) {
                    location = new BossCard(floor, i); // Step 6. Boss node at top floor
                } else {
                    const rand = Phaser.Math.FloatBetween(0, 1);
                    if (!restSiteAssigned && i === numNodesOnThisFloor - 2) { // Ensure at least one Rest Site
                        location = new RestSiteCard(floor, i);
                        restSiteAssigned = true;
                    } else if (rand < 0.6) {
                        location = new NormalRoomCard(floor, i);
                    } else if (rand < 0.7) {
                        location = new RestSiteCard(floor, i);
                    } else if (rand < 0.8) {
                        location = new EliteRoomCard(floor, i);
                    } else if (rand < 0.85) {
                        location = new ShopCard(floor, i);
                    } else if (rand < 0.9) {
                        location = new TreasureRoomCard(floor, i);
                    } else {
                        location = new EventRoomCard(floor, i);
                    }
                }

                location.floor = floor;
                location.roomNumber = i;
                floorLocationData.push(location);
            }


            // Ensure at least one Rest Site
            if (!floorLocationData.some(card => card instanceof RestSiteCard)) {
                const index = Phaser.Math.Between(1, floorLocationData.length - 2);
                floorLocationData[index] = new RestSiteCard(floor, index);
            }

            locationData.push(...floorLocationData);
        }

        GameState.getInstance().setLocations(locationData);
    }
}