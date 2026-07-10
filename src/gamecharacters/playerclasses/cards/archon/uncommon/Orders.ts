import { AbstractCard, TargetingType } from "../../../../AbstractCard";
import { EntityRarity } from "../../../../EntityRarity";
import { PlayableCard } from "../../../../PlayableCard";
import { CardType } from "../../../../Primitives";

export class Orders extends PlayableCard {
    constructor() {
        super({
            name: "Orders",
            portraitName: "lightning-shout",
            cardType: CardType.SKILL,
            targetingType: TargetingType.NO_TARGETING,
            rarity: EntityRarity.UNCOMMON,
        });
        this.baseEnergyCost = 1;
        this.flavorText = "Delivered at volume, brooking no interpretation.";
    }

    override InvokeCardEffects(targetCard?: AbstractCard): void {
        // Draw 2 cards
        const drawnCards = this.actionManager.drawCards(3, (cards) =>{
            // Apply additional effects to drawn cards
            cards.forEach(card => {
                if (card.baseBlock > 0) {
                    card.baseBlock += 3;
                }
                if (card.baseDamage > 0) {
                    card.baseDamage += 3;
                }
            });
        });
    }

    override get description(): string {
        return `Draw 3 cards. If they gain Block, they gain 3 more Block. If they do Damage, they do 3 more Damage.`;
    }
}
