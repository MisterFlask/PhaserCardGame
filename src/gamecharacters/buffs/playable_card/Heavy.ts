import { AbstractBuff } from "../AbstractBuff";
import { DrawOneFewerCardNextNTurns } from "../standard/DrawOneFewerCardNextNTurns";

export class Heavy extends AbstractBuff {
    constructor() {
        super();
    }

    getDisplayName(): string {
        return "Heavy";
    }

    getDescription(): string {
        return "When drawn, draw one fewer card next turn.";
    }

    override onCardDrawn(): void {
       // apply Draw One Fewer Card to the owner of the card
       this.actionManager.applyBuffToCharacterOrCard(this.getOwnerAsPlayableCard()?.owner!, new DrawOneFewerCardNextNTurns(1));
    }
}
