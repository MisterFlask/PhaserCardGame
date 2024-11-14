import { BaseCharacter } from "../../../BaseCharacter";
import { AbstractBuff } from "../../AbstractBuff";

export class IncreasePowder extends AbstractBuff {
    constructor() {
        super();
        this.stackable = true;
        this.isDebuff = false;
    }

    getName(): string {
        return "Increase Powder";
    }

    getDescription(): string {
        return `When played, gain ${this.getStacksDisplayText()} Powder.`;
    }

    public onThisCardInvoked(target?: BaseCharacter): void {
        this.actionManager.modifyPowder(this.stacks);
    }
} 