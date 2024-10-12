import { IBaseCharacter } from "../../IBaseCharacter";
import { AbstractBuff, BuffApplicationResult } from "../AbstractBuff";

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
    override interceptBuffApplication(character: IBaseCharacter, buffApplied: AbstractBuff, previousStacks: number, changeInStacks: number): BuffApplicationResult {
        if (changeInStacks > 0 && buffApplied.isDebuff) {
            this.stacks--;
            return { logicTriggered: true, newChangeInStacks: 0 };
        }
        return { logicTriggered: false, newChangeInStacks: changeInStacks };
    }
}
