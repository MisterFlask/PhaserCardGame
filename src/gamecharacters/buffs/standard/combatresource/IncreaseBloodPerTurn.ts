import { TextGlyphs } from "../../../../text/TextGlyphs";
import { BaseCharacter } from "../../../BaseCharacter";
import { AbstractBuff } from "../../AbstractBuff";

export class IncreaseBloodPerTurn extends AbstractBuff {
    constructor() {
        super();
        this.stackable = true;
        this.isDebuff = false;
    }

    getDisplayName(): string {
        return "Blood Generation";
    }

    getDescription(): string {
        return `At the start of your turn, gain ${this.getStacksDisplayText()} ${TextGlyphs.getInstance().bloodIcon}.`;
    }

    public onStartTurn(target?: BaseCharacter): void {
        this.actionManager.modifyBlood(this.stacks);
    }
} 