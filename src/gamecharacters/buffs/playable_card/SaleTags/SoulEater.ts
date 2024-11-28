import { AbstractBuff } from "../../AbstractBuff";

export class SoulEater extends AbstractBuff {
    constructor(stacks: number = 1) {
        super();
        this.imageName = "soul-eater-tag";
        this.stackable = true;
        this.isDebuff = true;
        this.stacks = stacks;
    }

    override getDisplayName(): string {
        return "Soul Eater";
    }

    override getDescription(): string {
        return `When acquired, reduces max HP by ${this.stacks}.`;
    }

    override onGainingThisCard(): void {
        const owner = this.getOwnerAsPlayableCard();
        if (owner?.owningCharacter) {
            owner.owningCharacter.maxHitpoints -= this.stacks;
            // Ensure current HP doesn't exceed new max
            if (owner.owningCharacter.hitpoints > owner.owningCharacter.maxHitpoints) {
                owner.owningCharacter.hitpoints = owner.owningCharacter.maxHitpoints;
            }
        }
    }
}
