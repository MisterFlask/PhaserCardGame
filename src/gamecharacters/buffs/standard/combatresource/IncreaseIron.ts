import { BaseCharacter } from "../../../BaseCharacter";
import { AbstractBuff } from "../../AbstractBuff";

export class IncreaseIron extends AbstractBuff {
    constructor() {
        super();
        this.stackable = true;
        this.isDebuff = false;
    }

    getName(): string {
        return "Increase Iron";
    }

    getDescription(): string {
        return `When played, gain ${this.getStacksDisplayText()} Iron.`;
    }

    public onThisCardInvoked(target?: BaseCharacter): void {
        this.actionManager.modifyIron(this.stacks);
    }
} 