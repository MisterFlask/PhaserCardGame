import { AbstractCard, TargetingType } from "../../../../AbstractCard";
import { BaseCharacter } from "../../../../BaseCharacter";
import { ExhaustBuff } from "../../../../buffs/playable_card/ExhaustBuff";
import { EntityRarity, PlayableCard } from "../../../../PlayableCard";
import { CardType } from "../../../../Primitives";

export class TakeCover extends PlayableCard {
    constructor() {
        super({
            name: "Take Cover",
            cardType: CardType.SKILL,
            targetingType: TargetingType.ALLY,
            rarity: EntityRarity.COMMON,
        });
        this.baseBlock = 4;
        this.baseEnergyCost = 0;
        this.buffs.push(new ExhaustBuff());
        this.resourceScalings.push({
            resource: this.mettle,
            blockScaling: 1,
        });
    }

    override InvokeCardEffects(targetCard?: AbstractCard): void {
        this.applyBlockToTarget(targetCard! as BaseCharacter);
    }

    override get description(): string {
        return `Apply ${this.getDisplayedBlock()} Block.  Exhaust.`;
    }
}
