import { TextGlyphs } from "../../../../../text/TextGlyphs";
import { AbstractBuff } from "../../../AbstractBuff";

export class DecreaseBloodOnRetain extends AbstractBuff {
    constructor() {
        super();
        this.isDebuff = true;
        this.stackable = true;
    }

    getDisplayName(): string {
        return "Bloodsucker";
    }

    getDescription(): string {
        return `When this card is retained, lose ${this.getStacksDisplayText()} ${TextGlyphs.getInstance().bloodIcon}.`;
    }

    override onInHandAtEndOfTurn(): void {
        this.actionManager.modifyBlood(-this.stacks);
    }
}
