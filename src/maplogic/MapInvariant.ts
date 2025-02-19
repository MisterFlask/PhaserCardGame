import { EliteRoomCard, LocationCard, NormalRoomCard, RestSiteCard, ShopCard, TreasureRoomCard } from "./LocationCard";

export interface MapInvariantResult {
    actionsPerformed: number;
    description: string;
}

export abstract class MapInvariant {
    abstract name: string;
    abstract description: string;
    
    abstract apply(locations: LocationCard[]): MapInvariantResult;
}

export class FloorFiveTreasureInvariant extends MapInvariant {
    name = "Floor 5 Treasure Invariant";
    description = "All nodes on floor 5 should be treasure nodes";

    apply(locations: LocationCard[]): MapInvariantResult {
        let actionsPerformed = 0;
        const floor5Nodes = locations.filter(loc => loc.floor === 5);
        
        for (const node of floor5Nodes) {
            if (!(node instanceof TreasureRoomCard)) {
                // Create a new treasure room with same floor and room number
                const treasureRoom = new TreasureRoomCard(node.floor, node.roomNumber);
                
                // Copy over adjacencies
                node.adjacentLocations.forEach(adj => {
                    treasureRoom.setAdjacent(adj);
                    // Update the adjacent node to point to the new treasure room
                    const idx = adj.adjacentLocations.indexOf(node);
                    if (idx !== -1) {
                        adj.adjacentLocations[idx] = treasureRoom;
                    }
                });

                // Replace the node in the locations array
                const idx = locations.indexOf(node);
                if (idx !== -1) {
                    locations[idx] = treasureRoom;
                    actionsPerformed++;
                }
            }
        }

        return {
            actionsPerformed,
            description: `Converted ${actionsPerformed} nodes on floor 5 to treasure rooms`
        };
    }
}

export class RestSiteAdjacentInvariant extends MapInvariant {
    name = "Rest Site Adjacent Invariant";
    description = "Rest sites may never be next to each other";

    apply(locations: LocationCard[]): MapInvariantResult {
        let actionsPerformed = 0;
        const restSites = locations.filter(loc => loc instanceof RestSiteCard);
        
        for (const restSite of restSites) {
            const adjacentRestSites = restSite.adjacentLocations.filter(adj => adj instanceof RestSiteCard);
            
            if (adjacentRestSites.length > 0) {
                // Convert this rest site to a normal room
                const normalRoom = new NormalRoomCard(restSite.floor, restSite.roomNumber);
                
                // Copy over adjacencies
                restSite.adjacentLocations.forEach(adj => {
                    normalRoom.setAdjacent(adj);
                    // Update the adjacent node to point to the new normal room
                    const idx = adj.adjacentLocations.indexOf(restSite);
                    if (idx !== -1) {
                        adj.adjacentLocations[idx] = normalRoom;
                    }
                });

                // Replace the node in the locations array
                const idx = locations.indexOf(restSite);
                if (idx !== -1) {
                    locations[idx] = normalRoom;
                    actionsPerformed++;
                }
            }
        }

        return {
            actionsPerformed,
            description: `Converted ${actionsPerformed} rest sites that were adjacent to other rest sites into normal rooms`
        };
    }
}

export class SpecialRoomAdjacentInvariant extends MapInvariant {
    name = "Special Room Adjacent Invariant";
    description = "Treasure nodes, elite enemy nodes, and shops must never be next to each other";

    apply(locations: LocationCard[]): MapInvariantResult {
        let actionsPerformed = 0;
        const specialRooms = locations.filter(loc => 
            loc instanceof TreasureRoomCard || 
            loc instanceof EliteRoomCard || 
            loc instanceof ShopCard
        );
        
        for (const specialRoom of specialRooms) {
            const adjacentSpecialRooms = specialRoom.adjacentLocations.filter(adj => 
                adj instanceof TreasureRoomCard || 
                adj instanceof EliteRoomCard || 
                adj instanceof ShopCard
            );
            
            if (adjacentSpecialRooms.length > 0) {
                // Convert this special room to a normal room
                const normalRoom = new NormalRoomCard(specialRoom.floor, specialRoom.roomNumber);
                
                // Copy over adjacencies
                specialRoom.adjacentLocations.forEach(adj => {
                    normalRoom.setAdjacent(adj);
                    // Update the adjacent node to point to the new normal room
                    const idx = adj.adjacentLocations.indexOf(specialRoom);
                    if (idx !== -1) {
                        adj.adjacentLocations[idx] = normalRoom;
                    }
                });

                // Replace the node in the locations array
                const idx = locations.indexOf(specialRoom);
                if (idx !== -1) {
                    locations[idx] = normalRoom;
                    actionsPerformed++;
                }
            }
        }

        return {
            actionsPerformed,
            description: `Converted ${actionsPerformed} special rooms that were adjacent to other special rooms into normal rooms`
        };
    }
}

export class FirstNodeEnemiesInvariant extends MapInvariant {
    name = "First Node Enemies Invariant";
    description = "The first node on each floor must be an enemies node";

    apply(locations: LocationCard[]): MapInvariantResult {
        let actionsPerformed = 0;
        
        // Group locations by floor
        const floorMap = new Map<number, LocationCard[]>();
        locations.forEach(loc => {
            if (!floorMap.has(loc.floor)) {
                floorMap.set(loc.floor, []);
            }
            floorMap.get(loc.floor)!.push(loc);
        });

        // For each floor
        for (const [floor, floorLocations] of floorMap.entries()) {
            // Find the first node (lowest roomNumber)
            const firstNode = floorLocations.reduce((min, curr) => 
                curr.roomNumber < min.roomNumber ? curr : min
            );

            if (!(firstNode instanceof NormalRoomCard)) {
                // Convert to normal room
                const normalRoom = new NormalRoomCard(firstNode.floor, firstNode.roomNumber);
                
                // Copy over adjacencies
                firstNode.adjacentLocations.forEach(adj => {
                    normalRoom.setAdjacent(adj);
                    // Update the adjacent node to point to the new normal room
                    const idx = adj.adjacentLocations.indexOf(firstNode);
                    if (idx !== -1) {
                        adj.adjacentLocations[idx] = normalRoom;
                    }
                });

                // Replace the node in the locations array
                const idx = locations.indexOf(firstNode);
                if (idx !== -1) {
                    locations[idx] = normalRoom;
                    actionsPerformed++;
                }
            }
        }

        return {
            actionsPerformed,
            description: `Converted ${actionsPerformed} non-enemy first nodes to enemy nodes`
        };
    }
}

export class MapInvariantRunner {
    private invariants: MapInvariant[];
    private maxIterations: number = 20;

    constructor() {
        this.invariants = [
            new FloorFiveTreasureInvariant(),
            new RestSiteAdjacentInvariant(),
            new SpecialRoomAdjacentInvariant(),
            new FirstNodeEnemiesInvariant()
        ];
    }

    public applyAll(locations: LocationCard[]): void {
        let iteration = 0;
        let totalActionsPerformed = 0;
        
        while (iteration < this.maxIterations) {
            let iterationActionsPerformed = 0;
            
            for (const invariant of this.invariants) {
                const result = invariant.apply(locations);
                iterationActionsPerformed += result.actionsPerformed;
                if (result.actionsPerformed > 0) {
                    console.log(`${invariant.name}: ${result.description}`);
                }
            }
            
            totalActionsPerformed += iterationActionsPerformed;
            
            if (iterationActionsPerformed === 0) {
                if (iteration > 0) {
                    console.log(`Map invariants stabilized after ${iteration} iterations with ${totalActionsPerformed} total actions`);
                }
                break;
            }
            
            iteration++;
            if (iteration === this.maxIterations) {
                console.error(`Map invariants did not stabilize after ${this.maxIterations} iterations with ${totalActionsPerformed} total actions`);
            }
        }
    }
} 