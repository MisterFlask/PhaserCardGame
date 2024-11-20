import { IBaseCharacter } from "../../IBaseCharacter";
import { AbstractBuff } from "../AbstractBuff";
import { Titan } from "./Titan";

export class GiantKiller extends AbstractBuff {
    constructor(stacks: number = 1) {
        super();
        this.stacks = stacks;
        this.stackable = true;
        this.imageName = "giant-axe"; // Replace with actual icon name if available
    }

    override getName(): string {
        return "Giant Killer";
    }

    override getDescription(): string {
        return `Increases damage dealt to enemies with Titan by 50% × ${this.getStacksDisplayText()}.`;
    }

    override getAdditionalPercentCombatDamageDealtModifier(target?: IBaseCharacter): number {
        if (target && target.buffs.some(buff => buff instanceof Titan)) {
            return 50 * this.stacks;
        }
        return 0;
    }
}
