import { AbstractBuff } from "../../AbstractBuff";

/**
 * Blackhand perk. Combat-start resource grant, same proven shape as
 * persona/HeavySmoker.ts.
 */
export class HairTriggerNerves extends AbstractBuff {
    constructor(stacks: number = 1) {
        super();
        this.stacks = stacks;
        this.isDebuff = false;
        this.isPersistentBetweenCombats = true;
        this.isPersonaTrait = true;
    }

    override getDisplayName(): string {
        return "Hair-Trigger Nerves";
    }

    override getDescription(): string {
        return `At the start of combat, gain ${this.getStacksDisplayText()} Blood. The Company's incident reports describe this as "enthusiasm."`;
    }

    override onCombatStart(): void {
        this.combatState.combatResources.modifyBlood(this.stacks);
    }
}
