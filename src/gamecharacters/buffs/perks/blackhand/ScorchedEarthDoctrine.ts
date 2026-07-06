import { AbstractBuff } from "../../AbstractBuff";
import { Buster } from "../../playable_card/Buster";

/**
 * Blackhand perk. Combat-start self-Buster grant, same proven shape as
 * persona/GiantKiller.ts.
 */
export class ScorchedEarthDoctrine extends AbstractBuff {
    constructor(stacks: number = 1) {
        super();
        this.stacks = stacks;
        this.isDebuff = false;
        this.isPersistentBetweenCombats = true;
        this.isPersonaTrait = true;
    }

    override getDisplayName(): string {
        return "Scorched Earth Doctrine";
    }

    override getDescription(): string {
        return `At the start of combat, gain ${this.getStacksDisplayText()} Buster. Company policy: if it is still standing, it has not yet been sufficiently addressed.`;
    }

    override onCombatStart(): void {
        const owner = this.getOwnerAsCharacter();
        if (owner) {
            this.actionManager.applyBuffToCharacter(owner, new Buster(this.stacks));
        }
    }
}
