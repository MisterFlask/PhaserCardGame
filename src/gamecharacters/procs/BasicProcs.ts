import { AbstractCombatEvent } from "../../rules/AbstractCombatEvent";
import { GameState } from "../../rules/GameState";
import { ActionManagerFetcher } from "../../utils/ActionManagerFetcher";
import type { PlayableCard } from "../PlayableCard";
import { ProcBroadcaster } from "./ProcBroadcaster";

export class BasicProcs {
    private static instance: BasicProcs;

    private constructor() {
        // Private constructor to prevent instantiation
    }

    public static getInstance(): BasicProcs {
        if (!BasicProcs.instance) {
            BasicProcs.instance = new BasicProcs();
        }
        return BasicProcs.instance;
    }

    public SacrificeACardOtherThan(triggeringCard?: PlayableCard): void {
        const gameState = GameState.getInstance();
        const combat = gameState.combatState;
        // step one is get the hand minus the triggering card
        let hand = combat.currentHand;
        if (triggeringCard) {
            hand = hand.filter(card => card !== triggeringCard);
        }
        if (hand.length > 0) {
            const cardToExhaust = hand.pop(); // Remove the rightmost card
            if (cardToExhaust) {
                ActionManagerFetcher.getActionManager().exhaustCard(cardToExhaust as PlayableCard);
                ProcBroadcaster.getInstance().broadcastCombatEvent(new SacrificeEvent(cardToExhaust as PlayableCard, triggeringCard as PlayableCard));
            }
        }
    }

    public ManufactureCardToHand(card: PlayableCard): void {
        GameState.getInstance().combatState.currentHand.push(card);
        ProcBroadcaster.getInstance().broadcastCombatEvent(new ManufactureEvent(card));
    }
}


export class SacrificeEvent extends AbstractCombatEvent {
    constructor(public cardSacrificed: PlayableCard, public sacrificedTo: PlayableCard) {
        super();
    }

    override printJson(): void {
        console.log(`{"event": "SacrificeEvent", "cardSacrificed": "${this.cardSacrificed.name}", "sacrificedTo": "${this.sacrificedTo.name}"}`);
    }
}

export class ManufactureEvent extends AbstractCombatEvent {
    constructor(public cardManufactured: PlayableCard) {
        super();
    }

    override printJson(): void {
        console.log(`{"event": "ManufactureEvent", "cardManufactured": "${this.cardManufactured.name}"}`);
    }
}

