import { ActionManager } from "../../../utils/ActionManager";
import { AbstractBuff } from "../AbstractBuff";

export class Poison extends AbstractBuff {
    override getName(): string {
        return "Poison";
    }

    override getDescription(): string {
        return `At the end of turn, lose ${this.getStacksDisplayText()} HP, then multiple poison stacks by 1/3.  Creature deals 2 less damage.`;
    }

    constructor(stacks: number = 1) {
        super();
        this.imageName = "poison-bottle"; // Replace with actual icon name
        this.stacks = stacks;
        this.stackable = true;
    }
    override onTurnEnd_CharacterBuff(): void {
        const owner = this.getOwnerAsCharacter();
        if (owner) {
            // Apply poison damage
            ActionManager.getInstance().dealDamage({ baseDamageAmount: this.stacks, target: owner, fromAttack: false });
            console.log(`${owner.name} took ${this.stacks} poison damage`);

            // Halve the poison stacks, rounding down
            this.stacks = Math.floor(this.stacks / 3);
        }
    }


    override getCombatDamageDealtModifier(): number {
        return -2;
    }
}
