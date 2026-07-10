// grant 5 block to the targeted character

import { BaseCharacterType } from "../../../../Types";
import { AbstractCard, TargetingType } from "../../../AbstractCard";
import { EntityRarity } from "../../../EntityRarity";
import { PlayableCardWithHelpers } from "../../../PlayableCardWithHelpers";
import { Anim } from "../../../../ui/animations/AnimationPrimitives";
import { CardPlayAnimation } from "../../../../ui/animations/AnimationTypes";

export class Defend extends PlayableCardWithHelpers {
    constructor() {
        super({
            name: "Defend",
            description: `_`,
            portraitName: "shield",
            targetingType: TargetingType.ALLY,
        });
        this.baseBlock = 5;
        this.rarity = EntityRarity.BASIC;
        this.baseEnergyCost = 1;
        this.flavorText = "Company-issue. Blocks the first blow reliably and every blow afterward optimistically.";
    }

    override get description(): string {
        return `Grant ${this.getDisplayedBlock()} Block to the targeted character.`;
    }
    
    override InvokeCardEffects(targetCard?: AbstractCard): void {
        if (targetCard && targetCard.isBaseCharacter()) {
            this.applyBlockToTarget(targetCard as BaseCharacterType);
        }
    }

    override getPlayAnimation(): CardPlayAnimation {
        return async (ctx) => {
            const recipient = (ctx.target ?? ctx.owner)?.physicalCard;
            if (!recipient) return;

            await Promise.all([
                Anim.flashTint(ctx.scene, recipient, 0x66ccff, 300),
                Anim.scalePunch(ctx.scene, recipient.container, { scale: 1.15, duration: 220 }),
                Anim.expandingRing(ctx.scene, {
                    xy: { x: recipient.container.x, y: recipient.container.y },
                    color: 0x99ddff,
                    startRadius: 15,
                    endRadius: 90,
                    duration: 450
                }),
                Anim.floatingText(ctx.scene, {
                    xy: { x: recipient.container.x, y: recipient.container.y - 60 },
                    text: "Braced",
                    color: "#66ccff",
                    duration: 600
                })
            ]);
        };
    }
}
