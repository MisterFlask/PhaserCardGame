import { AbstractBuff } from "../../AbstractBuff";

export class SoulEater extends AbstractBuff {
    constructor(stacks: number = 1) {
        super();
        this.imageName = "soul-eater-tag";
        this.stackable = true;
        this.isDebuff = true;
        this.stacks = stacks;
    }

    override getName(): string {
        return "Soul Eater";
    }

    override getDescription(): string {
        return `When acquired, reduces max HP by ${this.stacks}.`;
    }

    override onAcquisition(): void {
        const owner = this.getOwnerAsPlayableCard();
        if (owner?.owner) {
            owner.owner.maxHitpoints -= this.stacks;
            // Ensure current HP doesn't exceed new max
            if (owner.owner.hitpoints > owner.owner.maxHitpoints) {
                owner.owner.hitpoints = owner.owner.maxHitpoints;
            }
        }
    }
}