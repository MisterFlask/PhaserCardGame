import { GameState } from "../../../rules/GameState";
import { ActionManager } from "../../../utils/ActionManager";
import { AbstractBuff } from "../AbstractBuff";

export class Burning extends AbstractBuff {
    private readonly baseDamage: number = 4;

    override getName(): string {
        return "Burning";
    }

    override getDescription(): string {
        const totalDamage = this.baseDamage + GameState.getInstance().combatState.combatResources.powder.value;
        return `At the end of turn, take ${totalDamage} damage for ${this.getStacksDisplayText()} turns. [damage increases with powder]`;
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
            const powderAmount = GameState.getInstance().combatState.combatResources.powder.value;
            const totalDamage = this.baseDamage + powderAmount;

            // Apply burning damage
            ActionManager.getInstance().dealDamage({ baseDamageAmount: totalDamage, target: owner, fromAttack: false });
            console.log(`${owner.name} took ${totalDamage} burning damage (${this.baseDamage} base + ${powderAmount} Powder)`);

            // Reduce stacks by 1
            this.stacks--;
        }
    }
}
