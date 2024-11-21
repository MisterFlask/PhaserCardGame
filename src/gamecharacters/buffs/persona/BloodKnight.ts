import { AbstractBuff } from "../AbstractBuff";

export class BloodKnight extends AbstractBuff {
    constructor(stacks: number = 1) {
        super();
        this.stacks = stacks;
        this.isDebuff = false;
        this.isPersistentBetweenCombats = true;
        this.isPersonaTrait = true;
    }

    override getName(): string {
        return "Blood Knight";
    }

    override getDescription(): string {
        return `At the start of combat, gain ${this.getStacksDisplayText()} Blood.`;
    }

    override onCombatStart(): void {
        this.combatState.combatResources.modifyPowder(this.stacks);
    }
} 