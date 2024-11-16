import { BaseCharacter } from "../../BaseCharacter";
import { PlayableCard } from "../../PlayableCard";
import { AbstractBuff } from "../AbstractBuff";
import { Stress } from "../standard/Stress";

export class DoNotLookAtMe extends AbstractBuff {
    constructor(stacks: number = 1) {
        super();
        this.stacks = stacks;
        this.stackable = true;
        this.imageName = "hidden-face"; // Replace with actual icon name if available
    }

    override getName(): string {
        return "DO NOT LOOK AT ME";
    }

    override getDescription(): string {
        return `Whenever targeted by a card, applies ${this.getStacksDisplayText()} Stress to the owner.`;
    }

    public onAnyCardPlayedByAnyone(playedCard: PlayableCard, target?: BaseCharacter){
        if (target && target === this.getOwnerAsCharacter()) {
            const owner = this.getOwnerAsCharacter();
            if (owner) {
                const stressBuff = new Stress(this.stacks);
                this.actionManager.applyBuffToCharacter(owner, stressBuff);
                console.log(`${owner.name} received ${this.stacks} Stress from Do Not Look At Me effect`);
            }
        }
    }
}
