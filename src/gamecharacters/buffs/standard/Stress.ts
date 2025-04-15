import { AbstractBuff } from "../AbstractBuff";

export class Stress extends AbstractBuff {
    override getDisplayName(): string {
        return "Stress";
    }

    override getDescription(): string {
        return `If you have ${this.secondaryStacks} Stress stacks, lose all Stress and then gain 1 Trauma and lose 2 Strength.`;
    }

    override id: string = "stress";
    constructor(stacks: number = 0) {
        super();
        this.imageName = "shattered-heart"; // Replace with actual icon name
        this.stacks = stacks;
        this.stackable = true;
        this.isPersistentBetweenCombats = true;
        this.secondaryStacks = 10;
        this.showSecondaryStacks = true;
    }

    override onCombatStart(): void {
        if (this.stacks < this.secondaryStacks) {
            return;
        }

        // todo
    }

}
