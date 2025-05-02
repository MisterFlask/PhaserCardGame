import { TargetingType } from "../AbstractCard";
import { EntityRarity } from "../EntityRarity";
import { PlayableCard } from "../PlayableCard";
import { CardType } from "../Primitives";
import { HellSellValue } from "../buffs/standard/HellSellValue";
export class CoffeeCargo extends PlayableCard {
    constructor() {
        super({
            name: "Coffee Cargo",
            cardType: CardType.ITEM,
            targetingType: TargetingType.NO_TARGETING,
            rarity: EntityRarity.COMMON,
        });
        this.baseEnergyCost = 1;
        this.buffs.push(new HellSellValue(60));
        this.surfacePurchaseValue = 50;
        this.hellPurchaseValue = 0;
    }

    override get description(): string {
        return `Draw 2 cards if Hell Sell Value is 10 or more.  Decrease the Hell Sell Value of this card by 10.`;
    }

    override InvokeCardEffects(): void {
        
        // If hell sell value drops to 0 or below, remove from deck and exhaust
        const hellSellValue = this.getBuffStacks("HELL_SELL_VALUE");
        if (hellSellValue <= 9) {
            console.log("Coffee Cargo is now non-playable due to HellSellValue being 9 or below");
            return;
        }

        this.actionManager.drawCards(2);    
        this.mirrorChangeToCanonicalCard((card) => {
            this.actionManager.applyBuffToCard(card, new HellSellValue(-10));
        });

    }
}
