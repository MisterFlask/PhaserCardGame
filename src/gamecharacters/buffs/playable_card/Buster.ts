import { IBaseCharacter } from "../../IBaseCharacter";
import { AbstractBuff } from "../AbstractBuff";

export class Buster extends AbstractBuff {
    constructor(stacks: number = 1) {
        super();
        this.stacks = stacks;
        this.stackable = true;
        this.imageName = "giant-axe"; // Replace with actual icon name if available
    }

    override getDisplayName(): string {
        return "Buster";
    }

    override getDescription(): string {
        return `Increases damage dealt to enemies with block by 50% × ${this.getStacksDisplayText()}.`;
    }

    override getAdditionalPercentCombatDamageDealtModifier(target?: IBaseCharacter): number {
        if (target && target.block > 0) {
            return 50 * this.stacks;
        }
        return 0;
    }
}
