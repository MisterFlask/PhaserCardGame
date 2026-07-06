import { AbstractBuff } from "../../AbstractBuff";

/**
 * Blackhand perk. Combat-start resource grant, same proven shape as
 * persona/Scholar.ts (grants Ashes).
 */
export class ArsonistsInstinct extends AbstractBuff {
    constructor(stacks: number = 1) {
        super();
        this.stacks = stacks;
        this.isDebuff = false;
        this.isPersistentBetweenCombats = true;
        this.isPersonaTrait = true;
    }

    override getDisplayName(): string {
        return "Arsonist's Instinct";
    }

    override getDescription(): string {
        return `At the start of combat, gain ${this.getStacksDisplayText()} Ashes. A professional nose for what's about to catch.`;
    }

    override onCombatStart(): void {
        this.combatState.combatResources.modifyAshes(this.stacks);
    }
}
