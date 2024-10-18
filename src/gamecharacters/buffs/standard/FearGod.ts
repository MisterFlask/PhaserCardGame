import type { BaseCharacter } from "../../BaseCharacter";
import type { IBaseCharacter } from "../../IBaseCharacter";
import { PlayableCard } from "../../PlayableCard";
import { AbstractBuff } from "../AbstractBuff";
import { Stress } from "./Stress";

export class FearGod extends AbstractBuff {
    private cardsPlayedThisTurn: number = 0;

    constructor(stacks: number = 1) {
        super();
        this.stacks = stacks;
        this.isDebuff = false;
    }

    override getName(): string {
        return "Fear God";
    }

    override getDescription(): string {
        return `The first ${this.getStacksDisplayText()} card(s) played each turn gain Phobia.`;
    }

    override onTurnStart(): void {
        this.cardsPlayedThisTurn = 0;
    }

    override onAnyCardPlayed(playedCard: PlayableCard, target?: IBaseCharacter): void {
        if (this.cardsPlayedThisTurn < this.stacks) {
            this.actionManager.applyBuffToCard(playedCard, new PhobiaBuff());
            this.cardsPlayedThisTurn++;
        }
    }
}

class PhobiaBuff extends AbstractBuff {
    constructor() {
        super();
        this.isDebuff = true;
    }

    override getName(): string {
        return "Phobia";
    }

    override getDescription(): string {
        return "When played, apply 1 Stress to its owner.";
    }

    override onThisCardInvoked(target?: IBaseCharacter): void {
        const owner = this.getOwnerAsPlayableCard();
        if (owner && owner.owner) {
            this.actionManager.applyBuffToCharacter(owner.owner as BaseCharacter, new Stress(1));
        }
    }
}
