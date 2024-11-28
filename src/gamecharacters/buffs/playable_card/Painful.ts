import { BaseCharacter } from "../../BaseCharacter";
import { AbstractBuff } from "../AbstractBuff";

export class Painful extends AbstractBuff {
    constructor(stacks: number = 1) {
        super();
        this.stacks = stacks;
        this.isDebuff = true;
    }

    override getDisplayName(): string {
        return "Painful";
    }

    override getDescription(): string {
        return `When played, this card deals ${this.getStacksDisplayText()} damage to you.`;
    }

    override onThisCardInvoked(target?: BaseCharacter): void {
        // get owner card
        // then get that card's owner as character
        const ownerCard = this.getOwnerAsPlayableCard();
        if (ownerCard === null) {
            return;
        }
        const ownerAsCharacter = ownerCard.owner;
        if (!ownerAsCharacter) {
            return;
        }
        this.actionManager.dealDamage({ baseDamageAmount: this.stacks, target: ownerAsCharacter! });
    }
}
