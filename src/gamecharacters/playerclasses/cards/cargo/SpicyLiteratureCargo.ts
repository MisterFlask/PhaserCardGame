import { TargetingType } from "../../../AbstractCard";
import { HellSellValue } from "../../../buffs/standard/HellSellValue";
import { CardRarity, PlayableCard } from "../../../PlayableCard";
import { CardType } from "../../../Primitives";

export class SpicyLiteratureCargo extends PlayableCard {
    constructor() {
        super({
            name: "Spicy Literature Cargo",
            cardType: CardType.ITEM,
            targetingType: TargetingType.NO_TARGETING,
            rarity: CardRarity.COMMON,
        });
        this.energyCost = 1;
        this.surfacePurchaseValue = 20;
        this.hellPurchaseValue = 40;
        this.buffs.push(new HellSellValue(55));   
    }

    override get description(): string {
        return `Draw a card.`;
    }

    override InvokeCardEffects(): void {
        this.actionManager.drawCards(1);
    }
}
