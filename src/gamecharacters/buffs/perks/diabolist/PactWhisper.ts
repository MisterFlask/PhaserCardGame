import { AbstractBuff } from "../../AbstractBuff";

/**
 * Diabolist perk. Combat-start resource grant, same proven shape as
 * persona/BloodKnight.ts.
 */
export class PactWhisper extends AbstractBuff {
    constructor(stacks: number = 1) {
        super();
        this.stacks = stacks;
        this.isDebuff = false;
        this.isPersistentBetweenCombats = true;
        this.isPersonaTrait = true;
    }

    override getDisplayName(): string {
        return "Pact Whisper";
    }

    override getDescription(): string {
        return `At the start of combat, gain ${this.getStacksDisplayText()} Blood. Something on the other side of the Ontology Tunnel is always willing to lend a little.`;
    }

    override onCombatStart(): void {
        this.combatState.combatResources.modifyBlood(this.stacks);
    }
}
