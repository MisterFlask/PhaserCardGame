import { ActionManager } from '../../../utils/ActionManager';
import { AbstractBuff } from '../AbstractBuff';
import { Stress } from './Stress';

export class Tense extends AbstractBuff {
    constructor(stacks: number = 1) {
        super();
        this.imageName = "tense";
        this.stackable = true;
        this.isDebuff = true;
        this.stacks = stacks;
    }

    override getName(): string {
        return "Tense";
    }

    override getDescription(): string {
        return `Each turn, if your stress is less than ${this.getStacksDisplayText()}, increase it to ${this.getStacksDisplayText()}.`;
    }

    override onTurnStart(): void {
        const currentStress = this.getOwnerAsCharacter()?.getBuffStacks(new Stress().getName());
        if (currentStress && currentStress < this.stacks) {
            const stressToAdd = this.stacks - currentStress;
            ActionManager.getInstance().applyBuffToCharacter(this.getOwnerAsCharacter()!,       new Stress(stressToAdd));
        }
    }
}
