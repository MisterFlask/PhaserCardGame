import { TextGlyphs } from "../../../../text/TextGlyphs";
import { BaseCharacter } from "../../../BaseCharacter";
import { AbstractBuff } from "../../AbstractBuff";

export class IncreasePages extends AbstractBuff {
    constructor() {
        super();
        this.stackable = true;
        this.isDebuff = false;
    }

    getDisplayName(): string {
        return "Increase Pages";
    }

    getDescription(): string {
        return `When card is played, gain ${this.getStacksDisplayText()} ${TextGlyphs.getInstance().pagesIcon}.  Exhaust.`;
    }

    public onThisCardInvoked(target?: BaseCharacter): void {
        this.actionManager.modifyAshes(this.stacks); 
        this.actionManager.exhaustCard(this.getOwnerAsPlayableCard()!);
    }
}
