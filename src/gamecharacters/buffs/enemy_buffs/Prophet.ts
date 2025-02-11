import { PlayableCard } from "../../PlayableCard";
import { AbstractBuff } from "../AbstractBuff";
import { Foreseen } from "./Foreseen";

export class Prophet extends AbstractBuff {
    constructor(stacks: number = 1) {
        super();
        this.stacks = stacks;
        this.isDebuff = false;
        this.imageName = "forward-sun";
    }

    override getDisplayName(): string {
        return "Prophet";
    }

    override getDescription(): string {
        return "Whenever you draw a card, 20% chance to apply Foreseen to it.";
    }

    override onAnyCardDrawn(drawnCard: PlayableCard): void {
        // 20% chance to apply Foreseen
        if (Math.random() < 0.2) {
            drawnCard.buffs.push(new Foreseen(this.stacks));
        }
    }
}
