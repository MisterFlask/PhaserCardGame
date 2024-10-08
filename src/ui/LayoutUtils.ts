// src/utils/LayoutUtils.ts

import Phaser from 'phaser';
import CombatInputHandler from '../screens/subcomponents/CombatInputHandler';
import { PhysicalCard } from '../ui/PhysicalCard';
import { CardGuiUtils } from '../utils/CardGuiUtils';

class CombatSceneLayoutUtils {
    static getBattlefieldY(scene: Phaser.Scene): number {
        return scene.scale.height * 0.33;
    }

    static getHandY(scene: Phaser.Scene): number {
        return scene.scale.height * 0.75;
    }

    static getDividerY(scene: Phaser.Scene): number {
        return scene.scale.height * 0.58;
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
            if (CombatInputHandler.draggedCard !== card) {
                card.container.x = startX + index * cardSpacing;
                card.container.y = yPosition;
                (card.container as any).originalDepth = index;
            }
        });
    }

    static isDroppedOnBattlefield(scene: Phaser.Scene, pointer: Phaser.Input.Pointer): boolean {
        const battlefieldY = this.getBattlefieldY(scene);
        return pointer.y < battlefieldY;
    }
}

export default CombatSceneLayoutUtils;
