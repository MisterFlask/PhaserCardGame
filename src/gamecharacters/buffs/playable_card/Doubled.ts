import { BaseCharacter } from "../../BaseCharacter";
import { AbstractBuff } from "../AbstractBuff";

export class Doubled extends AbstractBuff {
    constructor() {
        super();
        this.imageName = "doubled";
    }

    override getDisplayName(): string {
        return "Then, do it again.";
    }

    override getDescription(): string {
        return "Then, do it again.";
    }

    override onThisCardInvoked(target?: BaseCharacter): void {
        // Invoke the card's effects a second time
        this.getOwnerAsPlayableCard()!.InvokeCardEffects(target);
        // now do it for the cards' OTHER buffs
        this.getOwnerAsPlayableCard()!.buffs.forEach(buff => {
            if (buff !instanceof Doubled){
                buff.onThisCardInvoked(target);
            }
        });
    }
}
