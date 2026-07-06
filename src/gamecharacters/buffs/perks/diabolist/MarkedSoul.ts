import { AbstractBuff } from "../../AbstractBuff";
import { Lethality } from "../../standard/Lethality";

/**
 * Diabolist perk. Combat-start self-Lethality grant, same proven shape as
 * perks/blackhand/PowderTemper.ts.
 */
export class MarkedSoul extends AbstractBuff {
    constructor(stacks: number = 1) {
        super();
        this.stacks = stacks;
        this.isDebuff = false;
        this.isPersistentBetweenCombats = true;
        this.isPersonaTrait = true;
    }

    override getDisplayName(): string {
        return "Marked Soul";
    }

    override getDescription(): string {
        return `At the start of combat, gain ${this.getStacksDisplayText()} Lethality. The Tunnel left a mark on this one; it shows in the ledger, and in the wound count.`;
    }

    override onCombatStart(): void {
        const owner = this.getOwnerAsCharacter();
        if (owner) {
            this.actionManager.applyBuffToCharacter(owner, new Lethality(this.stacks));
        }
    }
}
