// at start of turn, all enemies flee with current HP lower than the current stacks of Intimidation.  This halves each turn.

import { AbstractBuff } from "../AbstractBuff";

export class Intimidation extends AbstractBuff {
    constructor(stacks: number = 1) {
        super();
        this.stacks = stacks;
        this.isDebuff = false;
        this.imageName = "intimidate";
    }

    override getDisplayName(): string {
        return "Intimidation";
    }

    override getDescription(): string {
        return `At the start of turn, enemies with HP lower than ${this.getStacksDisplayText()} flee. Stacks halve each turn.`;
    }

    override onTurnStart(): void {
        const gameState = this.gameState;
        const livingEnemies = gameState.combatState.enemies.filter(enemy => !enemy.isDead());

        // Check each enemy's HP and make them flee if below stacks
        livingEnemies.forEach(enemy => {
            if (enemy.hitpoints <= this.stacks) {
                enemy.hitpoints = 0; // This effectively makes them flee/die
            }
        });

        // Halve the stacks (round down)
        this.stacks = Math.floor(this.stacks / 2);

        // Remove buff if stacks reach 0
        if (this.stacks === 0) {
            const owner = this.getOwnerAsCharacter();
            if (owner) {
                owner.buffs = owner.buffs.filter(buff => buff.id !== this.id);
            }
        }
    }
}

