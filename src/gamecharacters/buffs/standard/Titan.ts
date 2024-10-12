import { AbstractBuff } from "../AbstractBuff";

export class Titan extends AbstractBuff {
    
    constructor(stacks: number) {
        super();
        this.stacks = stacks;
        this.stackable = true;
        
    }
    override getName(): string {
        return "Titan";
    }
    
    override getCombatDamageTakenModifier(): number {
        return -1 * this.stacks;
    }

    override getDescription(): string {
        return `Decreases all incoming damage by ${this.stacks}.`;
    }
}

