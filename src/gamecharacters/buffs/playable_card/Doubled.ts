import { BaseCharacter } from "../../BaseCharacter";
import { AbstractBuff } from "../AbstractBuff";

export class Doubled extends AbstractBuff {
    private hasTriggered: boolean = false;

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
        // Prevent infinite recursion
        if (this.hasTriggered) {
            this.hasTriggered = false;
            return;
        }

        this.hasTriggered = true;
        // Invoke the card's effects a second time
        this.getOwnerAsPlayableCard()!.InvokeCardEffects(target);
        this.hasTriggered = false;
    }
}
