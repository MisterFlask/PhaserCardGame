import { AbstractCard, TargetingType } from "../../../../AbstractCard";
import { CardRarity, PlayableCard } from "../../../../PlayableCard";
import { CardType } from "../../../../Primitives";

export class Bolster extends PlayableCard {
    constructor() {
        super({
            name: "Bolster",
            cardType: CardType.SKILL,
            targetingType: TargetingType.NO_TARGETING,
            rarity: CardRarity.COMMON,
        });
        this.baseBlock = 5;
        this.energyCost = 1;
        this.resourceScalings.push({
            resource: this.pluck,
            blockScaling: 1,
        });
    }

    override InvokeCardEffects(targetCard?: AbstractCard): void {
        this.forEachAlly(ally => {
            this.applyBlockToTarget(ally);
        });
    }

    override get description(): string {
        return `Apply ${this.getDisplayedBlock()} Block to all allies.`;
    }
}
