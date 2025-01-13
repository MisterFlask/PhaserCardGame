import { AbstractCard } from "../../../gamecharacters/AbstractCard";
import { PlayableCard } from "../../../gamecharacters/PlayableCard";
import { ActionManager } from "../../ActionManager";
import { GameAction } from "../GameAction";

export class BasicDiscardCardsAction extends GameAction {
    constructor(private cards: AbstractCard[]) {
        super();
    }

    async playAction(): Promise<GameAction[]> {
        const actionManager = ActionManager.getInstance();
        
        this.cards.forEach(card => {
            actionManager.basicDiscardCard(card as PlayableCard);
        });

        return [];
    }
} 