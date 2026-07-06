import { AbstractBuff } from "../../AbstractBuff";

/**
 * Cog perk. Combat-start resource grant, same proven shape as
 * persona/Daring.ts (grants Pluck).
 */
export class SelfWindingMechanism extends AbstractBuff {
    constructor(stacks: number = 1) {
        super();
        this.stacks = stacks;
        this.isDebuff = false;
        this.isPersistentBetweenCombats = true;
        this.isPersonaTrait = true;
    }

    override getDisplayName(): string {
        return "Self-Winding Mechanism";
    }

    override getDescription(): string {
        return `At the start of combat, gain ${this.getStacksDisplayText()} Pluck. The clockwork winds itself; the operator merely takes the credit.`;
    }

    override onCombatStart(): void {
        this.combatState.combatResources.modifyPluck(this.stacks);
    }
}
