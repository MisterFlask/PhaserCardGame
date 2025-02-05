import { IBaseCharacter } from "../../IBaseCharacter";
import { AbstractBuff } from "../AbstractBuff";
import { Burning } from "./Burning";

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
        return `Caps the amount of damage received from an attack to ${this.getStacksDisplayText()}.  Whenever Burning is applied to this character, takes ${this.getStacksDisplayText()} damage.`;
    }

    override getDamagePerHitCappedAt(): number {
        return this.stacks;
    }

    override onBuffApplied(sourceOfBuff: IBaseCharacter, buffApplied: AbstractBuff, previousStacks: number, changeInStacks: number): void {
        var character = this.getOwnerAsCharacter()
        if (buffApplied instanceof Burning) {
            this.actionManager.dealDamage({baseDamageAmount: this.stacks, target: character!, fromAttack: false});
        }
    }

}
