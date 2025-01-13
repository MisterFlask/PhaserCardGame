import { PlayableCardType } from "../../../Types";
import { ProcBroadcaster } from "../../../gamecharacters/procs/ProcBroadcaster";
import { DeckLogic, PileName } from "../../../rules/DeckLogicHelper";
import { GameAction } from "../GameAction";
import { WaitAction } from "../WaitAction";

export class ExhaustCardAction extends GameAction {
    constructor(private card: PlayableCardType) {
        super();
    }

    async playAction(): Promise<GameAction[]> {
        const card = this.card;
        
        // Disable standard discard after play
        card.transientUiFlag_disableStandardDiscardAfterPlay = true;

        // Burn up animation
        await new Promise<void>(resolve => {
            card.physicalCard?.burnUp(async () => {
                await new WaitAction(100).playAction(); // Short delay for visual feedback
                resolve();
            });
        });

        // Move card to exhaust pile
        DeckLogic.moveCardToPile(card, PileName.Exhaust);
        console.log(`Exhausted card ${card.name}`);

        // Trigger onExhaust for card's buffs
        for (const buff of card.buffs) {
            buff.onExhaust();
        }

        // Trigger global onAnyCardExhausted events
        ProcBroadcaster.getInstance()
            .retrieveAllRelevantBuffsForProcs(true)
            .forEach(buff => {
                buff.onAnyCardExhausted(card);
            });

        return [];
    }
} 