import { AbstractBuff } from "../AbstractBuff";

export class Regeneration extends AbstractBuff {
    constructor(stacks: number = 1) {
        super();
        this.stacks = stacks;
        this.isDebuff = false;
        this.imageName = "healing";
    }

    getName(): string {
        return "Regeneration";
    }

    getDescription(): string {
        return `Heals ${this.getStacksDisplayText()} HP at the end of each turn.`;
    }

    override onTurnEnd_CharacterBuff(): void {
        const owner = this.getOwnerAsCharacter();
        if (owner) {
            this.actionManager.heal(owner, this.stacks);
        }
    }
}
