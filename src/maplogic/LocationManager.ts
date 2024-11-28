// src/managers/LocationManager.ts

import { GameState } from "../rules/GameState";
import { BossRoomCard, CharonRoomCard, EliteRoomCard, EntranceCard, EventRoomCard, LocationCard, NormalRoomCard, RestSiteCard, ShopCard, TreasureRoomCard } from "./LocationCard";

export class LocationManager {

    constructor() {
    }

    public initializeLocations() : LocationCard[]{
        const numberOfFloors = 9; // Step 2. Set number of floors between 3 and 5

        const locationData: LocationCard[] = [];

        for (let floor = 1; floor <= numberOfFloors; floor++) { // Step 3. For each floor
            const numNodesOnThisFloor = 5; // Step 3a. Create 5-8 nodes per floor

            let floorLocationData: LocationCard[] = [];
            

            // Ensure at least one Rest Site per floor
            let restSiteAssigned = false;

            for (let i = 0; i < numNodesOnThisFloor; i++) {
                let location: LocationCard;

                if (i === Math.floor(numNodesOnThisFloor/2) && floor === 1) {
                    location = new EntranceCard(floor, i); // Step 5. Entrance node at floor 1
                    GameState.getInstance().setCurrentLocation(location);
                } else if (floor === numberOfFloors && i === Math.floor(numNodesOnThisFloor/2)) {
                    location = new BossRoomCard(floor, i); // Step 6. Boss node at top floor
                } else {
                    const rand = Phaser.Math.FloatBetween(0, 1);
                    if (!restSiteAssigned && i === numNodesOnThisFloor - 2) { // Ensure at least one Rest Site
                        location = new RestSiteCard(floor, i);
                        restSiteAssigned = true;
                    } else if (rand < 0.3) {
                        location = new NormalRoomCard(floor, i);
                    } else if (rand < 0.5) {
                        location = new RestSiteCard(floor, i);
                    } else if (rand < 0.6) {
                        location = new EliteRoomCard(floor, i);
                    } else if (rand < 0.8) {
                        location = new ShopCard(floor, i);
                    } else if (rand < 0.95) {
                        location = new TreasureRoomCard(floor, i);
                    } else {
                        location = new EventRoomCard(floor, i);
                    }
                }

                if (location.floor < 5){
                    location.segment = 1;
                } else {
                    location.segment = 2;
                }
                location.floor = floor;
                location.roomNumber = i;
                location.initEncounter();
                floorLocationData.push(location);
            }


            // remove all non-boss rooms from the last floor, and all non-entrance rooms from the first floor
            if (floor === numberOfFloors) {
                floorLocationData = floorLocationData.filter(card => card instanceof BossRoomCard);
            } else if (floor === 1) {
                floorLocationData = floorLocationData.filter(card => card instanceof EntranceCard);
            }

            // Cull unreachable rooms
            //const reachableRooms = this.findReachableRooms(floorLocationData);
            //floorLocationData = reachableRooms;


            locationData.push(...floorLocationData);
        }

        // After generating all floors, add the Charon Room on the floor below the Boss Room
        const bossFloor = numberOfFloors;
        const charonFloor = bossFloor + 1;

        // Create the Charon Room
        const charonRoom = new CharonRoomCard(charonFloor, 0);
        charonRoom.floor = charonFloor;
        charonRoom.roomNumber = 0;
        charonRoom.initEncounter();
        locationData.push(charonRoom);

        // Find the Boss Room and set adjacency
        const bossRoom = locationData.find(
            location => location instanceof BossRoomCard
        );

        if (bossRoom) {
            // Set adjacency between Boss Room and Charon Room
            bossRoom.setAdjacent(charonRoom);
            charonRoom.setAdjacent(bossRoom);
        }

        return locationData;
    }

    findReachableRooms(floorLocationData: LocationCard[]): LocationCard[] {
        const reachableRooms: LocationCard[] = [];
        const visited = new Set<LocationCard>();
        const queue: LocationCard[] = [];

        // Start from the entrance room
        const entrance = GameState.getInstance().getCurrentLocation()
        if (entrance && floorLocationData.includes(entrance)) {
            queue.push(entrance);
            visited.add(entrance);
        }

        while (queue.length > 0) {
            const currentRoom = queue.shift()!;
            reachableRooms.push(currentRoom);

            // Check adjacent rooms
            for (const adjacentRoom of currentRoom.adjacentLocations) {
                if (!visited.has(adjacentRoom) && floorLocationData.includes(adjacentRoom)) {
                    visited.add(adjacentRoom);
                    queue.push(adjacentRoom);
                }
            }
        }

        return reachableRooms;
    }
}
