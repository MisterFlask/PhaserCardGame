import { AbstractCard, TargetingType } from "../../../../AbstractCard";
import { CardRarity, PlayableCard } from "../../../../PlayableCard";
import { CardType } from "../../../../Primitives";

export class TakeCover extends PlayableCard {
    constructor() {
        super({
            name: "Take Cover",
            cardType: CardType.SKILL,
            targetingType: TargetingType.NO_TARGETING,
            rarity: CardRarity.COMMON,
        });
        this.baseBlock = 4;
        this.energyCost = 0;
    }

    override InvokeCardEffects(targetCard?: AbstractCard): void {
        this.applyBlockToTarget(this.owner);
    }

    override get description(): string {
        return `Apply ${this.getDisplayedBlock()} Block.`;
    }
}
