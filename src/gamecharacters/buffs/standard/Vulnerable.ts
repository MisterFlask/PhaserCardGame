import { AbstractBuff } from "../AbstractBuff";

export class Vulnerable extends AbstractBuff {
    override getName(): string {
        return "Vulnerable";
    }

    override getDescription(): string {
        return `Increases damage taken by 50% for ${this.getStacksDisplayText()} turn[s].`;
    }

    constructor(stacks: number = 1) {
        super();
        this.imageName = "broken-shield"; // Replace with actual icon name
        this.stacks = stacks;
        this.stackable = true;
    }

    override getAdditionalPercentCombatDamageTakenModifier(): number {
        return 50; // Increases damage taken by 50%
    }

    override onTurnStart(): void {
        this.stacks--;
    }
}