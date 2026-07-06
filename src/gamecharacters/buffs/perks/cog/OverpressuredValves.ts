import { AbstractBuff } from "../../AbstractBuff";
import { Buster } from "../../playable_card/Buster";

/**
 * Cog perk. Combat-start self-Buster grant, same proven shape as
 * persona/GiantKiller.ts / perks/blackhand/ScorchedEarthDoctrine.ts.
 */
export class OverpressuredValves extends AbstractBuff {
    constructor(stacks: number = 1) {
        super();
        this.stacks = stacks;
        this.isDebuff = false;
        this.isPersistentBetweenCombats = true;
        this.isPersonaTrait = true;
    }

    override getDisplayName(): string {
        return "Overpressured Valves";
    }

    override getDescription(): string {
        return `At the start of combat, gain ${this.getStacksDisplayText()} Buster. Safety margins are a peacetime luxury.`;
    }

    override onCombatStart(): void {
        const owner = this.getOwnerAsCharacter();
        if (owner) {
            this.actionManager.applyBuffToCharacter(owner, new Buster(this.stacks));
        }
    }
}
