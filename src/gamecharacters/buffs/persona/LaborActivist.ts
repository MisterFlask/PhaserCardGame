import { AbstractBuff } from "../AbstractBuff";

export class LaborActivist extends AbstractBuff {
    constructor(stacks: number = 1) {
        super();
        this.stacks = stacks;
        this.isDebuff = false;
        this.isPersistentBetweenCombats = true;
        this.isPersonaTrait = true;
    }

    override getDisplayName(): string {
        return "Labor Activist";
    }

    override getDescription(): string {
        return `You treat diplomatic events as though you had +${this.getStacksDisplayText()} affinity for the Stoker's Union. TODO IMPLEMENT`;
    }
}
