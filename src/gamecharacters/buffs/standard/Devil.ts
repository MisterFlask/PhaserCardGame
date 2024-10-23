import { AbstractBuff } from "../AbstractBuff";

export class Devil extends AbstractBuff {
    constructor(stacks: number = 1) {
        super();
        this.imageName = "devil"; // Replace with actual icon name if available
        this.stackable = true;
        this.isDebuff = false;
        this.stacks = stacks;
    }

    override getName(): string {
        return "Devil";
    }

    override getDescription(): string {
        return `Takes ${this.getStacksDisplayText()} less damage from attacks.`;
    }

    override getCombatDamageTakenModifier(): number {
        return -this.stacks;
    }
}
