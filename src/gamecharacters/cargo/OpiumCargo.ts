import { TargetingType } from "../AbstractCard";
import { HellSellValue } from "../buffs/standard/HellSellValue";
import { EntityRarity } from "../EntityRarity";
import { PlayableCard } from "../PlayableCard";
import { CardType } from "../Primitives";
import { Addiction } from "../statuses/curses/traumas/Addiction";

export class OpiumCargo extends PlayableCard {
    constructor() {
        super({
            name: "Opium Cargo",
            cardType: CardType.ITEM,
            targetingType: TargetingType.NO_TARGETING,
            rarity: EntityRarity.COMMON,
        });
        this.baseEnergyCost = 0;
        this.surfacePurchaseValue = 40;
        this.hellPurchaseValue = 160;
        this.buffs.push(new HellSellValue(150));
    }

    override get description(): string {
        return `Draw 2 cards and increase your Smog, Blood and Venture by 1, then exhaust.  There is a 25% chance of giving yourself the Addiction curse.`;
    }

    override InvokeCardEffects(): void {
        this.actionManager.drawCards(2);
        this.actionManager.modifySmog(1);
        this.actionManager.modifyBlood(1);
        this.actionManager.modifyVenture(1);

        // 25% chance to add Addiction curse
        if (Math.random() < 0.25) {
            const addiction = new Addiction();
            this.actionManager.addCardToMasterDeck(addiction);
        }
    }
}
