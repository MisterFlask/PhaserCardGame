import { AbstractBuff } from "../AbstractBuff";
import { Weak } from "../standard/Weak";

export class BotchedTattoo extends AbstractBuff {
    constructor(stacks: number = 1) {
        super();
        this.stacks = stacks;
        this.isDebuff = false;
        this.isPersistentBetweenCombats = true;
        this.isPersonaTrait = true;
    }

    override getDisplayName(): string {
        return "Botched Tattoo";
    }

    override getDescription(): string {
        return `At the start of combat, gain ${this.getStacksDisplayText()} Weak.`;
    }

    override onCombatStart(): void {
        const owner = this.getOwnerAsCharacter();
        if (owner) {
            this.actionManager.applyBuffToCharacter(owner, new Weak(this.stacks));
        }
    }
}
