// Uses dagre to find appropriate X and Y coordinates for each strategic project card.
// The intent is for this class to find coordinates such that the cards are spread out and not on top of each other.

import * as dagre from 'dagre';
import { AbstractStrategicProject } from './AbstractStrategicProject';

export interface ProjectNodeLayout {
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
}

export class StrategicProjectTechTree {
    private static readonly NODE_WIDTH = 180;
    private static readonly NODE_HEIGHT = 250;
    private static readonly HORIZONTAL_SPACING = 50;
    private static readonly VERTICAL_SPACING = 100;

    /**
     * Calculates layout positions for all strategic project cards in the tech tree
     * @param projects List of all strategic projects
     * @returns Map of project name to layout information (position, dimensions)
     */
    public static calculateLayout(projects: AbstractStrategicProject[]): Map<string, ProjectNodeLayout> {
        // Create a new directed graph
        const g = new dagre.graphlib.Graph();
        
        // Set an object for the graph label
        g.setGraph({
            rankdir: 'LR', // Left to right layout
            nodesep: this.VERTICAL_SPACING,
            ranksep: this.HORIZONTAL_SPACING,
            marginx: 20,
            marginy: 20
        });
        
        // Default to assigning a new object as a label for each new edge.
        g.setDefaultEdgeLabel(() => ({}));
        
        // Add nodes for each project
        for (const project of projects) {
            g.setNode(project.name, { 
                width: this.NODE_WIDTH, 
                height: this.NODE_HEIGHT,
                label: project.name
            });
        }
        
        // Add edges based on prerequisites
        for (const project of projects) {
            const prerequisites = project.getPrerequisites();
            for (const prereq of prerequisites) {
                g.setEdge(prereq.name, project.name);
            }
        }
        
        // Run the layout algorithm
        dagre.layout(g);
        
        // Extract the positions
        const layoutMap = new Map<string, ProjectNodeLayout>();
        
        g.nodes().forEach(nodeName => {
            const node = g.node(nodeName);
            layoutMap.set(nodeName, {
                id: nodeName,
                x: node.x,
                y: node.y,
                width: this.NODE_WIDTH,
                height: this.NODE_HEIGHT
            });
        });
        
        return layoutMap;
    }
    
    /**
     * Gets the edges to be drawn between strategic projects
     * @param projects List of all strategic projects
     * @returns Array of edge objects with source and target node names
     */
    public static getEdges(projects: AbstractStrategicProject[]): { source: string, target: string }[] {
        const edges: { source: string, target: string }[] = [];
        
        for (const project of projects) {
            const prerequisites = project.getPrerequisites();
            for (const prereq of prerequisites) {
                edges.push({
                    source: prereq.name,
                    target: project.name
                });
            }
        }
        
        return edges;
    }
}
