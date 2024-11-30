import Phaser from 'phaser';
import { LocationCard } from './LocationCard';

export class AdjacencyLineRenderer {
    private scene: Phaser.Scene;
    private container: Phaser.GameObjects.Container;
    private breadcrumbsPerLine: number = 10;
    private breadcrumbsByConnection: Map<string, Phaser.GameObjects.Image[]> = new Map();

    // Color constants similar to CombatHighlightsManager
    private static readonly HIGHLIGHTED_COLOR = 0xffff00;  // Yellow
    private static readonly DEFAULT_COLOR = 0xffffff;      // White

    constructor(scene: Phaser.Scene, container: Phaser.GameObjects.Container) {
        this.scene = scene;
        this.container = container;
    }

    public renderAdjacencyLines(locations: LocationCard[]): void {
        // Clear existing breadcrumbs and the connection map
        this.clearAllBreadcrumbs();
        this.breadcrumbsByConnection.clear();

        locations.forEach(location => {
            const fromX = location.xPos;
            const fromY = location.yPos;

            location.adjacentLocations.forEach(adj => {
                if (adj.id > location.id) {
                    if (!locations.includes(location) || !locations.includes(adj)) {
                        return;
                    }
                    this.createBreadcrumbLine(location.id, adj.id, fromX, fromY, adj.xPos, adj.yPos);
                }
            });
        });
    }

    private createBreadcrumbLine(fromId: string, toId: string, fromX: number, fromY: number, toX: number, toY: number): void {
        const distance = Phaser.Math.Distance.Between(fromX, fromY, toX, toY);
        const angle = Phaser.Math.Angle.Between(fromX, fromY, toX, toY);
        const breadcrumbs: Phaser.GameObjects.Image[] = [];

        for (let i = 0; i < this.breadcrumbsPerLine; i++) {
            const progress = i / (this.breadcrumbsPerLine - 1);
            const x = fromX + (toX - fromX) * progress;
            const y = fromY + (toY - fromY) * progress;

            const breadcrumb = this.scene.add.image(x, y, 'breadcrumbs');
            breadcrumb.setName('breadcrumb');
            breadcrumb.setDisplaySize(20, 20);
            breadcrumb.setRotation(angle);
            breadcrumb.setTint(AdjacencyLineRenderer.DEFAULT_COLOR);
            
            this.container.add(breadcrumb);
            breadcrumbs.push(breadcrumb);
        }

        // Store breadcrumbs for both directions
        const connectionKey1 = `${fromId}-${toId}`;
        const connectionKey2 = `${toId}-${fromId}`;
        this.breadcrumbsByConnection.set(connectionKey1, breadcrumbs);
        this.breadcrumbsByConnection.set(connectionKey2, breadcrumbs);
    }

    public highlightConnectionsForLocation(location: LocationCard): void {
        location.adjacentLocations.forEach(adj => {
            const connectionKey = `${location.id}-${adj.id}`;
            const breadcrumbs = this.breadcrumbsByConnection.get(connectionKey);
            if (breadcrumbs) {
                breadcrumbs.forEach(breadcrumb => {
                    breadcrumb.setTint(AdjacencyLineRenderer.HIGHLIGHTED_COLOR);
                });
            }
        });
    }

    public clearHighlights(): void {
        this.breadcrumbsByConnection.forEach((breadcrumbs) => {
            breadcrumbs.forEach(breadcrumb => {
                breadcrumb.setTint(AdjacencyLineRenderer.DEFAULT_COLOR);
            });
        });
    }

    private clearAllBreadcrumbs(): void {
        this.container.list
            .filter(child => child.name === 'breadcrumb')
            .forEach(child => child.destroy());
    }
} 