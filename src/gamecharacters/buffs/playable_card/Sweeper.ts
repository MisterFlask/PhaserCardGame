import { GameState } from "../../../rules/GameState";
import { AbstractBuff } from "../AbstractBuff";

export class Sweeper extends AbstractBuff {
    constructor(stacks: number = 1) {
        super();
        this.stacks = stacks;
        this.stackable = true;
        this.isDebuff = false;
    }

    override getDisplayName(): string {
        return "Sweeper";
    }

    override getDescription(): string {
        return `When played, this deals ${this.getStacksDisplayText()} damage to all enemies.`;
    }

    override onThisCardInvoked(): void {
        const gameState = GameState.getInstance();
        const combatState = gameState.combatState;

        // Deal damage to all enemies
        combatState.enemies.forEach(enemy => {
            this.actionManager.dealDamage({
                baseDamageAmount: this.stacks,
                target: enemy,
                sourceCharacter: this.getCardOwner() ?? undefined,
                fromAttack: false
            });
        });
    }
}
