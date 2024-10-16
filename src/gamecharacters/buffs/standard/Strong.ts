import { AbstractBuff } from "../AbstractBuff";
export class Strong extends AbstractBuff {
    override getName(): string {
        return "Strong"
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
