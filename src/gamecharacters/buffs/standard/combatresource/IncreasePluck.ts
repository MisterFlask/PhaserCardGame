import { BaseCharacter } from "../../../BaseCharacter";
import { AbstractBuff } from "../../AbstractBuff";

export class IncreasePluck extends AbstractBuff {
    constructor() {
        super();
        this.stackable = true;
        this.isDebuff = false;
    }

    getName(): string {
        return "Increase Pluck";
    }

    getDescription(): string {
        return `When played, gain ${this.getStacksDisplayText()} Pluck.`;
    }

    public onThisCardInvoked(target?: BaseCharacter): void {
        this.actionManager.modifyPluck(this.stacks);
    }
} 