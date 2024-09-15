import { AbstractBuff } from "../../ui/PhysicalBuff";

export class Strong extends AbstractBuff {
    override getName(): string {
        return "Strong"
    }
    override getDescription(): string {
        return "Increases damage by [stacks]"
    }
    constructor() {
        super()
        this.imageName = "muscle-up"
    }

    override getCombatDamageDealtModifier(): number {
        return this.stacks;
    }
    
}
