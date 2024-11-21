import { TextGlyphs } from "../../../../text/TextGlyphs";
import { BaseCharacter } from "../../../BaseCharacter";
import { AbstractBuff } from "../../AbstractBuff";

export class IncreaseBlood extends AbstractBuff {
    constructor() {
        super();
        this.stackable = true;
        this.isDebuff = false;
    }

    getName(): string {
        return "Increase Blood";
    }

    getDescription(): string {
        return `When played, gain ${this.getStacksDisplayText()} ${TextGlyphs.getInstance().bloodIcon}.`;
    }

    public onThisCardInvoked(target?: BaseCharacter): void {
        this.actionManager.modifyBlood(this.stacks);
    }
} 