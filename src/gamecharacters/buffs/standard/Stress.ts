import { AbstractBuff } from "../AbstractBuff";
import { Lethality } from "./Strong";

export class Stress extends AbstractBuff {
    override getDisplayName(): string {
        return "Stress";
    }

    override getDescription(): string {
        return `For every ${this.secondaryStacks} Stress stacks, enemies start combat with 1 more Lethality.`;
    }

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
        this.forEachEnemy((enemy) => {
            this.actionManager.applyBuffToCharacterOrCard(enemy, new Lethality(Math.floor(this.stacks / 10)));
        });
    }

}
