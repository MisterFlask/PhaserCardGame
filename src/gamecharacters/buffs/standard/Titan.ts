import { AbstractBuff } from "../AbstractBuff";

export class Titan extends AbstractBuff {
    
    constructor(stacks: number) {
        super();
        this.stacks = stacks;
        this.stackable = true;
        this.imageName = "giant";
        
    }
    override getDisplayName(): string {
        return "Titan";
    }
    
    override getCombatDamageTakenModifier(): number {
        return -1 * this.stacks;
    }

    override getDescription(): string {
        return `Decreases all incoming attack damage by ${this.stacks}.`;
    }
}

