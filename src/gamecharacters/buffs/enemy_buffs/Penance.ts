import { BaseCharacter } from "../../BaseCharacter";
import { PlayableCard } from "../../PlayableCard";
import { AbstractBuff } from "../AbstractBuff";

export class Penance extends AbstractBuff {
    constructor(stacks: number = 1) {
        super();
        this.stacks = stacks;
        this.isDebuff = true;
    }

    override getName(): string {
        return "Penance";
    }

    override getDescription(): string {
        return `Whenever you play a card of cost 2 or less, increase its cost by ${this.getStacksDisplayText()}.`;
    }

    override onAnyCardPlayedByAnyone(playedCard: PlayableCard, target?: BaseCharacter): void {
        if (playedCard.energyCost <= 2) {
            playedCard.energyCost += this.stacks;
            console.log(`Penance increased the cost of ${playedCard.name} by ${this.stacks}. New cost: ${playedCard.energyCost}`);
        }
    }
}
