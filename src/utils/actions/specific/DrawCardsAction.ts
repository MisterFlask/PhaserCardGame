import { PlayableCard } from "../../../gamecharacters/PlayableCard";
import { ProcBroadcaster } from "../../../gamecharacters/procs/ProcBroadcaster";
import { DeckLogic } from "../../../rules/DeckLogicHelper";
import { GameState } from "../../../rules/GameState";
import { GameAction } from "../GameAction";
import { WaitAction } from "../WaitAction";

export class DrawCardsAction extends GameAction {
    constructor(
        private count: number, 
        private callback?: (cards: PlayableCard[]) => void
    ) {
        super();
    }

    async playAction(): Promise<GameAction[]> {
        const deckLogic = DeckLogic.getInstance();
        const gameState = GameState.getInstance();
        const drawnCards: PlayableCard[] = [];

        // Add a small delay after drawing each card
        for (let i = 0; i < this.count; i++) {
            const drawnCard = deckLogic.drawCards(1)[0];
            
            if (!drawnCard) {
                console.warn("No card drawn");
                break;
            }
            
            // Trigger onCardDrawn buffs
            drawnCard.buffs.forEach(buff => {
                buff.onCardDrawn();
            });
            
            // Trigger onAnyCardDrawn for relics and buffs
            ProcBroadcaster.getInstance().retrieveAllRelevantBuffsForProcs(true, false).forEach(buff => {
                buff.onAnyCardDrawn?.(drawnCard);
            });

            // Animate draw and wait
            await this.animateDrawCard(drawnCard);
            await new WaitAction(50).playAction();
            drawnCards.push(drawnCard);
        }

        const combatState = gameState.combatState;

        console.log('Cards drawn:', drawnCards.map(card => card.name));
        console.log('Updated hand:', combatState.currentHand.map(card => card.name));

        // Call optional callback
        this.callback?.(drawnCards);

        return [];
    }

    private animateDrawCard(card: PlayableCard): Promise<void> {
        return new Promise<void>((resolve) => {
            // Implement draw animation logic here
            console.log(`Animating draw for card: ${card.name}`);
            // Example animation delay
            setTimeout(() => resolve(), 20);
        });
    }
} 