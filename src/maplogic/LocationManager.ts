// src/managers/LocationManager.ts

import { GameState } from "../rules/GameState";
import { BossRoomCard, CharonRoomCard, EliteRoomCard, EntranceCard, EventRoomCard, LocationCard, NormalRoomCard, RestSiteCard, ShopCard, TreasureRoomCard } from "./LocationCard";

export class LocationManager {

    constructor() {
    }

    public initializeLocations() : LocationCard[]{
        const numberOfFloors = 9;
        const locationData: LocationCard[] = [];

        for (let floor = 1; floor <= numberOfFloors; floor++) {
            const numNodesOnThisFloor = 5;
            let floorLocationData: LocationCard[] = [];
            let restSiteAssigned = false;

            for (let i = 0; i < numNodesOnThisFloor; i++) {
                let location: LocationCard;

                if (floor === 1 && i === 3) {
                    location = new EntranceCard(floor, i);
                    GameState.getInstance().setCurrentLocation(location);
                } else if (floor === numberOfFloors && i === 3) {
                    location = new BossRoomCard(floor, i);
                } else {
                    const rand = Phaser.Math.FloatBetween(0, 1);
                    if (!restSiteAssigned && i === numNodesOnThisFloor - 2) {
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

                if (location.floor < 5) {
                    location.segment = 1;
                } else {
                    location.segment = 2;
                }
                location.floor = floor;
                location.roomNumber = i;
                location.initEncounter();
                floorLocationData.push(location);
            }

            if (floor === numberOfFloors) {
                floorLocationData = floorLocationData.filter(card => card instanceof BossRoomCard);
            } else if (floor === 1) {
                floorLocationData = floorLocationData.filter(card => card instanceof EntranceCard);
            }

            locationData.push(...floorLocationData);
        }

        const charonFloor = numberOfFloors + 1;
        const charonRoom = new CharonRoomCard(charonFloor, 3);
        charonRoom.floor = charonFloor;
        charonRoom.roomNumber = 3;
        charonRoom.initEncounter();
        locationData.push(charonRoom);

        const bossRoom = locationData.find(
            location => location instanceof BossRoomCard
        );

        if (bossRoom) {
            bossRoom.setAdjacent(charonRoom);
            charonRoom.setAdjacent(bossRoom);
        }
        return locationData;
    }

    public cullUnreachableRooms(locationData: LocationCard[]): LocationCard[] {
        const entrance = locationData.find(loc => loc instanceof EntranceCard);
        if (!entrance) return locationData;

        const reachable = new Set<LocationCard>();
        const queue: LocationCard[] = [entrance];
        
        while (queue.length > 0) {
            const current = queue.shift()!;
            if (reachable.has(current)) continue;
            
            reachable.add(current);
            
            for (const adjacent of current.adjacentLocations) {
                if (!reachable.has(adjacent)) {
                    queue.push(adjacent);
                }
            }
        }

        const specialRooms = locationData.filter(
            loc => loc instanceof BossRoomCard || loc instanceof CharonRoomCard
        );
        specialRooms.forEach(room => reachable.add(room));

        const numCulled = locationData.length - reachable.size;
        console.log(`Culled ${numCulled} unreachable rooms`);
        return locationData.filter(loc => reachable.has(loc));
    }
}
