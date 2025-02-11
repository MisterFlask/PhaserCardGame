
import { AbstractBuff } from "../AbstractBuff";
import { Lethality } from "./Lethality";

export class GrowingPowerBuff extends AbstractBuff {
    constructor(stacks: number = 1) {
        super();
        this.stacks = stacks;
        this.isDebuff = false;
        this.imageName = "enrage";
    }

    override getDisplayName(): string {
        return "Growing Power";
    }

    override getDescription(): string {
        return `At the beginning of each turn, gain ${this.getStacksDisplayText()} Lethality.`;
    }


    override onTurnStart(): void {
        const owner = this.getOwnerAsCharacter();
        if (owner) {
            this.actionManager.applyBuffToCharacterOrCard(owner, new Lethality(this.stacks));
        }

        const ownerCard = this.getOwnerAsPlayableCard();
        if (ownerCard) {
            ownerCard.baseDamage += this.stacks;
        }
    }   
}
