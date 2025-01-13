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

    override getDisplayName(): string {
        return "Robotic";
    }

    override getDescription(): string {
        return `Negates every other debuff applied.`;
    }

    override interceptBuffApplication(character: AbstractCard, buffApplied: AbstractBuff, previousStacks: number, changeInStacks: number): BuffApplicationResult {
        if (buffApplied.isDebuff && this.stacks > 0) {
            this.stacks--;
            return {
                logicTriggered: false,
                newChangeInStacks: 0
            }
        }
        return {
            logicTriggered: true,
            newChangeInStacks: changeInStacks
        }
    }
}
