
import { AbstractBuff } from "../AbstractBuff";
import { Lethality } from "./Strong";

export class GrowingPowerBuff extends AbstractBuff {
    constructor(stacks: number = 1) {
        super();
        this.stacks = stacks;
        this.isDebuff = false;
    }

    override getName(): string {
        return "Growing Power";
    }

    override getDescription(): string {
        return `At the beginning of each turn, gain ${this.getStacksDisplayText()} Strength.`;
    }


    override onTurnStart(): void {
        const owner = this.getOwnerAsCharacter();
        if (owner) {
            this.actionManager.applyBuffToCharacterOrCard(owner, new Lethality(this.stacks));
        }
    }   
}
