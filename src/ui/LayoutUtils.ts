// src/utils/LayoutUtils.ts

import Phaser from 'phaser';
import { PhysicalCard } from '../ui/PhysicalCard';
import { CardGuiUtils } from '../utils/CardGuiUtils';
import { TransientUiState } from './TransientUiState';

class CombatSceneLayoutUtils {
    static getBattlefieldY(scene: Phaser.Scene): number {
        return scene.scale.height * 0.53;
    }

    static getHandY(scene: Phaser.Scene): number {
        return scene.scale.height * 0.8;
    }

    static getDividerY(scene: Phaser.Scene): number {
        return scene.scale.height * 0.68;
    }

    static getPileY(scene: Phaser.Scene): number {
        return scene.scale.height * 0.9;
    }

    static arrangeCards(scene: Phaser.Scene, cardArray: PhysicalCard[], yPosition: number): void {
        const gameWidth = scene.scale.width;
        const totalWidth = gameWidth;
        const cardSpacing = Math.min(CardGuiUtils.getInstance().cardConfig.cardWidth, totalWidth / (cardArray.length + 1));
        const totalCardsWidth = cardArray.length * cardSpacing;
        const startX = (totalWidth - totalCardsWidth) / 2;

        cardArray.forEach((card, index) => {
            // Don't move the card that is being dragged
            if (TransientUiState.getInstance().draggedCard !== card) {
                const targetX = startX + index * cardSpacing;
                
                // Use tweens instead of direct position setting
                scene.tweens.add({
                    targets: card.container,
                    x: targetX,
                    y: yPosition,
                    duration: 200,
                    ease: 'Power2',
                    onComplete: () => {
                        (card.container as any).originalDepth = index;
                    }
                });
            }
        });
    }

    static getBattlefieldDropArea(scene: Phaser.Scene): Phaser.Geom.Rectangle {
        const width = scene.scale.width * 0.8; // Using 80% of screen width
        const height = scene.scale.height * 0.25; // Area above battlefield
        const x = (scene.scale.width - width) / 2; // Centered horizontally
        const y = this.getBattlefieldY(scene) - height; // Above battlefield
        
        return new Phaser.Geom.Rectangle(x, y, width, height);
    }

    static isDroppedOnBattlefield(scene: Phaser.Scene, pointer: Phaser.Input.Pointer): boolean {
        const dropArea = this.getBattlefieldDropArea(scene);
        return dropArea.contains(pointer.x, pointer.y);
    }

    static getCardPositionInHand(scene: Phaser.Scene, index: number, cardArray: PhysicalCard[]): { x: number, y: number } {
        const gameWidth = scene.scale.width;
        const totalWidth = gameWidth;
        const cardSpacing = Math.min(CardGuiUtils.getInstance().cardConfig.cardWidth, totalWidth / (cardArray.length + 1));
        const totalCardsWidth = cardArray.length * cardSpacing;
        const startX = (totalWidth - totalCardsWidth) / 2;
        
        return {
            x: startX + index * cardSpacing,
            y: this.getHandY(scene)
        };
    }
}

export default CombatSceneLayoutUtils;
