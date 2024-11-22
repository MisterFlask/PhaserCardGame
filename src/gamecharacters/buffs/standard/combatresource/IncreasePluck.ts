import { TextGlyphs } from "../../../../text/TextGlyphs";
import { BaseCharacter } from "../../../BaseCharacter";
import { AbstractBuff } from "../../AbstractBuff";

export class IncreasePluck extends AbstractBuff {
    constructor(stacks: number) {
        super();
        this.stackable = true;
        this.isDebuff = false;
        this.stacks = stacks;
    }

    getName(): string {
        return "Increase Pluck";
    }

    getDescription(): string {
        return `When played, gain ${this.getStacksDisplayText()} ${TextGlyphs.getInstance().pluckIcon}.`;
    }

    public onThisCardInvoked(target?: BaseCharacter): void {
        this.actionManager.modifyPluck(this.stacks);
    }
} 