import { TargetingType } from "../AbstractCard";
import { HellSellValue } from "../buffs/standard/HellSellValue";
import { EntityRarity } from "../EntityRarity";
import { PlayableCard } from "../PlayableCard";
import { CardType } from "../Primitives";

export class RevolutionaryLiteratureCargo extends PlayableCard {
    constructor() {
        super({
            name: "Revolutionary Literature Cargo",
            cardType: CardType.ITEM,
            targetingType: TargetingType.NO_TARGETING,
            rarity: EntityRarity.COMMON,
        });
        this.baseEnergyCost = 1;
        this.surfacePurchaseValue = 30;
        this.hellPurchaseValue = 50;
        this.buffs.push(new HellSellValue(120));   
    }

    override get description(): string {
        return `Draw a card.  Discard a card.`;
    }

    override InvokeCardEffects(): void {
        this.actionManager.drawCards(1);
        this.actionManager.chooseCardToDiscard(1, 1, false);
    }
} 