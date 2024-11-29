import type { AbstractCard } from "../../AbstractCard";
import { AbstractBuff, BuffApplicationResult } from "../AbstractBuff";
import { Stress } from "./Stress";

export class Fearless extends AbstractBuff {
    constructor(stacks: number = 1) {
        super();
        this.imageName = "fearless";
        this.stackable = true;
        this.isDebuff = false;
        this.stacks = stacks;
    }

    override getDisplayName(): string {
        return "Fearless";
    }

    override getDescription(): string {
        return `Absorbs the next ${this.getStacksDisplayText()} stack${this.stacks > 1 ? 's' : ''} of Stress applied.`;
    }

    override interceptBuffApplication(character: AbstractCard, buffApplied: AbstractBuff, previousStacks: number, changeInStacks: number): BuffApplicationResult {
        if (buffApplied instanceof Stress && changeInStacks > 0) {
            const absorbedStacks = Math.min(this.stacks, changeInStacks);
            this.stacks -= absorbedStacks;
            const remainingStacks = changeInStacks - absorbedStacks;
            
            return { 
                logicTriggered: true, 
                newChangeInStacks: remainingStacks 
            };
        }
        return { logicTriggered: false, newChangeInStacks: changeInStacks };
    }
}
