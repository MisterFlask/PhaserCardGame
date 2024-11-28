import { AbstractBuff } from "../AbstractBuff";

export class Swarm extends AbstractBuff {
    constructor(stacks: number = 1) {
        super();
        this.stacks = stacks;
        this.stackable = true;
        this.imageName = "bee-swarm"; // Replace with actual icon name if available
    }

    override getDisplayName(): string {
        return "Swarm";
    }

    override getDescription(): string {
        return `Caps the amount of damage received from an attack to ${this.getStacksDisplayText()}.`;
    }

    override getDamagePerHitCappedAt(): number {
        return this.stacks;
    }
}
