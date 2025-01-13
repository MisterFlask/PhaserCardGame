import { PlayableCardType } from "../../../Types";
import { ProcBroadcaster } from "../../../gamecharacters/procs/ProcBroadcaster";
import { ActionManager } from "../../ActionManager";
import { GameAction } from "../GameAction";

export class ActiveDiscardCardAction extends GameAction {
    constructor(private card: PlayableCardType) {
        super();
    }

    async playAction(): Promise<GameAction[]> {
        const actionManager = ActionManager.getInstance();
        
        // Basic discard the card
        actionManager.basicDiscardCard(this.card);

        // Trigger onActiveDiscard for card's buffs
        for (const buff of this.card.buffs) {
            buff.onActiveDiscard();
        }
        
        // Trigger global onAnyCardDiscarded events
        ProcBroadcaster.getInstance()
            .retrieveAllRelevantBuffsForProcs(true)
            .forEach(buff => {
                buff.onAnyCardDiscarded(this.card);
            });

        return [];
    }
} 