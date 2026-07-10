// Reusable promise-returning animation primitives for the combat animation
// system. Every primitive is a no-op resolved promise if the scene is
// missing/dead or its targets are undefined -- headless combat
// (scripts/qa-headless-combat.mjs) runs with NO scene at all and must keep
// working. Follows the house pattern: fire tweens, then await a
// backgroundResistantDelay rather than tween onComplete (tweens throttle in
// hidden tabs; the smoke test runs headless).

import Phaser, { Scene } from 'phaser';
import { IPhysicalCardInterface } from '../../gamecharacters/AbstractCard';
import { backgroundResistantDelay } from '../../utils/BackgroundResistantDelay';
import { DepthManager } from '../DepthManager';

function sceneIsLive(scene?: Scene): scene is Scene {
    return !!scene && !!scene.sys && scene.sys.isActive();
}

export namespace Anim {

    /** Positional jitter on a container. */
    export async function shake(scene: Scene | undefined, container: Phaser.GameObjects.Container | undefined,
        { intensity = 8, duration = 220 }: { intensity?: number; duration?: number } = {}): Promise<void> {
        if (!sceneIsLive(scene) || !container) return;
        const originalX = container.x;
        scene.tweens.add({
            targets: container,
            x: originalX + intensity,
            duration: duration / 4,
            yoyo: true,
            repeat: 3,
            ease: 'Sine.easeInOut',
            onComplete: () => { container.x = originalX; }
        });
        await backgroundResistantDelay(duration);
    }

    /** Reuses ActionManager's tint-flicker logic against a physical card's background. */
    export async function flashTint(scene: Scene | undefined, physicalCard: IPhysicalCardInterface | undefined,
        color: number, duration: number = 250): Promise<void> {
        if (!sceneIsLive(scene) || !physicalCard) return;
        const bg = physicalCard.cardBackground;
        let originalTint: number | undefined;
        if (bg instanceof Phaser.GameObjects.Image) {
            originalTint = bg.tint;
            bg.setTint(color);
        } else if (bg instanceof Phaser.GameObjects.Rectangle) {
            originalTint = bg.fillColor;
            bg.setFillStyle(color);
        }
        await backgroundResistantDelay(duration);
        if (bg instanceof Phaser.GameObjects.Image && originalTint !== undefined) {
            bg.setTint(originalTint);
        } else if (bg instanceof Phaser.GameObjects.Rectangle && originalTint !== undefined) {
            bg.setFillStyle(originalTint);
        }
    }

    /** Moves a container partway toward a target point and back (yoyo lunge). */
    export async function lungeToward(scene: Scene | undefined, container: Phaser.GameObjects.Container | undefined,
        targetXY: { x: number; y: number } | undefined,
        { distanceFraction = 0.35, duration = 220 }: { distanceFraction?: number; duration?: number } = {}): Promise<void> {
        if (!sceneIsLive(scene) || !container || !targetXY) return;
        const originalX = container.x;
        const originalY = container.y;
        const lungeX = originalX + (targetXY.x - originalX) * distanceFraction;
        const lungeY = originalY + (targetXY.y - originalY) * distanceFraction;
        scene.tweens.add({
            targets: container,
            x: lungeX,
            y: lungeY,
            duration: duration / 2,
            yoyo: true,
            ease: 'Power2',
            onComplete: () => { container.x = originalX; container.y = originalY; }
        });
        await backgroundResistantDelay(duration);
    }

    /** Punches the scale of a container up and back down. */
    export async function scalePunch(scene: Scene | undefined, container: Phaser.GameObjects.Container | undefined,
        { scale = 1.25, duration = 180 }: { scale?: number; duration?: number } = {}): Promise<void> {
        if (!sceneIsLive(scene) || !container) return;
        const originalScale = container.scale;
        scene.tweens.add({
            targets: container,
            scale: originalScale * scale,
            duration: duration / 2,
            yoyo: true,
            ease: 'Quad.easeOut',
            onComplete: () => { container.setScale(originalScale); }
        });
        await backgroundResistantDelay(duration);
    }

    /** Brief camera shake for impact emphasis. */
    export async function cameraShake(scene: Scene | undefined,
        { intensity = 0.004, duration = 150 }: { intensity?: number; duration?: number } = {}): Promise<void> {
        if (!sceneIsLive(scene)) return;
        scene.cameras.main.shake(duration, intensity);
        await backgroundResistantDelay(duration);
    }

    /** Spawns a transient projectile that flies from one point to another, then destroys itself.
     *  Falls back to a filled circle Graphics object if no texture is given/available. */
    export async function projectile(scene: Scene | undefined, {
        fromXY, toXY, textureKey, tint, size = 16, duration = 300
    }: {
        fromXY: { x: number; y: number };
        toXY: { x: number; y: number };
        textureKey?: string;
        tint?: number;
        size?: number;
        duration?: number;
        trail?: boolean;
    }): Promise<void> {
        if (!sceneIsLive(scene)) return;

        let obj: Phaser.GameObjects.Image | Phaser.GameObjects.Arc;
        if (textureKey && scene.textures.exists(textureKey)) {
            const img = scene.add.image(fromXY.x, fromXY.y, textureKey);
            img.setDisplaySize(size, size);
            if (tint !== undefined) img.setTint(tint);
            obj = img;
        } else {
            obj = scene.add.circle(fromXY.x, fromXY.y, size / 2, tint ?? 0xffaa33);
        }
        obj.setDepth(DepthManager.getInstance().COMBAT_TEXT);

        try {
            scene.tweens.add({
                targets: obj,
                x: toXY.x,
                y: toXY.y,
                duration,
                ease: 'Power1'
            });
            await backgroundResistantDelay(duration);
        } finally {
            obj.destroy();
        }
    }

    /** Generic floating text, e.g. for card/attack flourishes that want a word rather than a number. */
    export async function floatingText(scene: Scene | undefined, {
        xy, text, color = '#ffffff', duration = 700
    }: {
        xy: { x: number; y: number };
        text: string;
        color?: string;
        duration?: number;
    }): Promise<void> {
        if (!sceneIsLive(scene)) return;
        const textObj = scene.add.text(xy.x, xy.y, text, {
            font: 'bold 24px Arial',
            color: '#ffffff',
            stroke: color,
            strokeThickness: 3
        });
        textObj.setOrigin(0.5);
        textObj.setDepth(DepthManager.getInstance().COMBAT_TEXT);

        scene.tweens.add({
            targets: textObj,
            y: xy.y - 40,
            alpha: 0,
            duration,
            ease: 'Power1',
            onComplete: () => textObj.destroy()
        });
        await backgroundResistantDelay(Math.min(duration, 400));
    }

    /** Transient portrait image for cards zooming toward a target. Caller may destroy it early;
     *  otherwise it self-destroys once the given lifetime elapses. */
    export function ghostCardImage(scene: Scene | undefined, {
        portraitTextureKey, xy, scale = 1
    }: {
        portraitTextureKey?: string;
        xy: { x: number; y: number };
        scale?: number;
    }): Phaser.GameObjects.Image | undefined {
        if (!sceneIsLive(scene) || !portraitTextureKey || !scene.textures.exists(portraitTextureKey)) return undefined;
        const img = scene.add.image(xy.x, xy.y, portraitTextureKey);
        img.setScale(scale);
        img.setDepth(DepthManager.getInstance().COMBAT_TEXT);
        return img;
    }

    /** Expanding, fading ring -- handy for defensive/shield flourishes. */
    export async function expandingRing(scene: Scene | undefined, {
        xy, color = 0x66ccff, startRadius = 10, endRadius = 70, duration = 400
    }: {
        xy: { x: number; y: number };
        color?: number;
        startRadius?: number;
        endRadius?: number;
        duration?: number;
    }): Promise<void> {
        if (!sceneIsLive(scene)) return;
        const ring = scene.add.circle(xy.x, xy.y, startRadius);
        ring.setStrokeStyle(4, color, 1);
        ring.setFillStyle(color, 0);
        ring.setDepth(DepthManager.getInstance().COMBAT_TEXT);

        const scaleFactor = endRadius / startRadius;
        scene.tweens.add({
            targets: ring,
            scale: scaleFactor,
            alpha: 0,
            duration,
            ease: 'Quad.easeOut',
            onComplete: () => ring.destroy()
        });
        await backgroundResistantDelay(Math.min(duration, 350));
    }
}
