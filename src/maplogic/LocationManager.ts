// src/managers/LocationManager.ts

import { LocationBuffRegistry } from "../maplogic/LocationBuffRegistry";
import { GameState } from "../rules/GameState";
import { BossRoomCard, CharonRoomCard, CommoditiesTraderCard, EliteRoomCard, EntranceCard, EventRoomCard, LocationCard, NormalRoomCard, RestSiteCard, ShopCard, TreasureRoomCard } from "./LocationCard";

export class LocationManager {
    // Map configuration constants
    private readonly numberOfFloors = 15; // 0-9, entrance on 0, boss on 14, Charon on 15
    private readonly nodesPerFloor = 5;
    private readonly treasureFloorIndex = 8; // The middle floor that will be all treasure rooms
    private readonly minEntranceConnections = 3; // Minimum number of paths from entrance
    
    // Special floor indices
    private readonly entranceFloor = 0;
    private readonly bossFloor: number;
    private readonly commoditiesTraderFloor: number;
    private readonly charonFloor: number;

    constructor() {
        // Calculate special floor indices
        this.bossFloor = this.numberOfFloors - 3; // Boss on third-to-last floor (12)
        this.commoditiesTraderFloor = this.numberOfFloors - 2; // Commodities Trader on second-to-last floor (13)
        this.charonFloor = this.numberOfFloors - 1; // Charon on last floor (14)
    }

    /**
     * Generate the game map as a directed acyclic graph according to constraints
     */
    public initializeLocations(): LocationCard[] {
        // Step 1: Create the basic structure of the map
        const locationData: LocationCard[] = this.createMapStructure();
        
        // Step 2: Assign room types according to constraints
        this.assignRoomTypes(locationData);

        // Step 3: Connect the locations to form paths to the boss
        this.connectLocations(locationData);

        // Step 4: Add special buffs to treasure rooms
        this.addBuffsToTreasureRooms(locationData);

        // Step 5: Verify the map meets all constraints
        this.verifyMapConstraints(locationData);

        // Step 6: Cull unreachable rooms
        const finalLocations = this.cullUnreachableRooms(locationData);
        
        // Step 7: Final verification - ensure all locations have encounters initialized
        this.verifyAllLocationsHaveEncounters(finalLocations);
        
        return finalLocations;
    }

    /**
     * Creates the basic structure of nodes without assigning types
     */
    private createMapStructure(): LocationCard[] {
        const locationData: LocationCard[] = [];

        // Create entrance room (floor 0, middle position)
        const entrancePosition = Math.floor(this.nodesPerFloor / 2);
        const entrance = new EntranceCard(this.entranceFloor, entrancePosition);
        entrance.initEncounter(); // Initialize encounter
        locationData.push(entrance);
        GameState.getInstance().setCurrentLocation(entrance);

        // Create boss room (third-to-last floor, middle position)
        const bossPosition = Math.floor(this.nodesPerFloor / 2);
        const bossRoom = new BossRoomCard(this.bossFloor, bossPosition);
        bossRoom.initEncounter(); // Initialize encounter
        locationData.push(bossRoom);

        // Create Commodities Trader room (second-to-last floor, middle position)
        const commoditiesTraderPosition = Math.floor(this.nodesPerFloor / 2);
        const commoditiesTraderRoom = new CommoditiesTraderCard(this.commoditiesTraderFloor, commoditiesTraderPosition);
        commoditiesTraderRoom.initEncounter(); // Initialize encounter
        locationData.push(commoditiesTraderRoom);

        // Create Charon's room (last floor, middle position)
        const charonPosition = Math.floor(this.nodesPerFloor / 2);
        const charonRoom = new CharonRoomCard(this.charonFloor, charonPosition);
        charonRoom.initEncounter(); // Initialize encounter
        locationData.push(charonRoom);

        // Connect special rooms in sequence: boss -> commodities trader -> Charon
        bossRoom.setAdjacent(commoditiesTraderRoom);
        commoditiesTraderRoom.setAdjacent(charonRoom);
        
        // Create normal rooms for all other positions
        for (let floor = this.entranceFloor; floor <= this.charonFloor; floor++) {
            // Skip special floors where only one node should exist
            if (floor === this.entranceFloor || floor === this.bossFloor || floor === this.charonFloor) {
                continue;
            }
            
            // Ensure first floor after entrance has at least minEntranceConnections rooms
            const roomsToCreate = (floor === this.entranceFloor + 1) 
                ? Math.max(this.minEntranceConnections, this.nodesPerFloor) 
                : this.nodesPerFloor;
            
            for (let roomNumber = 0; roomNumber < roomsToCreate; roomNumber++) {
                // Start with all normal rooms - we'll change types later
                const room = new NormalRoomCard(floor, roomNumber);
                room.initEncounter(); // Initialize encounter
                locationData.push(room);
            }
        }

        return locationData;
    }

    /**
     * Assign room types according to the constraints
     */
    private assignRoomTypes(locations: LocationCard[]): void {
        // Get rooms by floor
        const roomsByFloor: Map<number, LocationCard[]> = new Map();
        for (let i = this.entranceFloor; i <= this.charonFloor; i++) {
            roomsByFloor.set(i, locations.filter(loc => loc.floor === i));
        }

        // Constraint 4: Set all rooms on the treasure floor to treasure rooms
        const treasureFloorRooms = roomsByFloor.get(this.treasureFloorIndex) || [];
        for (let room of treasureFloorRooms) {
            const treasureRoom = new TreasureRoomCard(room.floor, room.roomNumber);
            this.replaceRoom(locations, room, treasureRoom);
        }

        // Distribute special rooms (shops, rest sites, elite rooms, events) on other floors
        this.distributeSpecialRooms(locations, roomsByFloor);
        
        // Ensure all rooms on the floor before boss lead to the boss
        this.ensurePathsToBoss(locations, roomsByFloor);
    }
    
    /**
     * Ensure all rooms on the floor before boss lead to the boss
     */
    private ensurePathsToBoss(locations: LocationCard[], roomsByFloor: Map<number, LocationCard[]>): void {
        const preBossFloor = this.bossFloor - 1;
        const preBossRooms = roomsByFloor.get(preBossFloor) || [];
        const bossRoom = locations.find(loc => loc instanceof BossRoomCard);
        
        if (!bossRoom) return;
        
        // Make sure all rooms on the pre-boss floor connect to the boss
        for (const room of preBossRooms) {
            // Add connection to boss if it doesn't exist
            if (!room.adjacentLocations.includes(bossRoom)) {
                // Create a one-way connection from pre-boss room to boss
                room.setAdjacent(bossRoom);
            }
        }
    }

    /**
     * Distribute special rooms across the map while ensuring no adjacent special rooms
     */
    private distributeSpecialRooms(locations: LocationCard[], roomsByFloor: Map<number, LocationCard[]>): void {
        // Get current game act
        const currentAct = GameState.getInstance().currentAct;
        
        // Define total counts for each special room type
        const totalSpecialCounts = new Map<string, number>([
            ["Shop", 2],
            ["RestSite", 2],
            ["Elite", 2],
            ["Treasure", 2],
            ["Event", 2],
        ]);
        
        // Get all valid floors (excluding entrance, treasure, boss, commodities trader, Charon floors, and first floor after entrance)
        const validFloors = Array.from(roomsByFloor.keys())
            .filter(floor => 
                floor !== this.entranceFloor && 
                floor !== this.entranceFloor + 1 && // Exclude first floor after entrance
                floor !== this.treasureFloorIndex && 
                floor !== this.bossFloor &&
                floor !== this.commoditiesTraderFloor &&
                floor !== this.charonFloor
            )
            .sort(() => Math.random() - 0.5); // Shuffle floors
        
        // First pass: distribute special rooms across floors
        for (const floor of validFloors) {
            const floorRooms = locations.filter(loc => 
                loc.floor === floor && 
                loc instanceof NormalRoomCard // Only replace normal rooms
            );
            
            if (floorRooms.length === 0) continue;
            
            // Shuffle floor rooms to randomize selection
            const shuffledRooms = [...floorRooms].sort(() => Math.random() - 0.5);
            
            // Try to place one special room on this floor
            let placedRoomOnFloor = false;
            
            // Shuffle the room types to try in random order
            const roomTypes = Array.from(totalSpecialCounts.entries())
                .filter(([_, count]) => count > 0) // Only consider types with remaining count
                .sort(() => Math.random() - 0.5);  // Shuffle
            
            for (const [roomType, remaining] of roomTypes) {
                if (remaining <= 0) continue;
                
                // Find a valid room for this special room type
                const roomToReplace = shuffledRooms.find(room => 
                    this.isValidForSpecialRoom(room, locations, (f, n) => this.makeSpecialRoom(roomType, f, n))
                );
                
                if (!roomToReplace) continue;
                
                // Replace with special room
                const newRoom = this.makeSpecialRoom(roomType, roomToReplace.floor, roomToReplace.roomNumber);
                this.replaceRoom(locations, roomToReplace, newRoom);
                
                // Update count
                totalSpecialCounts.set(roomType, remaining - 1);
                
                // Mark as placed on this floor
                placedRoomOnFloor = true;
                break; // Only place one special room per floor
            }
            
            // If we couldn't place any special room on this floor, try the next floor
            if (!placedRoomOnFloor) continue;
        }
        
        // Second pass: Check for any remaining room counts and distribute them
        const remainingTypesWithCount = Array.from(totalSpecialCounts.entries())
            .filter(([_, count]) => count > 0)
            .sort(() => Math.random() - 0.5);
            
        if (remainingTypesWithCount.length > 0) {
            // Try again with any remaining floors that still have normal rooms
            const remainingValidFloors = Array.from(roomsByFloor.keys())
                .filter(floor => 
                    floor !== this.entranceFloor && 
                    floor !== this.entranceFloor + 1 && // Exclude first floor after entrance
                    floor !== this.treasureFloorIndex && 
                    floor !== this.bossFloor &&
                    floor !== this.charonFloor
                )
                .sort(() => Math.random() - 0.5); // Shuffle floors
                
            for (const floor of remainingValidFloors) {
                // Get normal rooms on this floor
                const normalRooms = locations.filter(loc => 
                    loc.floor === floor && 
                    loc instanceof NormalRoomCard
                );
                
                if (normalRooms.length === 0) continue;
                
                // Shuffle normal rooms
                const shuffledNormalRooms = [...normalRooms].sort(() => Math.random() - 0.5);
                
                // Try each remaining room type
                for (const [roomType, remaining] of remainingTypesWithCount) {
                    if (remaining <= 0) continue;
                    
                    // Find a valid room
                    const roomToReplace = shuffledNormalRooms.find(room => 
                        this.isValidForSpecialRoom(room, locations, (f, n) => this.makeSpecialRoom(roomType, f, n))
                    );
                    
                    if (!roomToReplace) continue;
                    
                    // Replace with special room
                    const newRoom = this.makeSpecialRoom(roomType, roomToReplace.floor, roomToReplace.roomNumber);
                    this.replaceRoom(locations, roomToReplace, newRoom);
                    
                    // Update count
                    totalSpecialCounts.set(roomType, remaining - 1);
                    
                    // Remove this room from consideration
                    const index = shuffledNormalRooms.indexOf(roomToReplace);
                    if (index !== -1) {
                        shuffledNormalRooms.splice(index, 1);
                    }
                    
                    // If no more normal rooms, move to next floor
                    if (shuffledNormalRooms.length === 0) break;
                }
            }
        }
        
        // Final validation pass: fix any adjacency constraint violations
        this.validateSpecialRoomConstraints(locations);
    }
    
    /**
     * Create a special room of the specified type
     */
    private makeSpecialRoom(type: string, floor: number, roomNumber: number): LocationCard {
        switch (type) {
            case "Shop": return new ShopCard(floor, roomNumber);
            case "RestSite": return new RestSiteCard(floor, roomNumber);
            case "Elite": return new EliteRoomCard(floor, roomNumber);
            case "Treasure": return new TreasureRoomCard(floor, roomNumber);
            case "Event": return new EventRoomCard(floor, roomNumber);
            case "CommoditiesTrader": return new CommoditiesTraderCard(floor, roomNumber);
            default: return new NormalRoomCard(floor, roomNumber);
        }
    }
    
    /**
     * Validate and fix any constraints violations for special rooms
     */
    private validateSpecialRoomConstraints(locations: LocationCard[]): void {
        // Find shops and rest sites that violate adjacency constraints
        const restSites = locations.filter(loc => loc instanceof RestSiteCard);
        const shops = locations.filter(loc => loc instanceof ShopCard);
        
        // Check for rest sites with adjacent rest sites
        for (const site of restSites) {
            const adjacentRestSites = site.adjacentLocations.filter(adj => adj instanceof RestSiteCard);
            
            if (adjacentRestSites.length > 0) {
                console.warn(`Rest site ${site.name} has adjacent rest sites. Converting to normal room...`);
                // Convert this rest site to a normal room
                const normalRoom = new NormalRoomCard(site.floor, site.roomNumber);
                this.replaceRoom(locations, site, normalRoom);
            }
        }
        
        // Check for shops with adjacent shops
        for (const shop of shops) {
            const adjacentShops = shop.adjacentLocations.filter(adj => adj instanceof ShopCard);
            
            if (adjacentShops.length > 0) {
                console.warn(`Shop ${shop.name} has adjacent shops. Converting to normal room...`);
                // Convert this shop to a normal room
                const normalRoom = new NormalRoomCard(shop.floor, shop.roomNumber);
                this.replaceRoom(locations, shop, normalRoom);
            }
        }
    }

    /**
     * Checks if a room can be converted to a special room without violating constraints
     */
    private isValidForSpecialRoom(
        room: LocationCard, 
        allLocations: LocationCard[], 
        roomTemplate: (floor: number, roomNumber: number) => LocationCard
    ): boolean {
        // Create a temporary instance to check its type
        const tempRoom = roomTemplate(0, 0);
        
        // Check for RestSiteCard and ShopCard constraints
        if (tempRoom instanceof RestSiteCard || tempRoom instanceof ShopCard) {
            // Check if any adjacent rooms are of the same type
            for (const adjacent of room.adjacentLocations) {
                if ((tempRoom instanceof RestSiteCard && adjacent instanceof RestSiteCard) ||
                    (tempRoom instanceof ShopCard && adjacent instanceof ShopCard)) {
                    return false;
                }
            }
        }
        
        return true;
    }

    /**
     * Replace a room in the locations array and maintain its connections
     */
    private replaceRoom(locations: LocationCard[], oldRoom: LocationCard, newRoom: LocationCard): void {
        // Copy over adjacent connections (outgoing connections)
        for (const adj of oldRoom.adjacentLocations) {
            newRoom.setAdjacent(adj);
        }
        
        // Find all rooms that have this room in their adjacency list (incoming connections)
        for (const loc of locations) {
            if (loc.adjacentLocations.includes(oldRoom)) {
                // Replace old room reference with new room reference
                const idx = loc.adjacentLocations.indexOf(oldRoom);
                if (idx !== -1) {
                    loc.adjacentLocations[idx] = newRoom;
                }
            }
        }
        
        // Replace in the locations array
        const index = locations.indexOf(oldRoom);
        if (index !== -1) {
            locations[index] = newRoom;
        }
        
        // Initialize the encounter for the new room
        newRoom.initEncounter();
    }

    /**
     * Connect the locations to ensure every room has a path to the boss
     */
    private connectLocations(locations: LocationCard[]): void {
        // Group rooms by floor
        const roomsByFloor: Map<number, LocationCard[]> = new Map();
        for (let i = this.entranceFloor; i <= this.charonFloor; i++) {
            roomsByFloor.set(i, locations.filter(loc => loc.floor === i));
        }
        
        // Connect entrance to first floor rooms
        const entrance = locations.find(loc => loc instanceof EntranceCard);
        const firstFloorRooms = roomsByFloor.get(this.entranceFloor + 1) || [];
        
        if (entrance && firstFloorRooms.length > 0) {
            // Ensure at least minEntranceConnections connections from entrance to first floor
            // If we don't have enough rooms, connect to all available rooms
            const maxConnections = Math.min(this.minEntranceConnections, firstFloorRooms.length);
            
            // Ensure we connect to at least minEntranceConnections rooms if possible
            if (firstFloorRooms.length < this.minEntranceConnections) {
                console.warn(`Only ${firstFloorRooms.length} rooms on first floor, connecting entrance to all of them`);
            }
            
            const shuffledFirstFloor = [...firstFloorRooms].sort(() => Math.random() - 0.5);
            
            for (let i = 0; i < maxConnections; i++) {
                // Create a one-way connection from entrance to first floor
                entrance.setAdjacent(shuffledFirstFloor[i]);
            }
        }
        
        // Connect each floor to the floor above it (except for boss to Charon, which is already connected)
        for (let floor = this.entranceFloor + 1; floor < this.bossFloor; floor++) {
            const currentFloorRooms = roomsByFloor.get(floor) || [];
            const nextFloorRooms = roomsByFloor.get(floor + 1) || [];
            
            if (currentFloorRooms.length === 0 || nextFloorRooms.length === 0) continue;
            
            // Track outgoing connections from each room on the next floor
            const incomingConnectionsCount = new Map<LocationCard, number>();
            nextFloorRooms.forEach(room => incomingConnectionsCount.set(room, 0));
            
            // Create connections between the floors
            for (const room of currentFloorRooms) {
                // Connect to 1-2 rooms on the next floor
                const maxOutgoingConnections = Math.min(2, nextFloorRooms.length);
                const numConnections = Math.floor(Math.random() * maxOutgoingConnections) + 1; // 1 or 2 connections
                
                // Prioritize connecting to rooms with fewer incoming connections
                const sortedNextFloorRooms = [...nextFloorRooms].sort((a, b) => {
                    const countA = incomingConnectionsCount.get(a) || 0;
                    const countB = incomingConnectionsCount.get(b) || 0;
                    return countA - countB;
                });
                
                let connectionsAdded = 0;
                for (const nextRoom of sortedNextFloorRooms) {
                    if (connectionsAdded >= numConnections) break;
                    
                    // Create one-way connection from current floor to next floor
                    room.setAdjacent(nextRoom);
                    
                    // Update the incoming connection count
                    const count = incomingConnectionsCount.get(nextRoom) || 0;
                    incomingConnectionsCount.set(nextRoom, count + 1);
                    
                    connectionsAdded++;
                }
            }
        }
        
        // Ensure every room has at least one outgoing connection (except on the boss floor)
        for (let floor = this.entranceFloor + 1; floor < this.bossFloor; floor++) {
            const currentFloorRooms = roomsByFloor.get(floor) || [];
            const nextFloorRooms = roomsByFloor.get(floor + 1) || [];
            
            if (nextFloorRooms.length === 0) continue;
            
            for (const room of currentFloorRooms) {
                // Find rooms that connect to the next floor
                const connectionsToNextFloor = room.adjacentLocations.filter(adj => adj.floor > room.floor);
                
                if (connectionsToNextFloor.length === 0) {
                    // Find next floor rooms with the fewest incoming connections
                    const incomingConnectionsCount = new Map<LocationCard, number>();
                    
                    for (const nextRoom of nextFloorRooms) {
                        const incomingCount = locations.filter(
                            loc => loc.adjacentLocations.includes(nextRoom) && loc.floor < nextRoom.floor
                        ).length;
                        incomingConnectionsCount.set(nextRoom, incomingCount);
                    }
                    
                    // Sort by fewest incoming connections
                    const sortedNextFloorRooms = [...nextFloorRooms].sort((a, b) => {
                        const countA = incomingConnectionsCount.get(a) || 0;
                        const countB = incomingConnectionsCount.get(b) || 0;
                        return countA - countB;
                    });
                    
                    // Connect to the room with fewest incoming connections
                    if (sortedNextFloorRooms.length > 0) {
                        const targetRoom = sortedNextFloorRooms[0];
                        // Create one-way connection
                        room.setAdjacent(targetRoom);
                    }
                }
            }
        }
        
        // Special case: Connect pre-boss floor rooms to boss
        const preBossFloor = this.bossFloor - 1;
        const preBossRooms = roomsByFloor.get(preBossFloor) || [];
        const bossRoom = locations.find(loc => loc instanceof BossRoomCard);
        
        if (bossRoom && preBossRooms.length > 0) {
            for (const room of preBossRooms) {
                // Create one-way connection from pre-boss room to boss
                room.setAdjacent(bossRoom);
            }
        }
    }

    /**
     * Add special buffs to treasure rooms (debuffs for random ones)
     */
    private addBuffsToTreasureRooms(locations: LocationCard[]): void {
        const treasureRooms = locations.filter(loc => loc instanceof TreasureRoomCard);
        const buffRegistry = LocationBuffRegistry.getInstance();
        
        // Treasures on the treasure floor don't get debuffs
        const treasureFloorRooms = treasureRooms.filter(room => room.floor === this.treasureFloorIndex);
        const randomTreasureRooms = treasureRooms.filter(room => room.floor !== this.treasureFloorIndex);
        
        // Add debuffs to random treasure rooms as per constraint 5
        for (const room of randomTreasureRooms) {
            const treasureRoom = room as TreasureRoomCard;
            const treasureDebuffs = buffRegistry.getTreasureNegativeBuffs();
            const randomDebuff = treasureDebuffs[Math.floor(Math.random() * treasureDebuffs.length)];
            treasureRoom.buffs.push(randomDebuff.clone());
        }
    }

    /**
     * Verify the map meets all the constraints
     */
    private verifyMapConstraints(locations: LocationCard[]): void {
        this.verifyEntranceConnections(locations);
        this.verifyPathToBoss(locations);
        this.verifyNoAdjacentRestSites(locations);
        this.verifyNoAdjacentShops(locations);
        this.verifyTreasureFloor(locations);
        this.verifyTreasureRoomDebuffs(locations);
        this.verifyPreBossConnections(locations);
        this.verifyFirstFloorNormalRooms(locations);
        this.verifyCommoditiesTraderFloor(locations);
    }

    /**
     * Verify the entrance has the minimum required number of paths
     */
    private verifyEntranceConnections(locations: LocationCard[]): void {
        const entrance = locations.find(loc => loc instanceof EntranceCard);
        if (!entrance) return;
        
        const firstFloorRooms = locations.filter(loc => loc.floor === this.entranceFloor + 1);
        const connectionsFromEntrance = entrance.adjacentLocations.length;
        
        if (connectionsFromEntrance < this.minEntranceConnections && firstFloorRooms.length >= this.minEntranceConnections) {
            console.warn(`Entrance has only ${connectionsFromEntrance} connections, adding more to reach ${this.minEntranceConnections}...`);
            
            // Get rooms not already connected to entrance
            const unconnectedRooms = firstFloorRooms.filter(room => !entrance.adjacentLocations.includes(room));
            const shuffledUnconnected = [...unconnectedRooms].sort(() => Math.random() - 0.5);
            
            // Add more connections until we reach the minimum or run out of unconnected rooms
            let connectionsToAdd = Math.min(this.minEntranceConnections - connectionsFromEntrance, shuffledUnconnected.length);
            
            for (let i = 0; i < connectionsToAdd; i++) {
                entrance.setAdjacent(shuffledUnconnected[i]);
            }
            
            console.log(`Added ${connectionsToAdd} more connections from entrance, now has ${entrance.adjacentLocations.length} connections`);
        }
    }

    /**
     * Verify constraint 1: All rooms have a path to the boss
     */
    private verifyPathToBoss(locations: LocationCard[]): void {
        const bossRoom = locations.find(loc => loc instanceof BossRoomCard);
        if (!bossRoom) return;
        
        // Run BFS from each room to check if it can reach the boss
        for (const room of locations) {
            if (room instanceof BossRoomCard || room instanceof CharonRoomCard) continue;
            
            const visited = new Set<LocationCard>();
            const queue: LocationCard[] = [room];
            let canReachBoss = false;
            
            while (queue.length > 0) {
                const current = queue.shift()!;
                if (visited.has(current)) continue;
                
                visited.add(current);
                
                if (current instanceof BossRoomCard) {
                    canReachBoss = true;
                    break;
                }
                
                // Add all adjacent rooms with higher floor number (to ensure DAG progression)
                for (const adj of current.adjacentLocations) {
                    if (adj.floor >= current.floor && !visited.has(adj)) {
                        queue.push(adj);
                    }
                }
            }
            
            if (!canReachBoss) {
                console.warn(`Room ${room.name} cannot reach the boss. Creating a path...`);
                // Create a path by connecting to a room on the next floor that can reach the boss
                this.createPathToBoss(room, locations);
            }
        }
    }

    /**
     * Create a path from a room to the boss when none exists
     */
    private createPathToBoss(room: LocationCard, locations: LocationCard[]): void {
        const bossRoom = locations.find(loc => loc instanceof BossRoomCard);
        if (!bossRoom) return;
        
        // Find a room on the next floor that can reach the boss
        const nextFloorRooms = locations.filter(loc => loc.floor === room.floor + 1);
        if (nextFloorRooms.length === 0) {
            // If on the floor just before boss, connect directly to boss
            if (room.floor === this.bossFloor - 1) {
                // Create one-way connection from room to boss
                room.setAdjacent(bossRoom);
                return;
            }
            return;
        }
        
        // Check each room on the next floor to see if it can reach the boss
        for (const nextRoom of nextFloorRooms) {
            const visited = new Set<LocationCard>();
            const queue: LocationCard[] = [nextRoom];
            let canReachBoss = false;
            
            while (queue.length > 0) {
                const current = queue.shift()!;
                if (visited.has(current)) continue;
                
                visited.add(current);
                
                if (current instanceof BossRoomCard) {
                    canReachBoss = true;
                    break;
                }
                
                // Add all adjacent rooms with higher floor number
                for (const adj of current.adjacentLocations) {
                    if (adj.floor >= current.floor && !visited.has(adj)) {
                        queue.push(adj);
                    }
                }
            }
            
            if (canReachBoss) {
                // Connect to this room (one-way)
                room.setAdjacent(nextRoom);
                return;
            }
        }
        
        // If we get here, no room on the next floor can reach the boss
        // Connect to any room on the next floor and then recursively solve
        if (nextFloorRooms.length > 0) {
            const randomNextRoom = nextFloorRooms[Math.floor(Math.random() * nextFloorRooms.length)];
            // Create one-way connection
            room.setAdjacent(randomNextRoom);
            this.createPathToBoss(randomNextRoom, locations);
        }
    }

    /**
     * Verify constraint 2: No rest sites are adjacent to each other
     */
    private verifyNoAdjacentRestSites(locations: LocationCard[]): void {
        const restSites = locations.filter(loc => loc instanceof RestSiteCard);
        
        for (const site of restSites) {
            const adjacentRestSites = site.adjacentLocations.filter(adj => adj instanceof RestSiteCard);
            
            if (adjacentRestSites.length > 0) {
                console.warn(`Rest site ${site.name} has adjacent rest sites. Converting to normal room...`);
                // Convert this rest site to a normal room
                const normalRoom = new NormalRoomCard(site.floor, site.roomNumber);
                this.replaceRoom(locations, site, normalRoom);
            }
        }
    }

    /**
     * Verify constraint 3: No shops are adjacent to each other
     */
    private verifyNoAdjacentShops(locations: LocationCard[]): void {
        const shops = locations.filter(loc => loc instanceof ShopCard);
        
        for (const shop of shops) {
            const adjacentShops = shop.adjacentLocations.filter(adj => adj instanceof ShopCard);
            
            if (adjacentShops.length > 0) {
                console.warn(`Shop ${shop.name} has adjacent shops. Converting to normal room...`);
                // Convert this shop to a normal room
                const normalRoom = new NormalRoomCard(shop.floor, shop.roomNumber);
                this.replaceRoom(locations, shop, normalRoom);
            }
        }
    }

    /**
     * Verify constraint 4: All rooms on the treasure floor are treasure rooms
     */
    private verifyTreasureFloor(locations: LocationCard[]): void {
        const treasureFloorRooms = locations.filter(loc => loc.floor === this.treasureFloorIndex);
        
        for (const room of treasureFloorRooms) {
            if (!(room instanceof TreasureRoomCard)) {
                console.warn(`Room ${room.name} on treasure floor is not a treasure room. Converting...`);
                // Convert to treasure room
                const treasureRoom = new TreasureRoomCard(room.floor, room.roomNumber);
                this.replaceRoom(locations, room, treasureRoom);
            }
        }
    }

    /**
     * Verify constraint 5: Random treasure rooms have debuffs
     */
    private verifyTreasureRoomDebuffs(locations: LocationCard[]): void {
        const treasureRooms = locations.filter(
            loc => loc instanceof TreasureRoomCard && loc.floor !== this.treasureFloorIndex
        );
        
        const buffRegistry = LocationBuffRegistry.getInstance();
        
        for (const room of treasureRooms) {
            const treasureRoom = room as TreasureRoomCard;
            
            if (treasureRoom.buffs.length === 0) {
                console.warn(`Treasure room ${treasureRoom.name} has no debuffs. Adding one...`);
                // Add a random debuff
                const treasureDebuffs = buffRegistry.getTreasureNegativeBuffs();
                const randomDebuff = treasureDebuffs[Math.floor(Math.random() * treasureDebuffs.length)];
                treasureRoom.buffs.push(randomDebuff.clone());
            }
        }
    }
    
    /**
     * Verify constraint 6: All rooms on the floor before the boss lead to the boss
     */
    private verifyPreBossConnections(locations: LocationCard[]): void {
        const bossRoom = locations.find(loc => loc instanceof BossRoomCard);
        if (!bossRoom) return;
        
        const preBossFloor = this.bossFloor - 1;
        const preBossRooms = locations.filter(loc => loc.floor === preBossFloor);
        
        for (const room of preBossRooms) {
            if (!room.adjacentLocations.includes(bossRoom)) {
                console.warn(`Room ${room.name} on pre-boss floor doesn't connect to boss. Adding connection...`);
                room.setAdjacent(bossRoom);
            }
        }
    }

    /**
     * Verify constraint 7: All rooms on the first floor after entrance are normal combat rooms
     */
    private verifyFirstFloorNormalRooms(locations: LocationCard[]): void {
        const firstFloor = this.entranceFloor + 1;
        const firstFloorRooms = locations.filter(loc => loc.floor === firstFloor);
        
        for (const room of firstFloorRooms) {
            if (!(room instanceof NormalRoomCard)) {
                console.warn(`Room ${room.name} on first floor after entrance is not a normal combat room. Converting...`);
                // Convert to normal room
                const normalRoom = new NormalRoomCard(room.floor, room.roomNumber);
                this.replaceRoom(locations, room, normalRoom);
            }
        }
    }

    /**
     * Verify that the commodities trader floor is properly set up
     */
    private verifyCommoditiesTraderFloor(locations: LocationCard[]): void {
        const commoditiesTraderRooms = locations.filter(loc => loc.floor === this.commoditiesTraderFloor);
        
        // Verify there is exactly one commodities trader room
        if (commoditiesTraderRooms.length !== 1) {
            console.warn(`Expected exactly one commodities trader room, found ${commoditiesTraderRooms.length}`);
            return;
        }
        
        const commoditiesTraderRoom = commoditiesTraderRooms[0];
        
        // Verify it's a CommoditiesTraderCard
        if (!(commoditiesTraderRoom instanceof CommoditiesTraderCard)) {
            console.warn(`Room on commodities trader floor is not a CommoditiesTraderCard. Converting...`);
            const newRoom = new CommoditiesTraderCard(commoditiesTraderRoom.floor, commoditiesTraderRoom.roomNumber);
            this.replaceRoom(locations, commoditiesTraderRoom, newRoom);
        }
        
        // Verify it's connected to both boss and Charon
        const bossRoom = locations.find(loc => loc instanceof BossRoomCard);
        const charonRoom = locations.find(loc => loc instanceof CharonRoomCard);
        
        if (bossRoom && !commoditiesTraderRoom.adjacentLocations.includes(bossRoom)) {
            console.warn(`Commodities trader room not connected to boss room. Adding connection...`);
            commoditiesTraderRoom.setAdjacent(bossRoom);
        }
        
        if (charonRoom && !commoditiesTraderRoom.adjacentLocations.includes(charonRoom)) {
            console.warn(`Commodities trader room not connected to Charon room. Adding connection...`);
            commoditiesTraderRoom.setAdjacent(charonRoom);
        }
    }

    /**
     * Cull unreachable rooms from the map
     */
    public cullUnreachableRooms(locationData: LocationCard[]): LocationCard[] {
        const entrance = locationData.find(loc => loc instanceof EntranceCard);
        if (!entrance) return locationData;

        const reachable = new Set<LocationCard>();
        const queue: LocationCard[] = [entrance];
        
        while (queue.length > 0) {
            const current = queue.shift()!;
            if (reachable.has(current)) continue;
            
            reachable.add(current);
            
            // Only follow forward connections (to higher floor numbers)
            for (const adjacent of current.adjacentLocations) {
                if (!reachable.has(adjacent) && adjacent.floor >= current.floor) {
                    queue.push(adjacent);
                }
            }
        }

        // Always include the boss and Charon rooms as reachable
        const specialRooms = locationData.filter(
            loc => loc instanceof BossRoomCard || loc instanceof CharonRoomCard
        );
        specialRooms.forEach(room => reachable.add(room));

        const numCulled = locationData.length - reachable.size;
        console.log(`Culled ${numCulled} unreachable rooms`);
        return locationData.filter(loc => reachable.has(loc));
    }

    /**
     * Verify that all locations have encounters initialized
     */
    private verifyAllLocationsHaveEncounters(locations: LocationCard[]): void {
        for (const location of locations) {
            if (!location.encounter) {
                console.warn(`Location ${location.name} has no encounter initialized. Initializing now...`);
                location.initEncounter();
            }
        }
    }
}
