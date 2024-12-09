import { GameState } from "../../../rules/GameState";
import { AbstractBuff } from "../AbstractBuff";
import { Weak } from "../standard/Weak";

export class BlindingTattoo extends AbstractBuff {
    constructor(stacks: number = 1) {
        super();
        this.stacks = stacks;
        this.isDebuff = false;
        this.isPersistentBetweenCombats = true;
        this.isPersonaTrait = true;
    }

    override getDisplayName(): string {
        return "Blinding Tattoo";
    }

    override getDescription(): string {
        return `At the start of combat, apply ${this.getStacksDisplayText()} Weak to all enemies.`;
    }

    override onCombatStart(): void {
        const gameState = GameState.getInstance();
        const enemies = gameState.combatState.enemies;

        for (const enemy of enemies) {
            this.actionManager.applyBuffToCharacter(enemy, new Weak(this.stacks));
        }
    }
}
