// Singleton entry point wiring bespoke card/enemy animations into the
// combat action pipeline. Every method here must be safe to call with no
// live scene (headless combat) and must never let an animation bug break
// the action queue -- bespoke calls are wrapped in try/catch and raced
// against a safety-cap delay.

import Phaser, { Scene } from 'phaser';
import { IPhysicalCardInterface } from '../../gamecharacters/AbstractCard';
import type { BaseCharacter } from '../../gamecharacters/BaseCharacter';
import type { PlayableCard } from '../../gamecharacters/PlayableCard';
import { backgroundResistantDelay } from '../../utils/BackgroundResistantDelay';
import { CardPlayContext, CharacterAnimContext } from './AnimationTypes';

const SAFETY_CAP_MS = 1500;

function sceneIsLive(scene?: Scene): scene is Scene {
    return !!scene && !!scene.sys && scene.sys.isActive();
}

async function withSafetyCap(label: string, work: Promise<void>): Promise<void> {
    try {
        await Promise.race([work, backgroundResistantDelay(SAFETY_CAP_MS)]);
    } catch (err) {
        console.error(`CombatAnimationManager: ${label} threw and was swallowed:`, err);
    }
}

export class CombatAnimationManager {
    private static instance: CombatAnimationManager;

    public static getInstance(): CombatAnimationManager {
        if (!CombatAnimationManager.instance) {
            CombatAnimationManager.instance = new CombatAnimationManager();
        }
        return CombatAnimationManager.instance;
    }

    private constructor() { }

    /** Plays a card's bespoke play-flourish, if it declares one. No-op (resolves immediately)
     *  when the card has no getPlayAnimation() override or there's no live scene. */
    public async playCardFlourish(card: PlayableCard, ctx: CardPlayContext): Promise<void> {
        const anim = card.getPlayAnimation?.();
        if (!anim || !sceneIsLive(ctx.scene)) return;
        await withSafetyCap(`playCardFlourish(${card.name})`, anim(ctx));
    }

    /** Plays a character's bespoke attack animation, or the default tilt if none is declared. */
    public async enemyAttackFlourish(character: BaseCharacter, scene: Scene | undefined, target?: BaseCharacter): Promise<void> {
        if (!sceneIsLive(scene) || !character.physicalCard) return;

        const bespoke = character.getAttackAnimation?.();
        const ctx: CharacterAnimContext = {
            scene,
            physicalCard: character.physicalCard,
            targetPhysicalCard: target?.physicalCard
        };

        if (bespoke) {
            await withSafetyCap(`enemyAttackFlourish(${character.name})`, bespoke(ctx));
            return;
        }

        await this.defaultAttackerTilt(scene, character.physicalCard);
    }

    /** Identical visual to the original ActionManager.animateAttackerTilt. */
    public async defaultAttackerTilt(scene: Scene | undefined, attacker: IPhysicalCardInterface): Promise<void> {
        if (!sceneIsLive(scene)) return;
        scene.tweens.add({
            targets: attacker.container,
            angle: 15,
            duration: 100,
            yoyo: true,
            ease: 'Power1'
        });
        await backgroundResistantDelay(200);
    }

    /** Plays a character's bespoke hurt animation, or the default jiggle+glow if none is declared. */
    public async struckFlourish(character: BaseCharacter, scene: Scene | undefined, { blocked }: { blocked: boolean }): Promise<void> {
        if (!sceneIsLive(scene) || !character.physicalCard) return;

        const bespoke = character.getHurtAnimation?.();
        const ctx: CharacterAnimContext = { scene, physicalCard: character.physicalCard };

        if (bespoke) {
            await withSafetyCap(`struckFlourish(${character.name})`, bespoke(ctx));
            return;
        }

        await this.defaultDefenderJiggleAndGlow(scene, character.physicalCard, blocked ? 0xffffff : 0xff0000);
    }

    /** Identical visual to the original ActionManager.animateDefenderJiggleAndGlow. */
    public async defaultDefenderJiggleAndGlow(scene: Scene | undefined, defender: IPhysicalCardInterface, color: number): Promise<void> {
        if (!sceneIsLive(scene)) return;

        scene.tweens.add({
            targets: defender.container,
            x: defender.container.x + 10,
            duration: 100,
            yoyo: true,
            repeat: 2,
            ease: 'Power1'
        });

        const bg = defender.cardBackground;
        if (bg instanceof Phaser.GameObjects.Image) {
            scene.tweens.add({
                targets: bg,
                tint: color,
                duration: 100,
                yoyo: true,
                ease: 'Power1'
            });
        } else if (bg instanceof Phaser.GameObjects.Rectangle) {
            scene.tweens.add({
                targets: bg,
                fillColor: color,
                duration: 100,
                yoyo: true,
                ease: 'Power1'
            });
        }

        await backgroundResistantDelay(300);
    }

    /** Plays a character's bespoke death animation, if any. Returns true when a bespoke
     *  animation ran so the caller can skip its own default fade/obliterate visuals. */
    public async deathFlourish(character: BaseCharacter, scene: Scene | undefined): Promise<boolean> {
        if (!sceneIsLive(scene) || !character.physicalCard) return false;

        const bespoke = character.getDeathAnimation?.();
        if (!bespoke) return false;

        const ctx: CharacterAnimContext = { scene, physicalCard: character.physicalCard };
        await withSafetyCap(`deathFlourish(${character.name})`, bespoke(ctx));
        return true;
    }
}
