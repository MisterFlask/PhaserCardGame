import { BaseCharacter } from "../../../BaseCharacter";
import { AbstractBuff } from "../../AbstractBuff";

export class IncreaseSmog extends AbstractBuff {
    constructor() {
        super();
        this.stackable = true;
        this.isDebuff = false;
    }

    getName(): string {
        return "Increase Smog";
    }

    getDescription(): string {
        return `When played, gain ${this.getStacksDisplayText()} Smog.`;
    }

    public onThisCardInvoked(target?: BaseCharacter): void {
        this.actionManager.modifySmog(this.stacks);
    }
} 