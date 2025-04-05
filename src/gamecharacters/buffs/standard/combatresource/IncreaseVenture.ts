import { TextGlyphs } from "../../../../text/TextGlyphs";
import { BaseCharacter } from "../../../BaseCharacter";
import { AbstractBuff } from "../../AbstractBuff";

export class IncreaseVenture extends AbstractBuff {
    constructor(stacks: number = 1) {
        super();
        this.stackable = true;
        this.isDebuff = false;
    }

    getDisplayName(): string {
        return "Increase Venture";
    }

    getDescription(): string {
        return `When played, gain ${this.getStacksDisplayText()} ${TextGlyphs.getInstance().ventureIcon}.`;
    }

    public onThisCardInvoked(target?: BaseCharacter): void {
        this.actionManager.modifyVenture(this.stacks);
    }
} 