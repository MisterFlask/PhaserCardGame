import { AbstractStrategicProject } from './AbstractStrategicProject';
import { StrategicProjectTechTree } from './StrategicProjectTechTree';

// Example function to show how to use the StrategicProjectTechTree
export function demonstrateStrategicProjectTechTree(projects: AbstractStrategicProject[]): void {
    // Calculate the layout using dagre
    const layout = StrategicProjectTechTree.calculateLayout(projects);
    
    // Get the edges to draw connections between projects
    const edges = StrategicProjectTechTree.getEdges(projects);
    
    console.log('Strategic Project Positions:');
    layout.forEach((nodeLayout, nodeName) => {
        console.log(`${nodeName} - X: ${nodeLayout.x}, Y: ${nodeLayout.y}`);
    });
    
    console.log('\nStrategic Project Connections:');
    edges.forEach(edge => {
        console.log(`${edge.source} → ${edge.target}`);
    });
}

// Example usage in a Phaser scene:
/* 
class TechTreeScene extends Phaser.Scene {
    create() {
        // Load all projects
        const projects = [project1, project2, project3, ...];
        
        // Calculate layout
        const layout = StrategicProjectTechTree.calculateLayout(projects);
        const edges = StrategicProjectTechTree.getEdges(projects);
        
        // Draw connections first (so they're behind the cards)
        edges.forEach(edge => {
            const sourcePos = layout.get(edge.source);
            const targetPos = layout.get(edge.target);
            if (sourcePos && targetPos) {
                const line = this.add.line(
                    0, 0, 
                    sourcePos.x, sourcePos.y, 
                    targetPos.x, targetPos.y, 
                    0xFFFFFF
                );
                line.setOrigin(0, 0);
            }
        });
        
        // Draw project cards at their calculated positions
        projects.forEach(project => {
            const pos = layout.get(project.name);
            if (pos) {
                // Create card sprite/container
                const card = this.add.sprite(pos.x, pos.y, 'project-card');
                const text = this.add.text(pos.x, pos.y, project.name, { align: 'center' });
                text.setOrigin(0.5);
            }
        });
    }
}
*/ 