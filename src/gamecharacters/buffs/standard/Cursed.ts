import { AbstractCard } from "../../AbstractCard";
import { AbstractBuff, BuffApplicationResult } from "../AbstractBuff";

export class Cursed extends AbstractBuff {
    constructor(stacks: number = 1) {
        super();
        this.imageName = "cursed";
        this.stackable = true;
        this.isDebuff = true;
        this.stacks = stacks;
    }

    override getDisplayName(): string {
        return "Cursed";
    }

    override getDescription(): string {
        return `Negates the next non-debuff buff applied, ${this.getStacksDisplayText()} times.`;
    }

    override interceptBuffApplication(character: AbstractCard, buffApplied: AbstractBuff, previousStacks: number, changeInStacks: number): BuffApplicationResult {
        if (changeInStacks > 0 && !buffApplied.isDebuff) {
            this.stacks--;
            return { logicTriggered: true, newChangeInStacks: 0 };
        }
        return { logicTriggered: false, newChangeInStacks: changeInStacks };
    }
}
