import { AbstractBuff } from "../AbstractBuff";

export class Scholar extends AbstractBuff {
    constructor(stacks: number = 1) {
        super();
        this.stacks = stacks;
        this.isDebuff = false;
        this.isPersistentBetweenCombats = true;
        this.isPersonaTrait = true;
    }

    override getName(): string {
        return "Scholar";
    }

    override getDescription(): string {
        return `At the start of combat, gain ${this.getStacksDisplayText()} Pages.`;
    }

    override onCombatStart(): void {
        this.combatState.combatResources.modifyPages(this.stacks);
    }
}