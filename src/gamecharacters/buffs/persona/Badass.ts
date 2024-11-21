import { AbstractBuff } from "../AbstractBuff";

export class Badass extends AbstractBuff {
    constructor(stacks: number = 1) {
        super();
        this.stacks = stacks;
        this.isDebuff = false;
        this.isPersistentBetweenCombats = true;
        this.isPersonaTrait = true;
    }

    override getName(): string {
        return "Badass";
    }

    override getDescription(): string {
        return `At the start of combat, gain ${this.getStacksDisplayText()} Mettle.`;
    }

    override onCombatStart(): void {
        this.combatState.combatResources.modifyMettle(this.stacks);
    }
} 