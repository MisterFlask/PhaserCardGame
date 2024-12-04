// src/managers/LocationManager.ts

import { GameState } from "../rules/GameState";
import { BossRoomCard, CharonRoomCard, EliteRoomCard, EntranceCard, EventRoomCard, LocationCard, NormalRoomCard, RestSiteCard, ShopCard, TreasureRoomCard } from "./LocationCard";

export class LocationManager {
    private locationDeck: LocationCard[] = [];
    private readonly numberOfFloors = 9;
    private readonly nodesPerFloor = 5;

    constructor() {
        this.initializeDeck();
    }

    private initializeDeck(): void {
        // Define the composition of a single deck
        const deckComposition = [
            { type: NormalRoomCard, weight: 4 },
            { type: RestSiteCard, weight: 1 },
            { type: EliteRoomCard, weight: 1 },
            { type: ShopCard, weight: 1 },
            { type: TreasureRoomCard, weight: 1 },
            { type: EventRoomCard, weight: 3 }
        ];

        // Create the deck based on weights
        deckComposition.forEach(({ type, weight }) => {
            for (let i = 0; i < weight; i++) {
                this.locationDeck.push(new type(0, 0));
            }
        });

        this.shuffleDeck();
    }

    private shuffleDeck(): void {
        for (let i = this.locationDeck.length - 1; i > 0; i--) {
            const j = Math.floor(Phaser.Math.FloatBetween(0, i + 1));
            [this.locationDeck[i], this.locationDeck[j]] = [this.locationDeck[j], this.locationDeck[i]];
        }
    }

    private drawCard(floor: number, roomNumber: number): LocationCard {
        if (this.locationDeck.length === 0) {
            this.initializeDeck();
        }
        const card = this.locationDeck.pop()!;
        card.floor = floor;
        card.roomNumber = roomNumber;
        return card;
    }

    public initializeLocations(): LocationCard[] {
        const locationData: LocationCard[] = [];

        for (let floor = 1; floor <= this.numberOfFloors; floor++) {
            let floorLocationData: LocationCard[] = [];
            let restSiteAssigned = false;

            for (let i = 0; i < this.nodesPerFloor; i++) {
                let location: LocationCard;

                // Handle special cases first
                if (floor === 1 && i === 3) {
                    location = new EntranceCard(floor, i);
                    GameState.getInstance().setCurrentLocation(location);
                } else if (floor === this.numberOfFloors && i === 3) {
                    location = new BossRoomCard(floor, i);
                } else {
                    // Draw from the deck for regular rooms
                    location = this.drawCard(floor, i);
                }

                // Set segment based on floor number
                location.segment = floor < 5 ? 1 : 2;
                location.initEncounter();
                floorLocationData.push(location);
            }

            // Filter special floors
            if (floor === this.numberOfFloors) {
                floorLocationData = floorLocationData.filter(card => card instanceof BossRoomCard);
            } else if (floor === 1) {
                floorLocationData = floorLocationData.filter(card => card instanceof EntranceCard);
            }

            locationData.push(...floorLocationData);
        }

        // Add Charon's room
        const charonFloor = this.numberOfFloors + 1;
        const charonRoom = new CharonRoomCard(charonFloor, 3);
        charonRoom.floor = charonFloor;
        charonRoom.roomNumber = 3;
        locationData.push(charonRoom);

        // Connect boss room to Charon's room
        const bossRoom = locationData.find(
            location => location instanceof BossRoomCard
        );

        if (bossRoom) {
            bossRoom.setAdjacent(charonRoom);
            bossRoom.initEncounter();
            
            charonRoom.setAdjacent(bossRoom);
            charonRoom.initEncounter();
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
