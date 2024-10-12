import { IBaseCharacter } from "../../IBaseCharacter";
import { AbstractBuff } from "../AbstractBuff";

export class Selfish extends AbstractBuff {
    constructor(stacks: number = 1) {
        super();
        this.stacks = stacks;
        this.isDebuff = false;
        this.isPersistentBetweenCombats = true;
        this.isPersonaTrait = true;
    }

    override getName(): string {
        return "Selfish";
    }

    override getDescription(): string {
        return `This character's cards apply ${this.getStacksDisplayText()} more block to the owner of this buff and ${this.getStacksDisplayText()} less block to all other characters.`;
    }

    override getBlockSentModifier(target: IBaseCharacter): number {
        const owner = this.getOwnerAsCharacter();
        if (owner && target === owner) {
            return this.stacks * 1;
        }else{
            return this.stacks * -1;
        }
    }
}
