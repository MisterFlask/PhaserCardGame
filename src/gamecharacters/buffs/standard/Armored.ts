import { AbstractBuff } from "../AbstractBuff";

export class Armored extends AbstractBuff {
    constructor(stacks: number = 1) {
        super(stacks);
        this.isDebuff = false;
        this.imageName = "armored"; // Make sure this image exists in your assets
    }

    getDisplayName(): string {
        return "Armored";
    }

    getDescription(): string {
        return `At the start of your turn, gain ${this.getStacksDisplayText()} Block.`;
    }

    onTurnStart(): void {
        if (this.stacks <= 0) return;
        
        const owner = this.getOwnerAsCharacter();
        if (!owner) return;

        this.actionManager.applyBlock({
            baseBlockValue: this.stacks,
            blockTargetCharacter: owner
        });
        this.pulseBuff();
    }
}