import { BaseCharacter } from "../../BaseCharacter";
import { AbstractBuff } from "../AbstractBuff";
    
export class Huntsman extends AbstractBuff {
    constructor(stacks: number = 1) {
        super();
        this.stacks = stacks;
        this.isDebuff = false;
        this.isPersistentBetweenCombats = true;
        this.isPersonaTrait = true;
    }

    override getDisplayName(): string {
        return "Huntsman";
    }

    override getDescription(): string {
        return `When you defeat an elite enemy, gain a Hunting Trophy. TODO: IMPLEMENT`;
    }

    override onFatal(killedUnit: BaseCharacter): void {
        //todo
    }
}
