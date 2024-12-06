import { TextGlyphs } from "../../../../text/TextGlyphs";
import { BaseCharacter } from "../../../BaseCharacter";
import { AbstractBuff } from "../../AbstractBuff";

export class IncreasePluckPerTurn extends AbstractBuff {
    constructor(stacks: number) {
        super();
        this.stacks = stacks;
        this.stackable = true;
        this.isDebuff = false;
    }

    getDisplayName(): string {
        return "Pluck Generation";
    }

    getDescription(): string {
        return `At the start of your turn, gain ${this.getStacksDisplayText()} ${TextGlyphs.getInstance().pluckIcon}.`;
    }

    public onStartTurn(target?: BaseCharacter): void {
        this.actionManager.modifyPluck(this.stacks);
    }
} 