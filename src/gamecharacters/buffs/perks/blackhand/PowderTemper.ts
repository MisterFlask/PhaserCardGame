import { AbstractBuff } from "../../AbstractBuff";
import { Lethality } from "../../standard/Lethality";

/**
 * Blackhand perk. Combat-start self-Lethality grant, same proven shape as
 * the resource/buff combat-start hooks (e.g. persona/GiantKiller.ts, which
 * grants Buster the same way).
 */
export class PowderTemper extends AbstractBuff {
    constructor(stacks: number = 1) {
        super();
        this.stacks = stacks;
        this.isDebuff = false;
        this.isPersistentBetweenCombats = true;
        this.isPersonaTrait = true;
    }

    override getDisplayName(): string {
        return "Powder Temper";
    }

    override getDescription(): string {
        return `At the start of combat, gain ${this.getStacksDisplayText()} Lethality. Handling this much accelerant does something to a person's disposition.`;
    }

    override onCombatStart(): void {
        const owner = this.getOwnerAsCharacter();
        if (owner) {
            this.actionManager.applyBuffToCharacter(owner, new Lethality(this.stacks));
        }
    }
}
