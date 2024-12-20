import { AbstractBuff } from "../AbstractBuff";

export class RetainBuff extends AbstractBuff {
    constructor() {
        super();
        this.isDebuff = false;
    }

    override getDisplayName(): string {
        return "Retain";
    }

    override getDescription(): string {
        return "This card is not discarded at end of turn.";
    }

    override shouldRetainAfterTurnEnds(): boolean {
        return true;
    }
}
