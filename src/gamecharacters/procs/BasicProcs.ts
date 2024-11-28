import { AbstractCombatEvent } from "../../rules/AbstractCombatEvent";
import { GameState } from "../../rules/GameState";
import { ActionManagerFetcher } from "../../utils/ActionManagerFetcher";
import { AutomatedCharacter } from "../AutomatedCharacter";
import type { BaseCharacter } from "../BaseCharacter";
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

    /**
     * Takes away energy from the player's pool up to the maxEnergyExerted, and calls the callback with the amount of energy exerted.
     * @param card - The card that is exerting energy.
     * @param maxEnergyExerted - The maximum amount of energy to exert.
     * @param callback - A callback function that is called with the amount of energy exerted.
     */
    public Exert(card: PlayableCard, maxEnergyExerted: number, callback: (energyExerted: number) => void): void {
        const gameState = GameState.getInstance();
        const combat = gameState.combatState;
        const energyRemaining = combat.energyAvailable;
        const energyExerted = Math.min(maxEnergyExerted, energyRemaining);
        if (energyExerted == 0){
            console.log(`${card.name} has no energy to exert`);
            return;
        }
        console.log(`Exerting ${energyExerted} energy from ${card.name}`);
        callback(energyExerted);
        combat.energyAvailable -= energyExerted;
        ProcBroadcaster.getInstance().broadcastCombatEvent(new ExertEvent(card, energyExerted));
    }

    public Barrage(card: PlayableCard): void {
        ActionManagerFetcher.getActionManager().requireCardSelection(
            { name:"Barrage", 
                instructions: "Select cards to discard.", 
                min: 1, 
                max: 10, 
                cancellable: true, 
                action: (selectedCards: PlayableCard[]) => {
                    if (selectedCards.length > 0) {
                        selectedCards.forEach(card => {
                            ActionManagerFetcher.getActionManager().activeDiscardCard(card);
                        });
                        ProcBroadcaster.getInstance().broadcastCombatEvent(new BarrageEvent(card, selectedCards));
                    }
                }
        });
    }

    public Taunt(target: AutomatedCharacter, owner: BaseCharacter): void {
        ActionManagerFetcher.getActionManager().DoAThing("Taunt", () => {
            target.intents.forEach(intent => {
                if (intent.target) {
                    intent.target = owner;
                }
            });
            ProcBroadcaster.getInstance().broadcastCombatEvent(new TauntEvent(target, owner));
        });
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

export class ExertEvent extends AbstractCombatEvent {
    constructor(public card: PlayableCard, public energyExerted: number) {
        super();
    }

    override printJson(): void {
        console.log(`{"event": "ExertEvent", "card": "${this.card.name}", "energyExerted": ${this.energyExerted}}`);
    }
}

export class BarrageEvent extends AbstractCombatEvent {
    constructor(public sourceCard: PlayableCard, public discardedCards: PlayableCard[]) {
        super();
    }

    override printJson(): void {
        console.log(`{"event": "BarrageEvent", "sourceCard": "${this.sourceCard.name}", "discardedCards": [${this.discardedCards.map(card => `"${card.name}"`).join(', ')}]}`);
    }
}

export class TauntEvent extends AbstractCombatEvent {
    constructor(public target: AutomatedCharacter, public owner: BaseCharacter) {
        super();
    }

    override printJson(): void {
        console.log(`{"event": "TauntEvent", "target": "${this.target.name}", "owner": "${this.owner.name}"}`);
    }
}
