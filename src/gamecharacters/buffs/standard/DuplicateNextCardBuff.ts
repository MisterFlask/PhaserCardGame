import { ActionManager } from "../../../utils/ActionManager";
import { PlayableCard } from "../../PlayableCard";
import { AbstractBuff } from "../AbstractBuff";

export class DuplicateNextCardBuff extends AbstractBuff {
    constructor() {
        super();
        this.isDebuff = false;
    }

    getDisplayName(): string {
        return "Duplicate Next Card";
    }

    getDescription(): string {
        return "When you play this card, create a copy of it in your hand.";
    }

    onCardPlayed(card: PlayableCard): void {
        // Create a copy of the card and add it to hand
        const cardCopy = card.Copy();
        ActionManager.getInstance().createCardToHand(cardCopy);
        
        // Remove this buff after use
        card.buffs = card.buffs.filter(buff => buff !== this);
    }
} 