import { AbstractBuff } from "../AbstractBuff";

export class LimitedUses extends AbstractBuff {

    constructor(maxUses: number) {
        super();
        this.isDebuff = true;
        this.stacks = maxUses;
    }

    override getDisplayName(): string {
        return "Limited Uses";
    }

    override getDescription(): string {
        return `After being used ${this.stacks} times in a combat, this card is exhausted.`;
    }

    override onThisCardInvoked(): void {
        this.stacks--;
        if (this.stacks <= 0) {
            const ownerCard = this.getOwnerAsPlayableCard();
            if (ownerCard) {
                this.actionManager.exhaustCard(ownerCard);
            }
        }
    }
}
