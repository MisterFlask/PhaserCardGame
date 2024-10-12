import { BaseCharacter } from "../../BaseCharacter";
import { AbstractBuff } from "../AbstractBuff";
import { Stress } from "../standard/Stress";

export class Sadist extends AbstractBuff {
    constructor(stacks: number = 1) {
        super();
        this.stacks = stacks;
        this.isDebuff = false;
        this.isPersistentBetweenCombats = true;
        this.isPersonaTrait = true;
    }

    override getName(): string {
        return "Sadist";
    }

    override getDescription(): string {
        return `On killing an enemy, this character relieves ${this.getStacksDisplayText()} stress.`;
    }

    override onFatal(killedUnit: BaseCharacter): void {
        const owner = this.getOwnerAsCharacter();
        if (owner) {
           this.actionManager.removeBuffFromCharacter(owner, new Stress(1).getName(), this.stacks);
        }
    }
}
