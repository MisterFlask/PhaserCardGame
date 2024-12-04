import Phaser from 'phaser';

export interface BattlefieldPosition {
    xFraction: number;  // 0-1 representing position across battlefield width
    yFraction: number;  // 0-1 representing position across battlefield height
    isOccupied: boolean;
    occupiedById?: string;
}

export class EnemyPositionManager {
    private static readonly POSITIONS: BattlefieldPosition[] = [
        { xFraction: 0.2, yFraction: 0.5, isOccupied: false },
        { xFraction: 0.4, yFraction: 0.3, isOccupied: false },
        { xFraction: 0.4, yFraction: 0.7, isOccupied: false },
        { xFraction: 0.6, yFraction: 0.5, isOccupied: false },
        { xFraction: 0.8, yFraction: 0.3, isOccupied: false },
        { xFraction: 0.8, yFraction: 0.7, isOccupied: false },
    ];

    private positions: BattlefieldPosition[];
    private battlefieldBounds: Phaser.Geom.Rectangle;

    constructor(battlefieldBounds: Phaser.Geom.Rectangle) {
        this.battlefieldBounds = battlefieldBounds;
        this.positions = JSON.parse(JSON.stringify(EnemyPositionManager.POSITIONS));
    }

    public placeEnemyAtOpenPosition(enemyId: string): { x: number, y: number } | null {
        // First check if enemy already has a position
        const existingPosition = this.positions.find(p => p.occupiedById === enemyId);
        if (existingPosition) {
            return this.convertToWorldPosition(existingPosition);
        }

        // Find first unoccupied position
        const availablePosition = this.positions.find(p => !p.isOccupied);
        if (availablePosition) {
            availablePosition.isOccupied = true;
            availablePosition.occupiedById = enemyId;
            return this.convertToWorldPosition(availablePosition);
        }

        // If no predefined positions are available, return a random position within bounds
        return {
            x: this.battlefieldBounds.x + (Math.random() * this.battlefieldBounds.width),
            y: this.battlefieldBounds.y + (Math.random() * this.battlefieldBounds.height)
        };
    }

    public releasePosition(enemyId: string): void {
        const position = this.positions.find(p => p.occupiedById === enemyId);
        if (position) {
            position.isOccupied = false;
            position.occupiedById = undefined;
        }
    }

    public reset(): void {
        this.positions.forEach(p => {
            p.isOccupied = false;
            p.occupiedById = undefined;
        });
    }

    private convertToWorldPosition(position: BattlefieldPosition): { x: number, y: number } {
        return {
            x: this.battlefieldBounds.x + (position.xFraction * this.battlefieldBounds.width),
            y: this.battlefieldBounds.y + (position.yFraction * this.battlefieldBounds.height)
        };
    }
} 