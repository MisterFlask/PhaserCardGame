import { StoreCard } from '../screens/campaign';
import { BaseCharacter } from '../gamecharacters/AbstractCard';
import { AbstractCard, PhysicalCard } from '../gamecharacters/PhysicalCard';

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

    public dealDamage(amount: number,
        target: any,
        sourceCharacter?: BaseCharacter,
        sourceCard?: AbstractCard): void {
        //todo
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