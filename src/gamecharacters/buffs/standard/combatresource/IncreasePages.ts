import { BaseCharacter } from "../../../BaseCharacter";
import { AbstractBuff } from "../../AbstractBuff";

export class IncreasePages extends AbstractBuff {
    constructor() {
        super();
        this.stackable = true;
        this.isDebuff = false;
    }

    getName(): string {
        return "Increase Pages";
    }

    getDescription(): string {
        return `When card is played, gain ${this.getStacksDisplayText()} Pages.  Exhaust.`;
    }

    public onThisCardInvoked(target?: BaseCharacter): void {
        this.actionManager.modifyPages(this.stacks); 
        this.actionManager.exhaustCard(this.getOwnerAsPlayableCard()!);
    }
}
