import { ActionQueue, GameAction } from './ActionQueue';
import { StoreCard } from '../screens/campaign';
import { GameState } from '../screens/gamestate';
import { BaseCharacter } from '../gamecharacters/AbstractCard';
import { AbstractCard } from '../gamecharacters/PhysicalCard';

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
        this.actionQueue.addAction(new DealDamageAction(amount, target, sourceCharacter, sourceCard));
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

export class DealDamageAction extends GameAction {
    constructor(private amount: number, 
        private target: BaseCharacter,
        private sourceCharacter?: BaseCharacter,
        private sourceCard?: AbstractCard) {
        super();
    }

    playAction(): GameAction[] {
        console.log(`Dealing ${this.amount} damage to ${this.target} from ${this.sourceCharacter?.name} with ${this.sourceCard?.name}`);
        // In a real game, you'd apply the damage to the target here
        return []; // Return any follow-up actions if needed
    }
}