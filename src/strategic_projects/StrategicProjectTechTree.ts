// Uses a simple 8x8 grid layout for strategic project cards.
// Each card is placed in a grid cell with fixed spacing.

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
    private static readonly GRID_COLUMNS = 8;
    private static readonly GRID_ROWS = 8;
    private static readonly HORIZONTAL_SPACING = 50;
    private static readonly VERTICAL_SPACING = 100;

    /**
     * Calculates layout positions for all strategic project cards in an 8x8 grid
     * @param projects List of all strategic projects
     * @returns Map of project name to layout information (position, dimensions)
     */
    public static calculateLayout(projects: AbstractStrategicProject[]): Map<string, ProjectNodeLayout> {
        const layoutMap = new Map<string, ProjectNodeLayout>();
        
        projects.forEach((project, index) => {
            const row = Math.floor(index / this.GRID_COLUMNS);
            const col = index % this.GRID_COLUMNS;
            
            // Calculate position based on grid cell
            const x = col * (this.NODE_WIDTH + this.HORIZONTAL_SPACING);
            const y = row * (this.NODE_HEIGHT + this.VERTICAL_SPACING);
            
            layoutMap.set(project.name, {
                id: project.name,
                x: x,
                y: y,
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
        // Since we're not showing edges in the grid layout, return an empty array
        return [];
    }
}
