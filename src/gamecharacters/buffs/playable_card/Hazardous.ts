import { IBaseCharacter } from "../../IBaseCharacter";
import { AbstractBuff } from "../AbstractBuff";

export class Hazardous extends AbstractBuff {
    constructor(stacks: number = 1) {
        super();
        this.isDebuff = true;
        this.stackable = true;
        this.stacks = stacks;
    }

    override getDisplayName(): string {
        return "Hazardous";
    }

    override getDescription(): string {
        return `At the end of turn, deal ${this.getStacksDisplayText()} damage to you.`;
    }

    override onInHandAtEndOfTurn(): void {
        const owner = this.getOwnerAsPlayableCard();
        if (owner?.owningCharacter) {
            this.actionManager.dealDamage({
                baseDamageAmount: this.stacks,
                target: owner.owningCharacter as IBaseCharacter,
                sourceCharacter: owner.owningCharacter,
                fromAttack: false,
                sourceCard: owner
            });
        }
    }
}