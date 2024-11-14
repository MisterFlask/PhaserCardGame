import { AbstractBuff } from "../AbstractBuff";

export class Light extends AbstractBuff {
    constructor(stacks: number = 1) {
        super();
        this.stacks = stacks;
    }

    getName(): string {
        return "Light";
    }

    getDescription(): string {
        return `When drawn: draw an additional card.  Can happen ${this.getStacksDisplayText()} more times.`;
    }

    override onCardDrawn(): void {
        // apply Draw One More Card to the owner of the card
        this.actionManager.drawCards(1)
        this.stacks--
    }
}
