import { AbstractBuff } from "../AbstractBuff";

export class Implacable extends AbstractBuff {
    constructor(stacks: number = 1) {
        super();
        this.stacks = stacks;
        this.stackable = true;
        this.imageName = "shield"; // Replace with actual icon name if available
    }

    override getDisplayName(): string {
        return "Implacable";
    }

    override getDescription(): string {
        return `At the start of turn, gain ${this.getStacksDisplayText()} Block.`;
    }

    override onTurnStart(): void {
        const owner = this.getOwnerAsCharacter();
        if (owner) {
            this.actionManager.applyBlock({
                baseBlockValue: this.stacks,
                blockTargetCharacter: owner
            });
        }
    }
}
