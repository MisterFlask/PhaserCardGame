import { AbstractBuff } from "../AbstractBuff";
import { Buster } from "../playable_card/Buster";

export class GiantKiller extends AbstractBuff {
    constructor(stacks: number = 1) {
        super();
        this.stacks = stacks;
        this.isDebuff = false;
        this.isPersistentBetweenCombats = true;
        this.isPersonaTrait = true;
    }

    override getDisplayName(): string {
        return "Giant Killer";
    }

    override getDescription(): string {
        return `At the start of combat, gain ${this.getStacksDisplayText()} Buster.`;
    }

    override onCombatStart(): void {
        const owner = this.getOwnerAsCharacter();
        if (owner) {
            this.actionManager.applyBuffToCharacter(owner, new Buster(this.stacks));
        }
    }
}
