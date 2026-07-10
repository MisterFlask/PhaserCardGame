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

    /** Single source of truth for the End Turn anchor (bottom-right corner).
     *  Post-combat, the sortie-advance button takes over this same spot. */
    static getEndTurnButtonPosition(scene: Phaser.Scene): { x: number, y: number } {
        return { x: scene.scale.width - 160, y: this.getPileY(scene) };
    }

    /** The fixed-size name plate (PhysicalCard.createNameBox) is cardWidth+40
     *  wide and doesn't scale with sizeModifier, so it defines the visual
     *  footprint for standard hand cards. */
    private static readonly NAME_PLATE_MARGIN = 40;

    /** Hand spacing derived from the actual rendered card footprint
     *  (background displayWidth reflects sizeModifier; the fixed name plate
     *  sets the floor). Full footprint — zero overlap — whenever it fits;
     *  the min() against totalWidth/(n+1) compresses only when the hand is
     *  genuinely too wide, and hover-raise covers that crowded case. */
    static getHandCardSpacing(scene: Phaser.Scene, cardArray: PhysicalCard[]): number {
        const baseWidth = CardGuiUtils.getInstance().cardConfig.cardWidth;
        const renderedWidth = cardArray.reduce(
            (max, card) => Math.max(max, card.cardBackground?.displayWidth ?? baseWidth),
            baseWidth
        );
        const footprint = Math.max(renderedWidth, baseWidth + this.NAME_PLATE_MARGIN);
        return Math.min(footprint, scene.scale.width / (cardArray.length + 1));
    }

    static arrangeCards(scene: Phaser.Scene, cardArray: PhysicalCard[], yPosition: number): void {
        const totalWidth = scene.scale.width;
        const cardSpacing = this.getHandCardSpacing(scene, cardArray);
        const totalCardsWidth = cardArray.length * cardSpacing;
        const startX = (totalWidth - totalCardsWidth) / 2;

        const transientState = TransientUiState.getInstance();
        cardArray.forEach((card, index) => {
            // Don't move the card being dragged, nor the hovered card (the
            // hover-raise in CombatInputHandler owns its position until
            // pointerout — otherwise this per-frame arrange fights the lift).
            if (transientState.draggedCard !== card && transientState.hoveredCard !== card) {
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
        const totalWidth = scene.scale.width;
        const cardSpacing = this.getHandCardSpacing(scene, cardArray);
        const totalCardsWidth = cardArray.length * cardSpacing;
        const startX = (totalWidth - totalCardsWidth) / 2;

        return {
            x: startX + index * cardSpacing,
            y: this.getHandY(scene)
        };
    }
}

export default CombatSceneLayoutUtils;
