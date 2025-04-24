import { TargetingType } from "../AbstractCard";
import { HellSellValue } from "../buffs/standard/HellSellValue";
import { EntityRarity } from "../EntityRarity";
import { PlayableCard } from "../PlayableCard";
import { CardType } from "../Primitives";

export class OpiumCargo extends PlayableCard {
    constructor() {
        super({
            name: "Opium Cargo",
            cardType: CardType.ITEM,
            targetingType: TargetingType.NO_TARGETING,
            rarity: EntityRarity.COMMON,
        });
        this.baseEnergyCost = 2;
        this.surfacePurchaseValue = 40;
        this.hellPurchaseValue = 60;
        this.buffs.push(new HellSellValue(150));   
    }

    override get description(): string {
        return `Draw 2 cards.`;
    }

    override InvokeCardEffects(): void {
        this.actionManager.drawCards(2);
    }
}
