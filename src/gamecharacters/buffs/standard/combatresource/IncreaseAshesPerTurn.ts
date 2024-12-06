import { TextGlyphs } from "../../../../text/TextGlyphs";
import { BaseCharacter } from "../../../BaseCharacter";
import { AbstractBuff } from "../../AbstractBuff";

export class IncreaseAshesPerTurn extends AbstractBuff {
    constructor() {
        super();
        this.stackable = true;
        this.isDebuff = false;
    }

    getDisplayName(): string {
        return "Ashes Generation";
    }

    getDescription(): string {
        return `At the start of your turn, gain ${this.getStacksDisplayText()} ${TextGlyphs.getInstance().ashesIcon}.`;
    }

    public onStartTurn(target?: BaseCharacter): void {
        this.actionManager.modifyAshes(this.stacks);
    }
} 