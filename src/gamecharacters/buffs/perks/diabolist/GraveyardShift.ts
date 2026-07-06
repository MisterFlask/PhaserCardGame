import { AbstractBuff } from "../../AbstractBuff";

/**
 * Diabolist perk. Combat-start resource grant, same proven shape as
 * persona/Scholar.ts.
 */
export class GraveyardShift extends AbstractBuff {
    constructor(stacks: number = 1) {
        super();
        this.stacks = stacks;
        this.isDebuff = false;
        this.isPersistentBetweenCombats = true;
        this.isPersonaTrait = true;
    }

    override getDisplayName(): string {
        return "Graveyard Shift";
    }

    override getDescription(): string {
        return `At the start of combat, gain ${this.getStacksDisplayText()} Ashes. Extracurricular research, technically off the clock.`;
    }

    override onCombatStart(): void {
        this.combatState.combatResources.modifyAshes(this.stacks);
    }
}
