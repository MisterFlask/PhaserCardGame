import { AbstractBuff } from "../AbstractBuff";

export class LimitedResource extends AbstractBuff {

    constructor(maxUses: number) {
        super();
        this.isDebuff = true;
        this.stacks = maxUses;
    }

    override getDisplayName(): string {
        return "Limited Resource";
    }

    override getDescription(): string {
        return `After being used ${this.stacks} more times, this card is purged from your deck.`;
    }

    override onThisCardInvoked(): void {
        this.stacks--;

        const ownerCard = this.getOwnerAsPlayableCard();
        if (ownerCard) {
            //todo: modify canonical card (card in master deck) to have less uses
        }

        if (this.stacks <= 0) {
            if (ownerCard) {
                ownerCard.owningCharacter?.removeCard(ownerCard);
                this.actionManager.exhaustCard(ownerCard);
            }
        }
    }
}
