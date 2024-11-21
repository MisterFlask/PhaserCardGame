import { AbstractBuff } from "../AbstractBuff";
import { Lethality } from "./Strong";

export class NextTurnStrength extends AbstractBuff {
    constructor(stacks: number = 1) {
        super();
        this.stacks = stacks;
        this.isDebuff = false;
    }

    override getName(): string {
        return "Next Turn Strength";
    }

    override getDescription(): string {
        return `At the start of your next turn, gain ${this.getStacksDisplayText()} Strength.`;
    }

    override onTurnStart(): void {
        const owner = this.getOwnerAsCharacter();
        if (owner) {
            this.actionManager.applyBuffToCharacterOrCard(owner, new Lethality(this.stacks));
            this.stacks = 0;
        }
    }
}
