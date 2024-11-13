import { TargetingType } from "../../../AbstractCard";
import { CardRarity, PlayableCard } from "../../../PlayableCard";
import { CardType } from "../../../Primitives";
import { HellSellValue } from "../../../buffs/standard/HellSellValue";
export class CoffeeCargo extends PlayableCard {
    constructor() {
        super({
            name: "Coffee Cargo",
            cardType: CardType.ITEM,
            targetingType: TargetingType.NO_TARGETING,
            rarity: CardRarity.COMMON,
        });
        this.energyCost = 0;
        this.buffs.push(new HellSellValue(50));
        this.surfacePurchaseValue = 50;
        this.hellPurchaseValue = 0;
    }

    override get description(): string {
        return `Draw 2 cards.  Decrease the HellSellValue of this card by 10.`;
    }

    override InvokeCardEffects(): void {
        this.actionManager.drawCards(2);    
        this.mirrorChangeToCanonicalCard((card) => {
            this.actionManager.applyBuffToCard(card, new HellSellValue(-10));
        });
    }
}
