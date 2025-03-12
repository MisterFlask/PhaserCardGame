// src/managers/LocationManager.ts

import { LocationBuffRegistry } from "../maplogic/LocationBuffRegistry";
import { GameState } from "../rules/GameState";
import { BossRoomCard, CharonRoomCard, EliteRoomCard, EntranceCard, LocationCard, NormalRoomCard, RestSiteCard, ShopCard, TreasureRoomCard } from "./LocationCard";

export class LocationManager {
    // Map configuration constants
    private readonly numberOfFloors = 10; // 0-9, entrance on 0, boss on 8, Charon on 9
    private readonly nodesPerFloor = 5;
    private readonly treasureFloorIndex = 5; // The middle floor that will be all treasure rooms
    
    // Special floor indices
    private readonly entranceFloor = 0;
    private readonly bossFloor: number;
    private readonly charonFloor: number;

    constructor() {
        // Calculate special floor indices
        this.bossFloor = this.numberOfFloors - 2; // Boss on second-to-last floor (8)
        this.charonFloor = this.numberOfFloors - 1; // Charon on last floor (9)
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
        return this.cullUnreachableRooms(locationData);
    }

    /**
     * Creates the basic structure of nodes without assigning types
     */
    private createMapStructure(): LocationCard[] {
        const locationData: LocationCard[] = [];

        // Create entrance room (floor 0, middle position)
        const entrancePosition = Math.floor(this.nodesPerFloor / 2);
        const entrance = new EntranceCard(this.entranceFloor, entrancePosition);
        locationData.push(entrance);
        GameState.getInstance().setCurrentLocation(entrance);

        // Create boss room (second-to-last floor, middle position)
        const bossPosition = Math.floor(this.nodesPerFloor / 2);
        const bossRoom = new BossRoomCard(this.bossFloor, bossPosition);
        locationData.push(bossRoom);

        // Create Charon's room (last floor, middle position)
        const charonPosition = Math.floor(this.nodesPerFloor / 2);
        const charonRoom = new CharonRoomCard(this.charonFloor, charonPosition);
        locationData.push(charonRoom);

        // Connect boss room to Charon's room
        bossRoom.setAdjacent(charonRoom);
        charonRoom.setAdjacent(bossRoom);
        
        // Create normal rooms for all other positions
        for (let floor = this.entranceFloor; floor <= this.charonFloor; floor++) {
            // Skip special floors where only one node should exist
            if (floor === this.entranceFloor || floor === this.bossFloor || floor === this.charonFloor) {
                continue;
            }
            
            for (let roomNumber = 0; roomNumber < this.nodesPerFloor; roomNumber++) {
                // Start with all normal rooms - we'll change types later
                const room = new NormalRoomCard(floor, roomNumber);
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
                room.setAdjacent(bossRoom);
                bossRoom.setAdjacent(room);
            }
        }
    }

    /**
     * Distribute special rooms across the map while ensuring no adjacent special rooms
     */
    private distributeSpecialRooms(locations: LocationCard[], roomsByFloor: Map<number, LocationCard[]>): void {
        // Define room type distribution per floor (excluding treasure floor)
        // Using createRoomTemplate to create prototype instances for each room type
        const distribution = [
            { template: (floor: number, roomNumber: number) => new ShopCard(floor, roomNumber), count: 1 },
            { template: (floor: number, roomNumber: number) => new RestSiteCard(floor, roomNumber), count: 1 },
            { template: (floor: number, roomNumber: number) => new EliteRoomCard(floor, roomNumber), count: 1 },
            { template: (floor: number, roomNumber: number) => new TreasureRoomCard(floor, roomNumber), count: 1 }
        ];

        // Apply distribution for each floor (except entrance, treasure, boss, and Charon floors)
        for (let floor = this.entranceFloor + 1; floor <= this.bossFloor; floor++) {
            if (floor === this.treasureFloorIndex || floor === this.bossFloor) continue;
            
            const roomsOnFloor = roomsByFloor.get(floor) || [];
            if (roomsOnFloor.length === 0) continue;

            // Shuffle the distribution for this floor
            const floorDistribution = [...distribution]
                .sort(() => Math.random() - 0.5)
                .slice(0, Math.min(roomsOnFloor.length, distribution.length));

            for (const { template, count } of floorDistribution) {
                for (let i = 0; i < count; i++) {
                    // Find a suitable normal room to replace
                    const normalRooms = roomsOnFloor.filter(room => 
                        room instanceof NormalRoomCard && 
                        this.isValidForSpecialRoom(room, locations, template)
                    );
                    
                    if (normalRooms.length === 0) continue;
                    
                    // Pick a random normal room
                    const randomIndex = Math.floor(Math.random() * normalRooms.length);
                    const roomToReplace = normalRooms[randomIndex];
                    
                    // Replace with the special room
                    const specialRoom = template(roomToReplace.floor, roomToReplace.roomNumber);
                    this.replaceRoom(locations, roomToReplace, specialRoom);
                    
                    // Update the rooms on floor list
                    const idx = roomsOnFloor.indexOf(roomToReplace);
                    if (idx !== -1) {
                        roomsOnFloor[idx] = specialRoom;
                    }
                }
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
        // Copy over adjacent connections
        for (const adj of oldRoom.adjacentLocations) {
            newRoom.setAdjacent(adj);
            
            // Update the adjacent room to point to the new room
            const idx = adj.adjacentLocations.indexOf(oldRoom);
            if (idx !== -1) {
                adj.adjacentLocations[idx] = newRoom;
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
            // Connect entrance to at most 2 first floor rooms
            const maxConnections = Math.min(2, firstFloorRooms.length);
            const shuffledFirstFloor = [...firstFloorRooms].sort(() => Math.random() - 0.5);
            
            for (let i = 0; i < maxConnections; i++) {
                entrance.setAdjacent(shuffledFirstFloor[i]);
                shuffledFirstFloor[i].setAdjacent(entrance);
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
                    
                    // Create connection
                    room.setAdjacent(nextRoom);
                    nextRoom.setAdjacent(room);
                    
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
                        const incomingCount = nextRoom.adjacentLocations.filter(
                            adj => adj.floor < nextRoom.floor
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
                        room.setAdjacent(targetRoom);
                        targetRoom.setAdjacent(room);
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
                room.setAdjacent(bossRoom);
                bossRoom.setAdjacent(room);
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
        this.verifyPathToBoss(locations);
        this.verifyNoAdjacentRestSites(locations);
        this.verifyNoAdjacentShops(locations);
        this.verifyTreasureFloor(locations);
        this.verifyTreasureRoomDebuffs(locations);
        this.verifyPreBossConnections(locations);
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
                room.setAdjacent(bossRoom);
                bossRoom.setAdjacent(room);
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
                // Connect to this room
                room.setAdjacent(nextRoom);
                nextRoom.setAdjacent(room);
                return;
            }
        }
        
        // If we get here, no room on the next floor can reach the boss
        // Connect to any room on the next floor and then recursively solve
        if (nextFloorRooms.length > 0) {
            const randomNextRoom = nextFloorRooms[Math.floor(Math.random() * nextFloorRooms.length)];
            room.setAdjacent(randomNextRoom);
            randomNextRoom.setAdjacent(room);
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
                bossRoom.setAdjacent(room);
            }
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
