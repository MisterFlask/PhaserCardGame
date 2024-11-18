import { AbstractCard } from "../../AbstractCard";
import { AbstractBuff, BuffApplicationResult } from "../AbstractBuff";

export class Robotic extends AbstractBuff {
    constructor(stacks: number = 1) {
        super();
        this.stacks = stacks;
        this.isDebuff = false;
        this.imageName = "robotic"; // Replace with actual icon name if available
        this.isPersonaTrait = true;
    }

    override getName(): string {
        return "Robotic";
    }

    override getDescription(): string {
        return `Negates all Burning or Poison applied.`;
    }

    override interceptBuffApplication(character: AbstractCard, buffApplied: AbstractBuff, previousStacks: number, changeInStacks: number): BuffApplicationResult {
        if (buffApplied.getName() === "Burning" || buffApplied.getName() === "Poison") {
            return { logicTriggered: true, newChangeInStacks: 0 };
        }
        return { logicTriggered: false, newChangeInStacks: changeInStacks };
    }
}
