import { PlayableCard } from "../../PlayableCard";
import { AbstractBuff } from "../AbstractBuff";
import { Strong } from "../standard/Strong";

export class Muse extends AbstractBuff {
    constructor(stacks: number = 1) {
        super();
        this.stacks = stacks;
        this.isDebuff = false;
    }

    override getName(): string {
        return "Muse";
    }

    override getDescription(): string {
        return `Whenever a cost 0 card is played, gain ${this.getStacksDisplayText()} Strength.`;
    }

    override onAnyCardPlayed(playedCard: PlayableCard): void {
        if (playedCard.energyCost === 0) {
            const owner = this.getOwnerAsCharacter();
            if (owner) {
                this.actionManager.applyBuffToCharacter(owner, new Strong(this.stacks));
            }
        }
    }
}
