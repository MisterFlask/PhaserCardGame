import { AbstractBuff } from "../AbstractBuff";

export class HeavySmoker extends AbstractBuff {
    constructor(stacks: number = 1) {
        super();
        this.stacks = stacks;
        this.isDebuff = false;
        this.isPersistentBetweenCombats = true;
        this.isPersonaTrait = true;
    }

    override getName(): string {
        return "Heavy Smoker";
    }

    override getDescription(): string {
        return `At the start of combat, gain ${this.getStacksDisplayText()} Smog.`;
    }

    override onCombatStart(): void {
        this.combatState.combatResources.modifySmog(this.stacks);
    }
} 