import { AbstractBuff } from "../AbstractBuff";
import { ActionManager } from "../../../utils/ActionManager";

export class Decaying extends AbstractBuff {
    constructor(stacks: number = 1) {
        super();
        this.stacks = stacks;
        this.isDebuff = true;
        this.imageName = "decay";
    }

    override getDisplayName(): string {
        return "Decaying";
    }

    override getDescription(): string {
        return `Lose ${this.getStacksDisplayText()} HP at end of turn (ignores block).`;
    }

    override onTurnEnd(): void {
        const owner = this.getOwnerAsCharacter();
        if (owner) {
            ActionManager.getInstance().dealDamage({ baseDamageAmount: this.stacks, target: owner, fromAttack: false, ignoresBlock: true });
        }
    }
}
