import { TextGlyphs } from "../../../../text/TextGlyphs";
import { BaseCharacter } from "../../../BaseCharacter";
import { AbstractBuff } from "../../AbstractBuff";

export class IncreaseSmogPerTurn extends AbstractBuff {
    constructor() {
        super();
        this.stackable = true;
        this.isDebuff = false;
    }

    getDisplayName(): string {
        return "Smog Generation";
    }

    getDescription(): string {
        return `At the start of your turn, gain ${this.getStacksDisplayText()} ${TextGlyphs.getInstance().smogIcon}.`;
    }

    public onStartTurn(target?: BaseCharacter): void {
        this.actionManager.modifySmog(this.stacks);
    }
} 