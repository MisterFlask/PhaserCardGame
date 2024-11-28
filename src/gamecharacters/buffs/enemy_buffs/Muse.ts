import { PlayableCard } from "../../PlayableCard";
import { AbstractBuff } from "../AbstractBuff";
import { Lethality } from "../standard/Strong";

export class Muse extends AbstractBuff {
    constructor(stacks: number = 1) {
        super();
        this.stacks = stacks;
        this.isDebuff = false;
    }

    override getDisplayName(): string {
        return "Muse";
    }

    override getDescription(): string {
        return `Whenever a cost 0 card is played, gain ${this.getStacksDisplayText()} Strength.`;
    }

    override onAnyCardPlayedByAnyone(playedCard: PlayableCard): void {
        if (playedCard.baseEnergyCost === 0) {
            const owner = this.getOwnerAsCharacter();
            if (owner) {
                this.actionManager.applyBuffToCharacterOrCard(owner, new Lethality(this.stacks));
            }
        }
    }
}
