import { AbstractBuff } from "../AbstractBuff";
import { Stress } from "./Stress";

export class Stressful extends AbstractBuff {
    constructor(stacks: number = 1) {
        super();
        this.imageName = "shattered-heart"; // Using same icon as Stress
        this.stacks = stacks;
        this.stackable = true;
        this.isDebuff = true;
    }

    override getName(): string {
        return "Stressful";
    }

    override getDescription(): string {
        return `When played, apply ${this.getStacksDisplayText()} Stress to ${this.getCardOwnerName()}.`;
    }

    override onThisCardInvoked(): void {
        const owner = this.getOwnerAsCharacter();
        if (owner) {
            this.actionManager.applyBuffToCharacterOrCard(owner, new Stress(this.stacks));
        }
    }
}
