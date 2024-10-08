import { AbstractBuff } from "../AbstractBuff";

export class Weak extends AbstractBuff {
    override getName(): string {
        return "Weak";
    }

    override getDescription(): string {
        return `Reduces damage dealt by 33% for ${this.getStacksDisplayText()} turn[s].`;
    }

    constructor(stacks: number = 1) {
        super();
        this.imageName = "fist-weakness"; // Replace with actual icon name
        this.stacks = stacks;
        this.stackable = true;
    }

    override getAdditionalPercentCombatDamageDealtModifier(): number {
        return -33; // Reduces damage dealt by 33%
    }

    override onTurnStart(): void {
        this.stacks--;
    }
}