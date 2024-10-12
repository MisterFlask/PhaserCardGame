import { GameState } from "../../../rules/GameState";
import { AbstractBuff } from "../AbstractBuff";

export class Prepper extends AbstractBuff {
    constructor(stacks: number = 1) {
        super();
        this.stacks = stacks;
        this.isDebuff = false;
        this.isPersistentBetweenCombats = true;
        this.isPersonaTrait = true;
    }

    override getName(): string {
        return "Prepper";
    }

    override getDescription(): string {
        return `At the start of combat, ${this.getStacksDisplayText()}% chance to gain 1 energy.`;
    }

    override onCombatStart(): void {
        const gameState = GameState.getInstance();
        const combatState = gameState.combatState;

        if (Math.random() < (this.stacks / 100.0)) {
            combatState.energyAvailable += 1;
            console.log("Prepper triggered: Gained 1 energy at the start of combat.");
            return; // Exit after the first successful trigger
        }else{
            console.log("Prepper did not trigger: Did not gain energy at the start of combat.");
        }
    }
}
