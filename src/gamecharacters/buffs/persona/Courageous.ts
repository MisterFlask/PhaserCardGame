import { AbstractBuff } from "../AbstractBuff";
import { Fearless } from "../standard/Fearless";

export class Courageous extends AbstractBuff {
    constructor(stacks: number = 1) {
        super();
        this.stacks = stacks;
        this.isDebuff = false;
        this.isPersistentBetweenCombats = true;
        this.isPersonaTrait = true;
    }

    override getDisplayName(): string {
        return "Courageous";
    }

    override getDescription(): string {
        return `At the start of combat, gain ${this.getStacksDisplayText()} Fearless.`;
    }

    override onCombatStart(): void {
        const owner = this.getOwnerAsCharacter();
        if (owner) {
            this.actionManager.applyBuffToCharacterOrCard(owner, new Fearless(this.stacks));
        }
    }

}
