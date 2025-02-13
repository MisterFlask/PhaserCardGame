import { AbstractBuff } from "../AbstractBuff";
import { Lethality } from "./Lethality";

export class NextTurnLethality extends AbstractBuff {
    constructor(stacks: number = 1) {
        super();
        this.stacks = stacks;
        this.isDebuff = false;
    }

    override getDisplayName(): string {
        return "Next Turn Lethality";
    }

    override getDescription(): string {
        return `At the start of your next turn, gain ${this.getStacksDisplayText()} Lethality.`;
    }

    override onTurnStart(): void {
        const owner = this.getOwnerAsCharacter();
        if (owner) {
            this.actionManager.applyBuffToCharacterOrCard(owner, new Lethality(this.stacks));
            this.stacks = 0;
        }
    }
}
