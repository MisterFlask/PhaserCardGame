import { GameState } from "../../../../../rules/GameState";
import { TargetingType } from "../../../../AbstractCard";
import { BaseCharacter } from "../../../../BaseCharacter";
import { Burning } from "../../../../buffs/standard/Burning";
import { PlayableCard } from "../../../../PlayableCard";
import { CardType } from "../../../../Primitives";
import { Anim } from "../../../../../ui/animations/AnimationPrimitives";
import { CardPlayAnimation } from "../../../../../ui/animations/AnimationTypes";

export class FlamePistol extends PlayableCard {
    constructor() {
        super({
            name: "Flame Revolver",
            description: `_`,
            portraitName: "fire-ray",
            targetingType: TargetingType.NO_TARGETING,
            cardType: CardType.ATTACK,
        });
        this.baseDamage = 4;
        this.baseMagicNumber = 1;
        this.baseEnergyCost = 1;

        this.resourceScalings.push({
            resource: GameState.getInstance().combatState.combatResources.smog,
            magicNumberScaling: 1
        })
        this.flavorText = "Aim is optional. The spray finds someone regardless.";
    }

    override get description(): string {
        return `Deal ${this.getDisplayedDamage()} damage and apply ${this.getDisplayedMagicNumber()} Burning to up to two random enemies.`;
    }
    
    override InvokeCardEffects(targetCard?: BaseCharacter): void {
        const enemies = this.combatState.enemies.filter(e => !e.isDead);
        const targets = enemies.sort(() => Math.random() - 0.5).slice(0, 2);

        for (const enemy of targets){
            this.dealDamageToTarget(enemy);
            this.actionManager.applyBuffToCharacterOrCard(enemy, new Burning(this.getBaseMagicNumberAfterResourceScaling()), this.owningCharacter as BaseCharacter);
        }
    }

    override getPlayAnimation(): CardPlayAnimation {
        return async (ctx) => {
            const enemies = this.combatState.enemies.filter(e => !e.isDead() && e.physicalCard);
            if (enemies.length === 0 || !ctx.scene) return;

            await Promise.all(enemies.map(async (enemy) => {
                const enemyCard = enemy.physicalCard!;
                await Anim.projectile(ctx.scene, {
                    fromXY: ctx.sourceXY,
                    toXY: { x: enemyCard.container.x, y: enemyCard.container.y },
                    tint: 0xff8800,
                    size: 14,
                    duration: 260
                });
                await Anim.flashTint(ctx.scene, enemyCard, 0xff6600, 220);
            }));

            await Anim.cameraShake(ctx.scene, { intensity: 0.005, duration: 150 });
        };
    }
}
