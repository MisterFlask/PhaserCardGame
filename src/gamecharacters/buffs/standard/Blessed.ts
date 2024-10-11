import { IBaseCharacter } from "../../IBaseCharacter";
import { AbstractBuff } from "../AbstractBuff";

export class Blessed extends AbstractBuff {
    constructor(stacks: number = 1) {
        super();
        this.imageName = "blessed";
        this.stackable = true;
        this.isDebuff = false;
        this.stacks = stacks;
    }

    override getName(): string {
        return "Blessed";
    }

    override getDescription(): string {
        return `Negates the next ${this.getStacksDisplayText()} debuff${this.stacks > 1 ? 's' : ''} applied.`;
    }

    /// gets run AFTER buff is applied.
    override onBuffApplied(character: IBaseCharacter, buffApplied: AbstractBuff, previousStacks: number, changeInStacks: number) {
        if (changeInStacks > 0 && !buffApplied.isDebuff) {
            this.actionManager.removeBuffFromCharacter(character, buffApplied.id, buffApplied.stacks);
            this.stacks--;
        }
    }
}
