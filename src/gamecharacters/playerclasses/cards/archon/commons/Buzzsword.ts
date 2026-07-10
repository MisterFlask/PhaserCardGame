import { AbstractCard, TargetingType } from "../../../../AbstractCard";
import { BaseCharacter } from "../../../../BaseCharacter";
import { EntityRarity } from "../../../../EntityRarity";
import { PlayableCard } from "../../../../PlayableCard";
import { CardType } from "../../../../Primitives";
import { StressReliefFinisher } from "../../../../buffs/standard/StressReliefFinisher";
import { BasicProcs } from "../../../../procs/BasicProcs";
import { backgroundResistantDelay } from "../../../../../utils/BackgroundResistantDelay";
import { Anim } from "../../../../../ui/animations/AnimationPrimitives";
import { CardPlayAnimation } from "../../../../../ui/animations/AnimationTypes";

export class Buzzsword extends PlayableCard {
    constructor() {
        super({
            name: "Buzzsword",
            portraitName: "mailed-fist",
            cardType: CardType.ATTACK,
            targetingType: TargetingType.ENEMY,
            rarity: EntityRarity.COMMON,
        });
        this.baseEnergyCost = 2;
        this.baseDamage = 12;
        this.buffs.push(new StressReliefFinisher());
        this.resourceScalings.push({
            resource: this.pluck,
            attackScaling: 1,
        });
        this.resourceScalings.push({
            resource: this.venture,
            attackScaling: 1,
        });
        this.flavorText = "Standard-issue sidearm. Regulations require it be sheathed, never sharpened.";
    }

    override InvokeCardEffects(targetCard?: AbstractCard): void {
        if (targetCard instanceof BaseCharacter) {
            this.dealDamageToTarget(targetCard);
        }

        BasicProcs.getInstance().Exert(this, 1, (energyExerted) => {
            if (energyExerted > 0) {
                this.dealDamageToTarget(targetCard);
            }
        });
    }

    override get description(): string {
        return `Deal 8 damage. Exert 1: Do it again.`;
    }

    override getPlayAnimation(): CardPlayAnimation {
        return async (ctx) => {
            const targetCard = ctx.target?.physicalCard;
            if (!targetCard) return;

            const ghost = Anim.ghostCardImage(ctx.scene, {
                portraitTextureKey: ctx.scene ? this.getEffectivePortraitName(ctx.scene) : undefined,
                xy: ctx.sourceXY,
                scale: 0.6
            });

            if (ghost && ctx.scene) {
                try {
                    ctx.scene.tweens.add({
                        targets: ghost,
                        x: targetCard.container.x,
                        y: targetCard.container.y,
                        angle: 360,
                        duration: 220,
                        ease: 'Power2'
                    });
                    await backgroundResistantDelay(220);
                } finally {
                    ghost.destroy();
                }
            }

            await Promise.all([
                Anim.flashTint(ctx.scene, targetCard, 0xff0000, 200),
                Anim.cameraShake(ctx.scene, { intensity: 0.006, duration: 150 }),
                Anim.scalePunch(ctx.scene, targetCard.container, { scale: 1.2, duration: 180 })
            ]);
        };
    }
}
