import { AbstractBuff } from "../AbstractBuff";

export class Mighty extends AbstractBuff {
    with(callback: (item: this) => void): this {
        callback(this);
        return this;
    }

    override getDisplayName(): string {
        return "Mighty"
    }

    override getDescription(): string {
        return `Increases damage by ${this.getStacksDisplayText()}`
    }

    constructor(stacks: number = 1) {
        super()
        this.imageName = "weight-lifting-up"
        this.stacks = stacks
    }

    override getCombatDamageDealtModifier(): number {
        return this.stacks;
    }
}
