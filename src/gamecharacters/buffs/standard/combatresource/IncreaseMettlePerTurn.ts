import { TextGlyphs } from "../../../../text/TextGlyphs";
import { BaseCharacter } from "../../../BaseCharacter";
import { AbstractBuff } from "../../AbstractBuff";

export class IncreaseMettlePerTurn extends AbstractBuff {
    constructor() {
        super();
        this.stackable = true;
        this.isDebuff = false;
    }

    getDisplayName(): string {
        return "Mettle Generation";
    }

    getDescription(): string {
        return `At the start of your turn, gain ${this.getStacksDisplayText()} ${TextGlyphs.getInstance().mettleIcon}.`;
    }

    public onStartTurn(target?: BaseCharacter): void {
        this.actionManager.modifyMettle(this.stacks);
    }
} 