import { AbstractBuff } from "../AbstractBuff";

export class DrawOneFewerCardNextNTurns extends AbstractBuff {

    getDisplayName(): string {
        return "Draw One Fewer Card";
    }

    getDescription(): string {
        return `For the next ${this.stacks} turns, draw 1 fewer card at the beginning of turn.`;
    }

    getCardsDrawnAtStartOfTurnModifier(): number {
        return -1;
    }

    constructor(stacks: number = 1) {
        super();
        this.stacks = stacks;   
    }

    override onTurnStart(): void {
        if (this.stacks > 0) {
            this.stacks--;
        }
    }
}
