import { IBaseCharacter } from "../../IBaseCharacter";
import { AbstractBuff } from "../AbstractBuff";

export class Protective extends AbstractBuff {
    constructor(stacks: number = 1) {
        super();
        this.stacks = stacks;
        this.isDebuff = false;
        this.isPersistentBetweenCombats = true;
        this.isPersonaTrait = true;
    }

    override getName(): string {
        return "Protective";
    }

    override getDescription(): string {
        return `When dealing block to an ally (who is not the owner of this buff), the ally gains ${this.getStacksDisplayText()} more block.`;
    }

    override getBlockSentModifier(target: IBaseCharacter): number {
        const owner = this.getOwnerAsCharacter();
        if (owner && target !== owner) {
            const additionalBlock = this.stacks;
            this.actionManager.applyBlock({baseBlockValue: additionalBlock, blockTargetCharacter: target});
            return additionalBlock;
        }
        return 0;
    }
}
