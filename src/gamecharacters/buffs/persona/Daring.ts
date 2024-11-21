import { AbstractBuff } from "../AbstractBuff";

export class Daring extends AbstractBuff {
    constructor(stacks: number = 1) {
        super();
        this.stacks = stacks;
        this.isDebuff = false;
        this.isPersistentBetweenCombats = true;
        this.isPersonaTrait = true;
    }

    override getName(): string {
        return "Daring";
    }

    override getDescription(): string {
        return `At the start of combat, gain ${this.getStacksDisplayText()} Pluck.`;
    }

    override onCombatStart(): void {
        this.combatState.combatResources.modifyPluck(this.stacks);
    }
} 