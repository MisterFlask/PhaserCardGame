import { GameState } from "../../../rules/GameState";
import { AbstractBuff } from "../AbstractBuff";

export class DespairNexus extends AbstractBuff {
    constructor(stacks: number = 1) {
        super();
        this.stacks = stacks;
        this.isDebuff = true;
    }

    override getDisplayName(): string {
        return "Despair Nexus";
    }

    override getDescription(): string {
        return `At the end of each turn, decrease all resource counts by ${this.getStacksDisplayText()}.`;
    }

    override onTurnEnd(): void {
        const gameState = GameState.getInstance();
        const combatResources = gameState.combatState.combatResources;
        combatResources.resources().forEach((resource) => {
            resource.value = Math.max(0, resource.value - this.stacks);
        });
    }
}
