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

export class SpecialRoomAdjacentInvariant extends MapInvariant {
    name = "Special Room Adjacent Invariant";
    description = "Special rooms (rest sites, treasure nodes, elite enemy nodes, and shops) must never be next to each other";

    private isSpecialRoom(loc: LocationCard): boolean {
        return loc instanceof RestSiteCard ||
               loc instanceof TreasureRoomCard || 
               loc instanceof EliteRoomCard || 
               loc instanceof ShopCard;
    }

    apply(locations: LocationCard[]): MapInvariantResult {
        let actionsPerformed = 0;
        const specialRooms = locations.filter(loc => this.isSpecialRoom(loc));
        
        for (const specialRoom of specialRooms) {
            const adjacentSpecialRooms = specialRoom.adjacentLocations.filter(adj => this.isSpecialRoom(adj));
            
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

                normalRoom.initEncounter();
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
    description = "All nodes on floor 2 must be enemy nodes and connect to floor 1 entrance";

    apply(locations: LocationCard[]): MapInvariantResult {
        let actionsPerformed = 0;
        
        // Get all floor 2 locations and entrance node
        const floor2Locations = locations.filter(loc => loc.floor === 2);
        const entranceNode = locations.find(loc => loc.floor === 1);
        
        if (!entranceNode) {
            console.error("No entrance node found on floor 1");
            return {
                actionsPerformed,
                description: "Error: No entrance node found on floor 1"
            };
        }

        for (const node of floor2Locations) {
            let nodeChanged = false;
            
            // First ensure it's a normal room
            if (!(node instanceof NormalRoomCard)) {
                // Convert to normal room
                const normalRoom = new NormalRoomCard(node.floor, node.roomNumber);
                // Copy over adjacencies
                node.adjacentLocations.forEach(adj => {
                    normalRoom.setAdjacent(adj);
                    // Update the adjacent node to point to the new normal room
                    const idx = adj.adjacentLocations.indexOf(node);
                    if (idx !== -1) {
                        adj.adjacentLocations[idx] = normalRoom;
                    }
                });

                // Replace the node in the locations array
                const idx = locations.indexOf(node);
                if (idx !== -1) {
                    locations[idx] = normalRoom;
                    nodeChanged = true;
                    actionsPerformed++;
                }

                normalRoom.initEncounter();
            }

            // Then ensure connection to entrance
            const currentNode = nodeChanged ? locations.find(loc => 
                loc.floor === node.floor && loc.roomNumber === node.roomNumber
            )! : node;

            if (!currentNode.adjacentLocations.includes(entranceNode)) {
                currentNode.setAdjacent(entranceNode);
                entranceNode.setAdjacent(currentNode);
                actionsPerformed++;
            }
        }

        return {
            actionsPerformed,
            description: `Converted ${actionsPerformed} nodes on floor 2 to enemy nodes and ensured entrance connections`
        };
    }
}

interface IterationResult {
    invariantName: string;
    actionsPerformed: number;
    description: string;
}

export class MapInvariantRunner {
    private invariants: MapInvariant[];
    private maxIterations: number = 20;

    constructor() {
        this.invariants = [
            new FloorFiveTreasureInvariant(),
            new SpecialRoomAdjacentInvariant(),
            new FirstNodeEnemiesInvariant()
        ];
    }

    public applyAll(locations: LocationCard[]): void {
        let iteration = 0;
        let totalActionsPerformed = 0;
        const iterationHistory: IterationResult[][] = [];
        
        while (iteration < this.maxIterations) {
            let iterationActionsPerformed = 0;
            const currentIterationResults: IterationResult[] = [];
            
            for (const invariant of this.invariants) {
                const result = invariant.apply(locations);
                iterationActionsPerformed += result.actionsPerformed;
                
                currentIterationResults.push({
                    invariantName: invariant.name,
                    actionsPerformed: result.actionsPerformed,
                    description: result.description
                });

                if (result.actionsPerformed > 0) {
                    console.log(`${invariant.name}: ${result.description}`);
                }
            }
            
            iterationHistory.push(currentIterationResults);
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
                console.error('Last 5 iterations:');
                
                const lastFiveIterations = iterationHistory.slice(-5);
                lastFiveIterations.forEach((iterResults, idx) => {
                    const iterationNumber = iteration - 5 + idx + 1;
                    console.error(`\nIteration ${iterationNumber}:`);
                    iterResults.forEach(result => {
                        if (result.actionsPerformed > 0) {
                            console.error(`  ${result.invariantName}: ${result.description}`);
                        }
                    });
                });
            }
        }
    }
} 