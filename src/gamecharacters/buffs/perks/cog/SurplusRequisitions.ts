import { AbstractBuff } from "../../AbstractBuff";

/**
 * Cog perk. Combat-start resource grant, same proven shape as
 * persona/CapitalistSoul.ts (grants Venture).
 */
export class SurplusRequisitions extends AbstractBuff {
    constructor(stacks: number = 1) {
        super();
        this.stacks = stacks;
        this.isDebuff = false;
        this.isPersistentBetweenCombats = true;
        this.isPersonaTrait = true;
    }

    override getDisplayName(): string {
        return "Surplus Requisitions";
    }

    override getDescription(): string {
        return `At the start of combat, gain ${this.getStacksDisplayText()} Venture. Quartermaster's paperwork, filed in triplicate, somehow always in your favor.`;
    }

    override onCombatStart(): void {
        this.combatState.combatResources.modifyVenture(this.stacks);
    }
}
