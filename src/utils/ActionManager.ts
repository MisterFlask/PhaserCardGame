import { BaseCharacter } from "../gamecharacters/BaseCharacter";
import { StoreCard } from '../screens/campaign';
import { PhysicalCard } from '../ui/PhysicalCard';

export class ActionManager {
    private static instance: ActionManager;
    private actionQueue: ActionQueue;

    private constructor() { // Modified constructor
        this.actionQueue = new ActionQueue();
    }

    public static getInstance(): ActionManager { // Modified getInstance
        if (!ActionManager.instance) {
            ActionManager.instance = new ActionManager();
        }
        return ActionManager.instance;
    }

    public playCard(card: PhysicalCard, target?: BaseCharacter) {
        this.actionQueue.addAction(new GenericAction(async () => {
            const playableCard = card.data as PlayableCard;
            
            let canBePlayed = playableCard.IsPerformableOn(target);
            if (!canBePlayed){
                return [];
            }

            if (target) {
                GameState.getInstance().combatState.energyAvailable -= playableCard.energyCost;
                playableCard.InvokeCardEffects(target);
            } else {
                playableCard.InvokeCardEffects();
            }

            DeckLogic.moveCardToPile(card.data, PileName.Discard);
            await this.animateDiscardCard(card);
            return [];
        }));
    }

    private animateDrawCard(card: AbstractCard): Promise<void> {
        return new Promise<void>((resolve) => {
            // Implement draw animation logic here
            console.log(`Animating draw for card: ${card.name}`);
            // Example animation delay
            setTimeout(() => resolve(), 20);
        });
    }

    private animateDiscardCard(card: PhysicalCard): Promise<void> {
        return new Promise<void>((resolve) => {
            // Implement discard animation logic here
            console.log(`Animating discard for card: ${card.data.name}`);
            // Example animation delay
            setTimeout(() => resolve(), 20);
        });
    }

    public discardCard = (card: AbstractCard): void => {
        this.actionQueue.addAction(new GenericAction(async () => {
            DeckLogic.moveCardToPile(card, PileName.Discard);
            await this.animateDiscardCard(card.physicalCard as PhysicalCard);
            await new WaitAction(20).playAction();
            return [];
        }));
    }

    public drawHandForNewTurn(): void {
        console.log('Drawing hand for new turn');
        const gameState = GameState.getInstance();
        const combatState = gameState.combatState;
        const handSize = 3; // Assuming a hand size of 3 cards

        this.drawCards(handSize);

        console.log('State of all piles:');
        console.log('Draw Pile:', combatState.currentDrawPile.map(card => card.name));
        console.log('Discard Pile:', combatState.currentDiscardPile.map(card => card.name));
        console.log('Hand:', combatState.currentHand.map(card => card.name));
    }

    public drawCards(count: number): void {
        this.actionQueue.addAction(new GenericAction(async () => {
            const deckLogic = DeckLogic.getInstance();
            const drawnCards: AbstractCard[] = [];
            // Add a small delay after drawing each card
            for (let i = 0; i < count; i++) {
                const drawnCard = deckLogic.drawCards(1)[0];
                await this.animateDrawCard(drawnCard);
                await new WaitAction(50).playAction();
                drawnCards.push(drawnCard);
            }

            const gameState = GameState.getInstance();
            const combatState = gameState.combatState;
            

            console.log('Cards drawn:', drawnCards.map(card => card.name));
            console.log('Updated hand:', combatState.currentHand.map(card => card.name));

            return [];
        }));
    }
    public applyBlock(params: {
        block: number,
        appliedViaPlayableCard?: AbstractCard,
        blockSourceCharacter?: BaseCharacter,
        blockTargetCharacter?: BaseCharacter
    }): void {
        const { block, blockTargetCharacter } = params;
        console.log("Called ApplyBlock method in action manager. Block: " + block + " Target: " + blockTargetCharacter?.name);

        if (!blockTargetCharacter) {
            return;
        }

        this.actionQueue.addAction(new GenericAction(async () => {
            console.log("Applying block to " + blockTargetCharacter.name);
            // Get the physical card of the target character
            const targetPhysicalCard = (blockTargetCharacter as any).physicalCard as PhysicalCard;
            
            if (targetPhysicalCard && targetPhysicalCard.blockText) {
                // Pulse the block text box
                targetPhysicalCard.blockText.pulseGreenBriefly()
            }
            blockTargetCharacter.block += block;
            return [];
        }));
    }


    private animateCardDamage(physicalCardOfTarget: PhysicalCard): Promise<void> {
        return new Promise<void>((resolve) => {
            // Shake the card
            const originalX = physicalCardOfTarget.container.x;
            const shakeDistance = 5;
            const shakeDuration = 50;
            const shakeCount = 3;

            let currentShake = 0;
            const shakeInterval = setInterval(() => {
                if (currentShake >= shakeCount * 2) {
                    clearInterval(shakeInterval);
                    physicalCardOfTarget.container.x = originalX;
                } else {
                    physicalCardOfTarget.container.x += (currentShake % 2 === 0) ? shakeDistance : -shakeDistance;
                    currentShake++;
                }
            }, shakeDuration);
            // Flicker the card red
            let originalTint: number;
            if (physicalCardOfTarget.cardBackground instanceof Phaser.GameObjects.Image) {
                originalTint = physicalCardOfTarget.cardBackground.tint;
                physicalCardOfTarget.cardBackground.setTint(0xff0000);
            } else if (physicalCardOfTarget.cardBackground instanceof Phaser.GameObjects.Rectangle) {
                originalTint = physicalCardOfTarget.cardBackground.fillColor;
                physicalCardOfTarget.cardBackground.setFillStyle(0xff0000);
            }

            setTimeout(() => {
                if (physicalCardOfTarget.cardBackground instanceof Phaser.GameObjects.Image) {
                    physicalCardOfTarget.cardBackground.setTint(originalTint);
                } else if (physicalCardOfTarget.cardBackground instanceof Phaser.GameObjects.Rectangle) {
                    physicalCardOfTarget.cardBackground.setFillStyle(originalTint);
                }
                resolve();
            }, 300);

        });
    }
    public dealDamage = ({
        amount,
        target,
        sourceCharacter,
        sourceCard
    }: {
        amount: number,
        target: AbstractCard,
        sourceCharacter?: BaseCharacter,
        sourceCard?: AbstractCard
    }): void => {
        const physicalCardOfTarget = target.physicalCard as PhysicalCard;
        if (!physicalCardOfTarget) {
            return;
        }

        if (physicalCardOfTarget) {
            const damageAction = new GenericAction(async () => {
                await this.animateCardDamage(physicalCardOfTarget);

                if (target instanceof BaseCharacter) {
                    let remainingDamage = amount;
                    if (target.block > 0) {
                        if (target.block >= remainingDamage) {
                            target.block -= remainingDamage;
                            remainingDamage = 0;
                        } else {
                            remainingDamage -= target.block;
                            target.block = 0;
                        }
                    }
                    if (remainingDamage > 0) {
                        target.hitpoints = Math.max(0, target.hitpoints - remainingDamage);
                    }
                }

                return [];
            });

            this.actionQueue.addAction(damageAction);
        }
    }

    public purchaseShopItem(item: StoreCard): void {
        item.OnPurchase();
        const inventory = GameState.getInstance().getInventory();
        inventory.push(item);
        GameState.getInstance().setShopItems(GameState.getInstance().getShopItems().filter(i => i !== item));
    }

    public async resolveActions(): Promise<void> {
        await this.actionQueue.resolveActions();
    }
    public discardCards(cards: AbstractCard[]): void {
        // Queue discarding multiple cards
        this.actionQueue.addAction(new GenericAction(async () => {
            cards.forEach(card => {
                this.discardCard(card);
            });
            return [];
        }));
    }

}

import Phaser from 'phaser';
import { AbstractCard, PlayableCard } from '../gamecharacters/AbstractCard';
import { DeckLogic, PileName } from "../rules/DeckLogic";
import { GameState } from '../rules/GameState';

export abstract class GameAction {
    abstract playAction(): Promise<GameAction[]>;
}

export class ActionQueue {
    private queue: GameAction[] = [];
    private isResolving: boolean = false;

    addAction(action: GameAction): void {
        this.queue.push(action);
        if (!this.isResolving) {
            this.resolveActions();
        }
    }

    async resolveActions(): Promise<void> {
        if (this.isResolving) return;
        this.isResolving = true;

        while (this.queue.length > 0) {
            const currentAction = this.queue.shift();
            if (currentAction) {
                const newActions = await currentAction.playAction();
                this.queue.unshift(...newActions);
            }
            // Add a small delay to allow for animations and prevent blocking
            await new Promise(resolve => setTimeout(resolve, 50));
        }

        this.isResolving = false;
    }
}


export class DealDamageAction extends GameAction {
    constructor(private amount: number,
        private target: BaseCharacter,
        private sourceCharacter?: BaseCharacter,
        private sourceCard?: AbstractCard) {
        super();
    }

    async playAction(): Promise<GameAction[]> {
        console.log(`Dealing ${this.amount} damage to ${this.target} from ${this.sourceCharacter?.name} with ${this.sourceCard?.name}`);
        // In a real game, you'd apply the damage to the target here
        // Simulate a delay for animation
        await new Promise(resolve => setTimeout(resolve, 500));
        return []; // Return any follow-up actions if needed
    }
}
export class GenericAction extends GameAction {
    constructor(private actionFunction: () => Promise<GameAction[]>) {
        super();
    }

    async playAction(): Promise<GameAction[]> {
        return await this.actionFunction();
    }
}

export class WaitAction extends GameAction {
    constructor(private milliseconds: number) {
        super();
    }

    async playAction(): Promise<GameAction[]> {
        await new Promise(resolve => setTimeout(resolve, this.milliseconds));
        return [];
    }
}
