import { ActionManager } from "../../../utils/ActionManager";
import { AbstractBuff } from "../AbstractBuff";

export class Burning extends AbstractBuff {
    override getName(): string {
        return "Burning";
    }

    override getDescription(): string {
        return `At the end of turn, take ${this.getStacksDisplayText()} damage, then halve the burning stacks.`;
    }

    constructor(stacks: number = 1) {
        super();
        this.imageName = "burning-icon"; // Replace with actual icon name
        this.stacks = stacks;
        this.stackable = true;
    }
    
    override onTurnEnd_CharacterBuff(): void {
        const owner = this.getOwnerAsCharacter();
        if (owner) {
            // Apply burning damage
            ActionManager.getInstance().dealDamage({ baseDamageAmount: this.stacks, target: owner, fromAttack: false });
            console.log(`${owner.name} took ${this.stacks} burning damage`);

            // Halve the burning stacks, rounding down
            this.stacks = Math.floor(this.stacks / 2);
        }
    }

}
