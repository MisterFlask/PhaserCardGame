import { GameState } from "../../../rules/GameState";
import { AbstractBuff } from "../AbstractBuff";

export class Undersider extends AbstractBuff {
    constructor(stacks: number = 1) {
        super();
        this.stacks = stacks;
        this.isDebuff = false;
        this.isPersistentBetweenCombats = true;
        this.isPersonaTrait = true;
    }

    override getDisplayName(): string {
        return "Undersider";
    }

    override getDescription(): string {
        return `At the start of your run, gain ${this.getStacksDisplayText()} Hell Currency.`;
    }

    override onRunStart(): void {
        const gameState = GameState.getInstance();
        gameState.sovereignInfernalNotes += this.stacks;
    }
}
