import { AbstractBuff } from "../AbstractBuff";

export class DesignatedFoe extends AbstractBuff {
    constructor() {
        super();
        this.stackable = false;
        this.isDebuff = true;
    }

    override getDisplayName(): string {
        return "Designated Foe";
    }

    override getDescription(): string {
        return "Marked as the designated target by a Duelist.";
    }
} 