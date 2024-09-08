import { StoreCard } from '../screens/campaign';
import { BaseCharacter } from "../gamecharacters/BaseCharacter"
import { AbstractCard, PhysicalCard } from '../gamecharacters/PhysicalCard';
import { AbstractIntent } from "../gamecharacters/AbstractIntent";

export class ActionManager {
    private static instance: ActionManager;
    private actionQueue: ActionQueue;


    private constructor() {
        this.actionQueue = new ActionQueue();
    }

    public static getInstance(): ActionManager {
        if (!ActionManager.instance) {
            ActionManager.instance = new ActionManager();
        }
        return ActionManager.instance;
    }
    
    public discardCard = (card: AbstractCard): void => {
        const gameState = GameState.getInstance();
        gameState.combatState.currentDiscardPile.push(card);
        this.actionQueue.addAction(new WaitAction(100));
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
            const originalTint = physicalCardOfTarget.cardBackground.tint;
            physicalCardOfTarget.cardBackground.setTint(0xff0000);
            
            setTimeout(() => {
                physicalCardOfTarget.cardBackground.setTint(originalTint);
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
                    target.hitpoints = Math.max(0, target.hitpoints - amount);
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

}


import Phaser from 'phaser';
import { GameState } from '../screens/gamestate';

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
