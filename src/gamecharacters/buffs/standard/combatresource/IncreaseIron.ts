import { BaseCharacter } from "../../../BaseCharacter";
import { AbstractBuff } from "../../AbstractBuff";

export class IncreaseIron extends AbstractBuff {
    constructor() {
        super();
        this.stackable = true;
        this.isDebuff = false;
    }

    getName(): string {
        return "Increase Mettle";
    }

    getDescription(): string {
        return `When played, gain ${this.getStacksDisplayText()} Mettle.`;
    }

    public onThisCardInvoked(target?: BaseCharacter): void {
        this.actionManager.modifyIron(this.stacks);
    }
} 