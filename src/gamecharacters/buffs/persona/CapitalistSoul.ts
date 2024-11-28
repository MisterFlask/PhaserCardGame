import { AbstractBuff } from "../AbstractBuff";

export class CapitalistSoul extends AbstractBuff {
    constructor(stacks: number = 1) {
        super();
        this.stacks = stacks;
        this.isDebuff = false;
        this.isPersistentBetweenCombats = true;
        this.isPersonaTrait = true;
    }

    override getDisplayName(): string {
        return "Capitalist Soul";
    }

    override getDescription(): string {
        return `At the start of combat, gain ${this.getStacksDisplayText()} Venture.`;
    }

    override onCombatStart(): void {
        this.combatState.combatResources.modifyVenture(this.stacks);
    }
} 