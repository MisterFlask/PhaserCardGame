import { PlayableCardType } from "../../../Types";
import { ProcBroadcaster } from "../../../gamecharacters/procs/ProcBroadcaster";
import { DeckLogic, PileName } from "../../../rules/DeckLogicHelper";
import { backgroundResistantDelay } from "../../BackgroundResistantDelay";
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
        await new Promise<void>((resolve) => {
            let resolved = false;
            card.physicalCard?.burnUp(async () => {
                resolved = true;
                await new WaitAction(100).playAction(); // Short delay for visual feedback
                resolve();
            });

            // Fallback in case burnUp never calls the callback
            backgroundResistantDelay(200).then(() => { // 200ms fallback; adjust as needed
                if (!resolved) {
                    console.error("burnUp callback not fired, continuing...");
                    resolve();
                }
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