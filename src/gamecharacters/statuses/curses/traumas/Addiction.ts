import { TargetingType } from "../../../AbstractCard";
import { EntityRarity } from "../../../EntityRarity";
import { PlayableCard } from "../../../PlayableCard";
import { CardType } from "../../../Primitives";

export class Addiction extends PlayableCard {
    constructor() {
        super({
            name: "Addiction",
            cardType: CardType.STATUS,
            targetingType: TargetingType.NO_TARGETING,
            rarity: EntityRarity.SPECIAL,
        });
        this.baseEnergyCost = 0;
        this.portraitName = "addiction-curse";
    }

    override get description(): string {
        return "Draw 1 card.  Increase your Smog, Blood and Venture by 1. Permanently increase the cost of this card by 1.";
    }

    override InvokeCardEffects(): void {
        this.actionManager.drawCards(1);
        this.actionManager.modifySmog(1);
        this.actionManager.modifyBlood(1);
        this.actionManager.modifyVenture(1);

        this.baseEnergyCost += 1;
        const canonicalCard = this.getCanonicalCard();
        if (canonicalCard) {
            canonicalCard.baseEnergyCost += 1;
        }
    }
} 