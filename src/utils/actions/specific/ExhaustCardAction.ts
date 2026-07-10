import { PlayableCardType } from "../../../Types";
import { ProcBroadcaster } from "../../../gamecharacters/procs/ProcBroadcaster";
import { DeckLogic, PileName } from "../../../rules/DeckLogicHelper";
import { backgroundResistantDelay } from "../../BackgroundResistantDelay";
import { GameAction } from "../GameAction";
import { ModifyAshesAction } from "./ModifyCombatResourceAction";
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

        // Pyre economy: exhausting one of the player's cards grants 1 Ash.
        // This action is the single choke point for gameplay exhausts —
        // everything routes through ActionManager.exhaustCard (including
        // Sacrifice via BasicProcs), which queues this action; the grant
        // lives here beside the onExhaust/onAnyCardExhausted procs so the
        // two can never disagree about what counts as "exhausted". Direct
        // DeckLogic.moveCardToPile(PileName.Exhaust) placements (power
        // consumption after play, transform-removals) deliberately skip
        // exhaust procs and likewise grant nothing. Queued as a child
        // ModifyAshesAction — the same path ActionManager.modifyAshes uses —
        // so the resource display pulses on the value change.
        return [new ModifyAshesAction(1)];
    }
} 