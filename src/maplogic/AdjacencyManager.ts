// src/managers/AdjacencyManager.ts

import { GameState } from "../rules/GameState";
import { LocationCard } from "./LocationCard";


interface LocationPair {
    a: LocationCard;
    b: LocationCard;
    distance: number;
}

export class AdjacencyManager {
    private sparseness: number; // Probability to create an adjacency between any two nodes
    private minConnections: number; // Minimum number of connections per location
    private maxAdjacencyDistance: number; // Maximum distance to consider for adjacency
    private maxIndexDifference: number; // Maximum difference in room indexes for adjacency

    constructor(sparseness: number = 0.3, minConnections: number = 1, maxAdjacencyDistance: number = 200, maxIndexDifference: number = 2) {
        this.sparseness = sparseness;
        this.minConnections = minConnections;
        this.maxAdjacencyDistance = maxAdjacencyDistance;
        this.maxIndexDifference = maxIndexDifference;
    }

    public enrichLocationsWithAdjacencies(): void {
        // Step 1: Organize locations by floor
        const locations = GameState.getInstance().getLocations();
        const floors: Map<number, LocationCard[]> = new Map();
        locations.forEach(loc => {
            const floor = loc.floor;
            if (!floors.has(floor)) {
                floors.set(floor, []);
            }
            floors.get(floor)!.push(loc);
        });

        // Step 2: Connect nodes between adjacent floors only
        const sortedFloors = Array.from(floors.keys()).sort((a, b) => a - b);
        for (let i = 0; i < sortedFloors.length - 1; i++) {
            const currentFloor = floors.get(sortedFloors[i])!;
            const nextFloor = floors.get(sortedFloors[i + 1])!;
            
            currentFloor.forEach(loc => {
                // Ensure each node connects to 1-3 nodes on the next floor
                const connections = Phaser.Math.Between(1, 3);
                const validNextFloorNodes = nextFloor.filter(nextLoc => 
                    Math.abs(nextLoc.roomNumber - loc.roomNumber) <= this.maxIndexDifference
                );
                const shuffledNext = Phaser.Utils.Array.Shuffle(validNextFloorNodes.slice());
                for (let j = 0; j < connections && j < shuffledNext.length; j++) {
                    this.addAdjacency(loc, shuffledNext[j]);
                }
            });
        }

        // Step 3: Connect all nodes on the penultimate floor to the Boss node
        const penultimateFloor = sortedFloors[sortedFloors.length - 2];
        const bossFloor = sortedFloors[sortedFloors.length - 1];
        const bossNode = floors.get(bossFloor)![0]; // Assuming single Boss node

        floors.get(penultimateFloor)!.forEach(loc => {
            this.addAdjacency(loc, bossNode);
        });

        // Step 4: Ensure at least one valid path from Entrance to Boss
        this.ensurePath(floors, sortedFloors, bossNode);

        // Step 5: Optionally add branching paths (only between adjacent floors)
        this.addBranchingPaths(floors, sortedFloors);

        // Step 6: Ensure the graph is fully connected
        this.ensureFullConnectivity(locations);

        // After adjacency creation, get the Entrance node
        const entranceNode = floors.get(1)![0]; // Assuming single Entrance node

        // Explicitly connect any unconnected floor 2 nodes to the Entrance node
        const floor2Nodes = floors.get(2)!;
        floor2Nodes.forEach(loc => {
            if (loc.adjacentLocations.length === 0) {
                this.addAdjacency(loc, entranceNode);
                console.log(`Connected unconnected floor 2 node ${loc.id} to Entrance node`);
            }
        });
    }

    private ensurePath(floors: Map<number, LocationCard[]>, sortedFloors: number[], bossNode: LocationCard): void {
        let current = floors.get(sortedFloors[0])![0]; // Entrance node
        for (let i = 1; i < sortedFloors.length; i++) {
            const nextFloor = floors.get(sortedFloors[i])!;
            const validNextNodes = nextFloor.filter(nextLoc => 
                Math.abs(nextLoc.roomNumber - current.roomNumber) <= this.maxIndexDifference
            );
            const nextNode = validNextNodes[0] || nextFloor[0]; // Choose the first valid node or fallback to first node
            this.addAdjacency(current, nextNode);
            current = nextNode;
        }
        this.addAdjacency(current, bossNode);
    }

    private addBranchingPaths(floors: Map<number, LocationCard[]>, sortedFloors: number[]): void {
        for (let i = 0; i < sortedFloors.length - 1; i++) {
            const currentFloor = floors.get(sortedFloors[i])!;
            const nextFloor = floors.get(sortedFloors[i + 1])!;
            currentFloor.forEach(loc => {
                if (Phaser.Math.FloatBetween(0, 1) < 0.3) { // 30% chance to add a branch
                    const potential = nextFloor.filter(l => 
                        !loc.adjacentLocations.includes(l) && 
                        Math.abs(l.roomNumber - loc.roomNumber) <= this.maxIndexDifference
                    );
                    if (potential.length > 0) {
                        const target = Phaser.Utils.Array.GetRandom(potential);
                        this.addAdjacency(loc, target);
                    }
                }
            });
        }
    }

    private calculateDistance(a: LocationCard, b: LocationCard): number {
        const dx = a.xPos - b.xPos;
        const dy = a.yPos - b.yPos;
        return Math.sqrt(dx * dx + dy * dy);
    }

    private addAdjacency(a: LocationCard, b: LocationCard): void {
        if (!a.adjacentLocations.includes(b)) {
            a.setAdjacent(b);
        }
        if (!b.adjacentLocations.includes(a)) {
            b.setAdjacent(a);
        }
    }

    private ensureFullConnectivity(locations: LocationCard[]): void {
        const visited = new Set<LocationCard>();
        const queue: LocationCard[] = [];

        if (locations.length === 0) return;

        // Start BFS from the first location (entrance)
        queue.push(locations[0]);
        visited.add(locations[0]);

        while (queue.length > 0) {
            const current = queue.shift()!;
            current.adjacentLocations.forEach(neighbor => {
                if (!visited.has(neighbor)) {
                    visited.add(neighbor);
                    queue.push(neighbor);
                }
            });
        }

        // Find disconnected locations
        const disconnected = locations.filter(loc => !visited.has(loc));

        // Group locations by floor for easier previous floor lookup
        const floorMap = new Map<number, LocationCard[]>();
        locations.forEach(loc => {
            if (!floorMap.has(loc.floor)) {
                floorMap.set(loc.floor, []);
            }
            floorMap.get(loc.floor)!.push(loc);
        });

        // Connect disconnected locations to the previous floor
        disconnected.forEach(loc => {
            const previousFloor = loc.floor - 1;
            const previousFloorRooms = floorMap.get(previousFloor);

            if (previousFloorRooms && previousFloorRooms.length > 0) {
                // Find the closest room on the previous floor within maxIndexDifference
                const validPreviousRooms = previousFloorRooms.filter(prev => 
                    Math.abs(prev.roomNumber - loc.roomNumber) <= this.maxIndexDifference
                );

                if (validPreviousRooms.length > 0) {
                    // Connect to the closest valid room on the previous floor
                    const closest = validPreviousRooms.reduce((prev, curr) => {
                        const prevDist = Math.abs(prev.roomNumber - loc.roomNumber);
                        const currDist = Math.abs(curr.roomNumber - loc.roomNumber);
                        return prevDist < currDist ? prev : curr;
                    });

                    this.addAdjacency(loc, closest);
                    visited.add(loc);
                    queue.push(loc);
                } else {
                    // If no valid rooms within maxIndexDifference, connect to the closest room anyway
                    const closest = previousFloorRooms.reduce((prev, curr) => {
                        const prevDist = Math.abs(prev.roomNumber - loc.roomNumber);
                        const currDist = Math.abs(curr.roomNumber - loc.roomNumber);
                        return prevDist < currDist ? prev : curr;
                    });

                    this.addAdjacency(loc, closest);
                    visited.add(loc);
                    queue.push(loc);
                }
            }
        });
    }

    public setSparseness(sparseness: number): void {
        this.sparseness = sparseness;
    }

    public setMinConnections(minConnections: number): void {
        this.minConnections = minConnections;
    }

    public setMaxIndexDifference(maxIndexDifference: number): void {
        this.maxIndexDifference = maxIndexDifference;
    }
}
