import { BaseCharacter } from "../../../BaseCharacter";
import { AbstractBuff } from "../../AbstractBuff";

export class IncreaseVenture extends AbstractBuff {
    constructor() {
        super();
        this.stackable = true;
        this.isDebuff = false;
    }

    getName(): string {
        return "Increase Venture";
    }

    getDescription(): string {
        return `When played, gain ${this.getStacksDisplayText()} Venture.`;
    }

    public onThisCardInvoked(target?: BaseCharacter): void {
        this.actionManager.modifyVenture(this.stacks);
    }
} 