import { AbstractBuff } from "../../AbstractBuff";
import { Weak } from "../../standard/Weak";

/**
 * Archon perk. Combat-start Weak applied to all enemies, same proven shape
 * as persona/BlindingTattoo.ts.
 */
export class ReadTheRiotAct extends AbstractBuff {
    constructor(stacks: number = 1) {
        super();
        this.stacks = stacks;
        this.isDebuff = false;
        this.isPersistentBetweenCombats = true;
        this.isPersonaTrait = true;
    }

    override getDisplayName(): string {
        return "Read the Riot Act";
    }

    override getDescription(): string {
        return `At the start of combat, apply ${this.getStacksDisplayText()} Weak to all enemies. A formal notice, read aloud, that the Company disapproves of their conduct.`;
    }

    override onCombatStart(): void {
        const enemies = this.gameState.combatState.enemies;
        for (const enemy of enemies) {
            this.actionManager.applyBuffToCharacter(enemy, new Weak(this.stacks));
        }
    }
}
