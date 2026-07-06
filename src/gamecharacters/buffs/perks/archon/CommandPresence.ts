import { AbstractBuff } from "../../AbstractBuff";

/**
 * Archon perk. Combat-start resource grant, same proven shape as Badass
 * (persona/Badass.ts): a level-up reward, so fixed at 1 stack rather than
 * player-scaled.
 */
export class CommandPresence extends AbstractBuff {
    constructor(stacks: number = 1) {
        super();
        this.stacks = stacks;
        this.isDebuff = false;
        this.isPersistentBetweenCombats = true;
        this.isPersonaTrait = true;
    }

    override getDisplayName(): string {
        return "Command Presence";
    }

    override getDescription(): string {
        return `At the start of combat, gain ${this.getStacksDisplayText()} Mettle. The Company expects officers to steady the ranks before the shooting starts.`;
    }

    override onCombatStart(): void {
        this.combatState.combatResources.modifyMettle(this.stacks);
    }
}
