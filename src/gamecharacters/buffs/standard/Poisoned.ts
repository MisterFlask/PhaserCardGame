import { ActionManager } from "../../../utils/ActionManager";
import { AbstractBuff } from "../AbstractBuff";

export class Poisoned extends AbstractBuff {
    override getDisplayName(): string {
        return "Poisoned";
    }

    override getDescription(): string {
        return `At the end of turn, lose ${this.getStacksDisplayText()} HP, then halve the stacks (round down).  Creature deals 2 less damage.`;
    }

    constructor(stacks: number = 1) {
        super();
        this.imageName = "poison-bottle"; // Replace with actual icon name
        this.stacks = stacks;
        this.stackable = true;
    }
    override onTurnEnd(): void {
        const owner = this.getOwnerAsCharacter();
        if (owner) {
            // Apply poison damage
            ActionManager.getInstance().dealDamage({ baseDamageAmount: this.stacks, target: owner, fromAttack: false });
            console.log(`${owner.name} took ${this.stacks} poison damage`);

            // Halve the poison stacks, rounding down
            this.stacks = Math.floor(this.stacks / 2);
        }
    }


    override getCombatDamageDealtModifier(): number {
        return -2;
    }
}
