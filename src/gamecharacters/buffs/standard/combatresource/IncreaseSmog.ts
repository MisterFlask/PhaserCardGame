import { TextGlyphs } from "../../../../text/TextGlyphs";
import { BaseCharacter } from "../../../BaseCharacter";
import { AbstractBuff } from "../../AbstractBuff";

export class IncreaseSmog extends AbstractBuff {
    constructor(stacks: number = 1) {
        super();
        this.stackable = true;
        this.isDebuff = false;
    }

    getName(): string {
        return "Increase Smog";
    }

    getDescription(): string {
        return `When played, gain ${this.getStacksDisplayText()} ${TextGlyphs.getInstance().smogIcon}.`;
    }

    public onThisCardInvoked(target?: BaseCharacter): void {
        this.actionManager.modifySmog(this.stacks);
    }
} 