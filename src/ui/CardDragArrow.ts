import Phaser from 'phaser';

export class CardDragArrow extends Phaser.GameObjects.Container {
    private static readonly BREADCRUMB_SPACING = 20; // pixels between each breadcrumb
    private static readonly BREADCRUMB_SIZE = 8; // size of each breadcrumb sprite
    private static readonly ARROW_COLOR = 0xffff00; // yellow color for the arrow
    private static readonly MAX_BREADCRUMBS = 30; // maximum number of breadcrumbs to show

    private breadcrumbs: Phaser.GameObjects.Arc[] = [];
    private startPoint: Phaser.Math.Vector2;
    private endPoint: Phaser.Math.Vector2;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y);
        scene.add.existing(this);
        
        this.startPoint = new Phaser.Math.Vector2(0, 0);
        this.endPoint = new Phaser.Math.Vector2(0, 0);
        
        // Initially hide the arrow
        this.setVisible(false);
    }

    public setStartPoint(x: number, y: number): void {
        this.startPoint.set(x, y);
        this.updateArrow();
    }

    public setEndPoint(x: number, y: number): void {
        this.endPoint.set(x, y);
        this.updateArrow();
    }

    public show(): void {
        this.setVisible(true);
    }

    public hide(): void {
        this.setVisible(false);
    }

    private updateArrow(): void {
        // Clear existing breadcrumbs
        this.breadcrumbs.forEach(crumb => crumb.destroy());
        this.breadcrumbs = [];

        // Calculate direction and distance
        const direction = new Phaser.Math.Vector2(
            this.endPoint.x - this.startPoint.x,
            this.endPoint.y - this.startPoint.y
        );
        const distance = direction.length();

        // Normalize direction
        direction.normalize();

        // Calculate number of breadcrumbs needed
        const numBreadcrumbs = Math.min(
            Math.floor(distance / CardDragArrow.BREADCRUMB_SPACING),
            CardDragArrow.MAX_BREADCRUMBS
        );

        // Create breadcrumbs
        for (let i = 0; i < numBreadcrumbs; i++) {
            const t = i / (numBreadcrumbs - 1); // Interpolation factor
            const x = this.startPoint.x + direction.x * distance * t;
            const y = this.startPoint.y + direction.y * distance * t;

            // Create a circular breadcrumb
            const breadcrumb = this.scene.add.circle(
                x, y,
                CardDragArrow.BREADCRUMB_SIZE / 2,
                CardDragArrow.ARROW_COLOR,
                1
            );
            
            // Make the breadcrumbs fade out towards the start
            breadcrumb.setAlpha(0.3 + 0.7 * t);
            
            this.breadcrumbs.push(breadcrumb);
            this.add(breadcrumb);
        }
    }

    public destroy(): void {
        this.breadcrumbs.forEach(crumb => crumb.destroy());
        super.destroy();
    }
} 