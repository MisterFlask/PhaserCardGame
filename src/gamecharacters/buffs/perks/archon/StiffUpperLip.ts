import { AbstractBuff } from "../../AbstractBuff";
import { Fearless } from "../../standard/Fearless";

/**
 * Archon perk. Combat-start Fearless grant to self, same proven shape as
 * Courageous (persona/Courageous.ts).
 */
export class StiffUpperLip extends AbstractBuff {
    constructor(stacks: number = 1) {
        super();
        this.stacks = stacks;
        this.isDebuff = false;
        this.isPersistentBetweenCombats = true;
        this.isPersonaTrait = true;
    }

    override getDisplayName(): string {
        return "Stiff Upper Lip";
    }

    override getDescription(): string {
        return `At the start of combat, gain ${this.getStacksDisplayText()} Fearless. Whatever crawls out of the dark, one simply does not make a scene.`;
    }

    override onCombatStart(): void {
        const owner = this.getOwnerAsCharacter();
        if (owner) {
            this.actionManager.applyBuffToCharacterOrCard(owner, new Fearless(this.stacks));
        }
    }
}
