/**
 * When drawn, discard a card at random.  Playable for 1; draw a card.
 */
import { TargetingType } from "../../AbstractCard";
import { EntityRarity } from "../../EntityRarity";
import { PlayableCard } from "../../PlayableCard";
import { CardType } from "../../Primitives";
import { AbstractBuff } from "../../buffs/AbstractBuff";

class DiscardRandomCardOnDrawnBuff extends AbstractBuff {
    constructor() {
        super();
        this.isDebuff = true;
        this.moveToMainDescription = true;
    }

    override getDisplayName(): string {
        return "Clumsy Effect";
    }

    override getDescription(): string {
        return "When drawn, discard a random card from your hand.";
    }

    override onCardDrawn(): void {
        this.actionManager.exhaustRandomCardInHand();
    }
}

export class Clumsy extends PlayableCard {
    constructor() {
        super({
            name: "Clumsy",
            cardType: CardType.SKILL,
            targetingType: TargetingType.NO_TARGETING,
            rarity: EntityRarity.COMMON,
        });
        this.baseEnergyCost = 1;
        this.buffs.push(new DiscardRandomCardOnDrawnBuff());
    }

    override get description(): string {
        return "When drawn, discard a random card. Draw a card.";
    }

    override InvokeCardEffects(): void {
        this.actionManager.drawCards(1);
    }
}