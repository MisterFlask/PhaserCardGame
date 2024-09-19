// src/managers/AdjacencyManager.ts

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

    constructor(sparseness: number = 0.3, minConnections: number = 1, maxAdjacencyDistance: number = 200) {
        this.sparseness = sparseness;
        this.minConnections = minConnections;
        this.maxAdjacencyDistance = maxAdjacencyDistance; // Initialize max adjacency distance
    }

    public generateAdjacencies(locations: LocationCard[]): void {
        // Step 1: Calculate distances between all pairs within maxAdjacencyDistance
        const pairs: LocationPair[] = [];
        for (let i = 0; i < locations.length; i++) {
            for (let j = i + 1; j < locations.length; j++) {
                const locA = locations[i];
                const locB = locations[j];
                const distance = this.calculateDistance(locA, locB);
                if (distance <= this.maxAdjacencyDistance) { // Only consider nearby locations
                    pairs.push({ a: locA, b: locB, distance });
                }
            }
        }

        // Step 2: Sort pairs by distance (ascending)
        pairs.sort((pair1, pair2) => pair1.distance - pair2.distance);

        // Step 3: Initialize adjacency list
        locations.forEach(loc => {
            loc.adjacentLocations = []; // Reset existing adjacencies
        });

        // Step 4: Create adjacencies based on sorted distances and sparseness
        for (const pair of pairs) {
            const { a, b } = pair;
            // Avoid duplicate adjacencies
            if (a.adjacentLocations.includes(b) || b.adjacentLocations.includes(a)) {
                continue;
            }

            // Determine adjacency based on sparseness
            const probability = this.sparseness;
            if (Math.random() < probability) {
                this.addAdjacency(a, b);
            }
        }

        // Step 5: Ensure each location has at least `minConnections` adjacencies
        locations.forEach(loc => {
            while (loc.adjacentLocations.length < this.minConnections) {
                // Find the closest location not already connected
                const potentialConnections = pairs
                    .filter(pair => (pair.a === loc || pair.b === loc))
                    .filter(pair => !loc.adjacentLocations.includes(pair.a === loc ? pair.b : pair.a));

                if (potentialConnections.length === 0) break; // No more possible connections

                // Sort by distance
                potentialConnections.sort((p1, p2) => p1.distance - p2.distance);

                // Connect to the closest possible location
                const closestPair = potentialConnections[0];
                if (closestPair) {
                    const other = closestPair.a === loc ? closestPair.b : closestPair.a;
                    this.addAdjacency(loc, other);
                } else {
                    break;
                }
            }
        });

        // Step 6: Ensure the graph is fully connected
        this.ensureFullConnectivity(locations);
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

        // Start BFS from the first location
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

        // Connect disconnected locations to the main component
        disconnected.forEach(loc => {
            // Find the closest location in the visited set
            let closest: LocationCard | null = null;
            let minDistance = Infinity;
            locations.forEach(other => {
                if (visited.has(other)) {
                    const distance = this.calculateDistance(loc, other);
                    if (distance < minDistance) {
                        minDistance = distance;
                        closest = other;
                    }
                }
            });

            if (closest) {
                this.addAdjacency(loc, closest);
                visited.add(loc);
                queue.push(loc);
            }
        });
    }

    public setSparseness(sparseness: number): void {
        this.sparseness = sparseness;
    }

    public setMinConnections(minConnections: number): void {
        this.minConnections = minConnections;
    }
}
