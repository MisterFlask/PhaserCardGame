import { IBaseCharacter } from "../../IBaseCharacter";
import { AbstractBuff } from "../AbstractBuff";

export class Cursed extends AbstractBuff {
    constructor(stacks: number = 1) {
        super();
        this.imageName = "cursed";
        this.stackable = true;
        this.isDebuff = true;
        this.stacks = stacks;
    }

    override getName(): string {
        return "Cursed";
    }

    override getDescription(): string {
        return `Negates the next ${this.getStacksDisplayText()} non-debuff buff${this.stacks > 1 ? 's' : ''} applied.`;
    }

    /// gets run AFTER buff is applied.
    override onBuffApplied(character: IBaseCharacter, buffApplied: AbstractBuff, previousStacks: number, changeInStacks: number) {
        if (changeInStacks > 0 && buffApplied.isDebuff) {
            this.actionManager.removeBuffFromCharacter(character, buffApplied.id, buffApplied.stacks);
            this.stacks--;
        }
    }
}
