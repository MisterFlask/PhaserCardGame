import { AbstractBuff } from "../AbstractBuff";

export class Regeneration extends AbstractBuff {
    constructor(stacks: number = 1) {
        super();
        this.stacks = stacks;
        this.isDebuff = false;
        this.imageName = "regeneration";
        this.tint = 0x00FF00;
    }

    getDisplayName(): string {
        return "Regeneration";
    }

    getDescription(): string {
        return `Heals ${this.getStacksDisplayText()} HP at the end of each turn.`;
    }

    override onTurnEnd(): void {
        const owner = this.getOwnerAsCharacter();
        if (owner) {
            this.actionManager.heal(owner, this.stacks);
        }
    }
}
